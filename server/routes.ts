import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

const createMemoryStore = MemoryStore(session);

// Extend session with user data
declare module "express-session" {
  interface SessionData {
    userId?: string;
    username?: string;
    role?: string;
  }
}

// Middleware to check if user is authenticated
const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

// Middleware to check if user is admin
const requireAdmin: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Initialize admin user
  try {
    await storage.ensureAdminExists();
  } catch (error) {
    console.error("Failed to initialize admin user:", error);
  }

  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "tech-ascent-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      store: new createMemoryStore({
        checkPeriod: 86400000, // 24 hours
      }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // ============================================
  // Authentication Routes
  // ============================================

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          avatarSkinId: user.avatarSkinId,
          totalXp: user.totalXp,
          coins: user.coins,
          currentLevelId: user.currentLevelId
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Check session
  app.get("/api/auth/session", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatarSkinId: user.avatarSkinId,
        totalXp: user.totalXp,
        coins: user.coins,
        currentLevelId: user.currentLevelId
      }
    });
  });

  // ============================================
  // Admin Routes
  // ============================================

  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        totalXp: u.totalXp,
        coins: u.coins,
        createdAt: u.createdAt
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Create user (admin only)
  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { username, password, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      // Check if username already exists
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({
        username,
        password,
        role: role || "user"
      });

      res.json({
        success: true, user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent deleting yourself
      if (id === req.session.userId) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }

      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Get all worlds (public or protected? let's make it protected for now, or at least public GET but protected modifications)
  app.get("/api/worlds", async (req, res) => {
    try {
      const allWorlds = await storage.getAllWorlds();

      if (req.session.userId) {
        const user = await storage.getUser(req.session.userId);

        // Student: Only assigned worlds
        if (user && user.role === "user") {
          const assignedIds = await storage.getStudentWorlds(user.id);
          const visibleWorlds = allWorlds.filter(w => assignedIds.includes(w.id));
          return res.json(visibleWorlds);
        }

        // Professor: Only worlds they manage
        if (user && user.role === "professor") {
          const managedWorlds = allWorlds.filter(w => w.professorId === user.id);
          return res.json(managedWorlds);
        }
      }

      // Admin sees all worlds
      res.json(allWorlds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch worlds" });
    }
  });

  // Get single world by ID
  app.get("/api/worlds/:id", async (req, res) => {
    try {
      const worldId = parseInt(req.params.id);
      const allWorlds = await storage.getAllWorlds();
      const world = allWorlds.find(w => w.id === worldId);

      if (!world) {
        return res.status(404).json({ error: "World not found" });
      }

      res.json(world);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch world" });
    }
  });

  // Create world (admin only)
  app.post("/api/admin/worlds", requireAdmin, async (req, res) => {
    try {
      const world = await storage.createWorld(req.body);

      // Create 5 default levels for the new world
      const defaultLevels = [
        { level: 1, title: "Introducción", description: "Fundamentos básicos del mundo", type: "video", fileUrl: "#" },
        { level: 2, title: "Conceptos Avanzados", description: "Profundizando en los temas", type: "pdf", fileUrl: "#" },
        { level: 3, title: "Práctica Aplicada", description: "Ejercicios prácticos", type: "assignment", fileUrl: "#" },
        { level: 4, title: "Proyecto Final", description: "Aplicación completa de conocimientos", type: "assignment", fileUrl: "#" },
        { level: 5, title: "Evaluación Final", description: "Demostración de dominio", type: "assignment", fileUrl: "#" }
      ];

      for (const levelData of defaultLevels) {
        await storage.createWorldContent({
          ...levelData,
          worldId: world.id
        });
      }

      res.json(world);
    } catch (error) {
      res.status(500).json({ error: "Failed to create world" });
    }
  });

  // Assign professor to world (admin only)
  app.patch("/api/admin/worlds/:id/professor", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { professorId } = req.body;

      const world = await storage.assignProfessorToWorld(parseInt(id), professorId);
      res.json(world);
    } catch (error) {
      res.status(500).json({ error: "Failed to assign professor" });
    }
  });

  // Assign student to world (Admin only)
  app.post("/api/admin/worlds/:id/students", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { studentId } = req.body;
      await storage.assignStudentToWorld(parseInt(id), studentId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to assign student" });
    }
  });

  // Get students assigned to world (Admin/Professor)
  app.get("/api/worlds/:id/students", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (user?.role !== "admin" && user?.role !== "professor") {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const students = await storage.getWorldStudents(parseInt(req.params.id));
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to get world students" });
    }
  });

  // ============================================
  // Existing Game Routes (now protected)
  // ============================================

  // Get current user profile
  app.get("/api/user/me", requireAuth, async (req, res) => {
    const userId = req.session.userId!;

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's owned skins
    const ownedSkins = await storage.getUserSkins(user.id);

    // Get user's completed levels
    const progress = await storage.getUserProgress(user.id);

    res.json({
      user,
      ownedSkins,
      completedLevels: progress.map(p => p.levelId)
    });
  });

  // Get user progress
  app.get("/api/progress", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(404).json({ error: "User not found" });

      const progress = await storage.getUserProgress(user.id);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // Update user progress (complete a level)
  app.post("/api/progress/complete", requireAuth, async (req, res) => {
    try {
      const { levelId, xpEarned } = req.body;
      const userId = req.session.userId!;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Mark level as complete
      await storage.markLevelComplete(user.id, levelId, xpEarned);

      // Update user totals
      const newXp = user.totalXp + xpEarned;
      const newCoins = user.coins + xpEarned;
      // If completing current level (or a higher one somehow), advance.
      // E.g. Level 3 completed -> Unlock Level 4.
      const newCurrentLevel = Math.max(user.currentLevelId, levelId + 1);

      const updatedUser = await storage.updateUserProgress(
        user.id,
        newXp,
        newCoins,
        newCurrentLevel
      );

      res.json({
        success: true,
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // Get all available skins
  app.get("/api/skins", async (req, res) => {
    const skins = await storage.getAllSkins();
    res.json(skins);
  });

  // Purchase a skin
  app.post("/api/skins/purchase", requireAuth, async (req, res) => {
    try {
      const { skinId, price } = req.body;
      const userId = req.session.userId!;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user has enough coins
      if (user.coins < price) {
        return res.status(400).json({ error: "Insufficient coins" });
      }

      // Check if already owned
      const ownedSkins = await storage.getUserSkins(user.id);
      if (ownedSkins.includes(skinId)) {
        return res.status(400).json({ error: "Skin already owned" });
      }

      await storage.purchaseSkin(user.id, skinId, price);

      // Update user coins
      await storage.updateUserProgress(user.id, user.totalXp, user.coins - price, user.currentLevelId);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to purchase skin" });
    }
  });

  // Equip a skin
  app.post("/api/skins/equip", requireAuth, async (req, res) => {
    try {
      const { skinId } = req.body;
      const userId = req.session.userId!;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify user owns the skin
      const ownedSkins = await storage.getUserSkins(user.id);
      if (!ownedSkins.includes(skinId)) {
        return res.status(400).json({ error: "Skin not owned" });
      }

      const updatedUser = await storage.updateUserSkin(user.id, skinId);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: "Failed to equip skin" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const topUsers = await storage.getTopUsers(limit);
    res.json(topUsers);
  });

  // ============================================
  // Content & Upload Routes
  // ============================================

  const multer = await import("multer");
  const upload = multer.default({
    dest: "uploads/",
    storage: multer.default.diskStorage({
      destination: "uploads/",
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
      }
    })
  });

  // Generic upload (protected)
  app.post("/api/upload", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // In a real app, you would upload this to S3 or similar.
    // For local dev, we return the local path or a served URL.
    // We need to serve the uploads directory statically.
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // List world content (protected) - anyone can view content if they have access to the world (assignments/resources)
  app.get("/api/worlds/:id/content", requireAuth, async (req, res) => {
    try {
      const content = await storage.getWorldContent(parseInt(req.params.id));
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Create content (Professor/Admin only)
  app.post("/api/worlds/:id/content", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (user?.role !== "admin" && user?.role !== "professor") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const content = await storage.createWorldContent({
        ...req.body,
        worldId: parseInt(req.params.id)
      });
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to create content" });
    }
  });

  // Submit assignment (Student)
  app.post("/api/content/:id/submit", requireAuth, async (req, res) => {
    try {
      const submission = await storage.createSubmission({
        contentId: parseInt(req.params.id),
        studentId: req.session.userId!,
        fileUrl: req.body.fileUrl,
        feedback: "",
        grade: null
      });
      res.json(submission);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit assignment" });
    }
  });

  // Get submissions for a content item (Professor/Admin)
  app.get("/api/content/:id/submissions", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (user?.role !== "admin" && user?.role !== "professor") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const submissions = await storage.getSubmissionsForContent(parseInt(req.params.id));
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  // ============================================
  // Skin/Avatar Routes
  // ============================================

  // Get all available skins
  app.get("/api/skins", async (req, res) => {
    try {
      const skins = await storage.getAllSkins();
      res.json(skins);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch skins" });
    }
  });

  // Get user's owned skins
  app.get("/api/user/skins", requireAuth, async (req, res) => {
    try {
      const userSkins = await storage.getUserSkins(req.session.userId!);
      res.json(userSkins);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user skins" });
    }
  });

  // Purchase a skin
  app.post("/api/user/skins/purchase", requireAuth, async (req, res) => {
    try {
      const { skinId } = req.body;
      const user = await storage.getUser(req.session.userId!);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const skin = await storage.getSkin(skinId);
      if (!skin) {
        return res.status(404).json({ error: "Skin not found" });
      }

      // Check if user already owns the skin
      const userSkins = await storage.getUserSkins(req.session.userId!);
      const alreadyOwned = userSkins.some(us => us.skinId === skinId);

      if (alreadyOwned) {
        return res.status(400).json({ error: "Skin already owned" });
      }

      // Check if user has enough coins
      if (user.coins < skin.price) {
        return res.status(400).json({ error: "Insufficient coins" });
      }

      // Purchase the skin
      await storage.purchaseSkin(req.session.userId!, skinId);

      // Deduct coins from user
      await storage.updateUserCoins(req.session.userId!, user.coins - skin.price);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to purchase skin" });
    }
  });

  // Update user avatar
  app.put("/api/user/avatar", requireAuth, async (req, res) => {
    try {
      const { avatarSkinId } = req.body;

      if (!avatarSkinId) {
        return res.status(400).json({ error: "Avatar skin ID required" });
      }

      // Check if user owns this skin (except for default skins)
      const defaultSkins = ['blue', 'red', 'green', 'purple'];
      if (!defaultSkins.includes(avatarSkinId)) {
        const userSkins = await storage.getUserSkins(req.session.userId!);
        const ownsSkin = userSkins.some(us => us.skinId === avatarSkinId);

        if (!ownsSkin) {
          return res.status(403).json({ error: "Skin not owned" });
        }
      }

      await storage.updateUserAvatar(req.session.userId!, avatarSkinId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update avatar" });
    }
  });

  return httpServer;
}
