import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get current user profile
  app.get("/api/user/me", async (req, res) => {
    // For now, we'll use a mock user ID - in a real app this would come from auth session
    const mockUserId = "demo-user-123";
    
    let user = await storage.getUserByUsername("demo");
    
    // Create demo user if doesn't exist
    if (!user) {
      user = await storage.createUser({
        username: "demo",
        password: "demo" // In real app, this would be hashed
      });
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

  // Update user progress (complete a level)
  app.post("/api/progress/complete", async (req, res) => {
    try {
      const { levelId, xpEarned } = req.body;
      
      // Get demo user
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Mark level as complete
      await storage.markLevelComplete(user.id, levelId, xpEarned);
      
      // Update user totals
      const newXp = user.totalXp + xpEarned;
      const newCoins = user.coins + xpEarned;
      const newCurrentLevel = user.currentLevelId < levelId ? levelId + 1 : user.currentLevelId;
      
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
  app.post("/api/skins/purchase", async (req, res) => {
    try {
      const { skinId, price } = req.body;
      
      let user = await storage.getUserByUsername("demo");
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
  app.post("/api/skins/equip", async (req, res) => {
    try {
      const { skinId } = req.body;
      
      let user = await storage.getUserByUsername("demo");
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

  return httpServer;
}
