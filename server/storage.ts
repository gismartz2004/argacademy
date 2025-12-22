import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { randomUUID as crypto_randomUUID } from "crypto";
const crypto = { randomUUID: crypto_randomUUID };
import { eq, desc, and } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  UserProgress,
  InsertUserProgress,
  Skin,
  InsertSkin,
  UserSkin,
  InsertUserSkin,
  World,
  InsertWorld,
  WorldContent,
  InsertWorldContent,
  StudentSubmission,
  InsertSubmission
} from "@shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { role?: string }): Promise<User>;
  updateUserProgress(userId: string, xp: number, coins: number, currentLevelId: number): Promise<User>;
  updateUserSkin(userId: string, skinId: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(userId: string): Promise<void>;
  ensureAdminExists(): Promise<void>;

  // Progress methods
  getUserProgress(userId: string): Promise<UserProgress[]>;
  markLevelComplete(userId: string, levelId: number, xpEarned: number): Promise<UserProgress>;

  // Skin methods
  getAllSkins(): Promise<Skin[]>;
  getSkin(skinId: string): Promise<Skin | undefined>;
  getUserSkins(userId: string): Promise<UserSkin[]>;
  purchaseSkin(userId: string, skinId: string): Promise<UserSkin>;
  updateUserAvatar(userId: string, avatarSkinId: string): Promise<User>;
  updateUserCoins(userId: string, coins: number): Promise<User>;

  // Leaderboard
  getTopUsers(limit: number): Promise<User[]>;

  // Worlds
  getAllWorlds(): Promise<World[]>;
  createWorld(world: InsertWorld): Promise<World>;
  assignProfessorToWorld(worldId: number, professorId: string): Promise<World>;

  // Content & Submissions
  createWorldContent(content: InsertWorldContent): Promise<WorldContent>;
  getAllContentDebug(): Promise<WorldContent[]>;
  getWorldContent(worldId: number): Promise<WorldContent[]>;
  createSubmission(submission: InsertSubmission): Promise<StudentSubmission>;
  getSubmissionsForContent(contentId: number): Promise<StudentSubmission[]>;

  // Student World Assignments
  assignStudentToWorld(worldId: number, studentId: string): Promise<void>;
  getWorldStudents(worldId: number): Promise<string[]>; // Returns student IDs
  getStudentWorlds(studentId: string): Promise<number[]>; // Returns world IDs
}

export class DatabaseStorage implements IStorage {

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser & { role?: string }): Promise<User> {
    // Generate UUID for the user
    const userId = crypto.randomUUID();

    const [user] = await db.insert(schema.users).values({
      ...insertUser,
      id: userId
    }).returning();

    // Give user the default "blue" skin
    await db.insert(schema.userSkins).values({
      userId: user.id,
      skinId: "blue"
    });

    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete user's skins first (foreign key constraint)
    await db.delete(schema.userSkins).where(eq(schema.userSkins.userId, userId));
    // Delete user's progress
    await db.delete(schema.userProgress).where(eq(schema.userProgress.userId, userId));
    // Delete user
    await db.delete(schema.users).where(eq(schema.users.id, userId));
  }

  async ensureAdminExists(): Promise<void> {
    const admin = await this.getUserByUsername("admin");
    if (!admin) {
      await this.createUser({
        username: "admin",
        password: "admin123",
        role: "admin"
      });
      console.log("✅ Admin user created: username=admin, password=admin123");
    }
  }

  async updateUserProgress(userId: string, xp: number, coins: number, currentLevelId: number): Promise<User> {
    const [user] = await db
      .update(schema.users)
      .set({ totalXp: xp, coins, currentLevelId })
      .where(eq(schema.users.id, userId))
      .returning();
    return user;
  }

  async updateUserSkin(userId: string, skinId: string): Promise<User> {
    const [user] = await db
      .update(schema.users)
      .set({ avatarSkinId: skinId })
      .where(eq(schema.users.id, userId))
      .returning();
    return user;
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db.select().from(schema.userProgress).where(eq(schema.userProgress.userId, userId));
  }

  async markLevelComplete(userId: string, levelId: number, xpEarned: number): Promise<UserProgress> {
    // Check if already completed
    const existing = await db
      .select()
      .from(schema.userProgress)
      .where(
        and(
          eq(schema.userProgress.userId, userId),
          eq(schema.userProgress.levelId, levelId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Already completed, just return it
      return existing[0];
    }

    // Insert new completion
    const [progress] = await db
      .insert(schema.userProgress)
      .values({
        userId,
        levelId,
        completed: true,
        xpEarned,
        completedAt: new Date()
      })
      .returning();

    return progress;
  }

  async getAllSkins(): Promise<Skin[]> {
    return await db.select().from(schema.skins);
  }

  async getSkin(skinId: string): Promise<Skin | undefined> {
    const [skin] = await db.select().from(schema.skins).where(eq(schema.skins.id, skinId)).limit(1);
    return skin;
  }

  async getUserSkins(userId: string): Promise<UserSkin[]> {
    return await db
      .select()
      .from(schema.userSkins)
      .where(eq(schema.userSkins.userId, userId));
  }

  async purchaseSkin(userId: string, skinId: string): Promise<UserSkin> {
    const [userSkin] = await db
      .insert(schema.userSkins)
      .values({
        userId,
        skinId
      })
      .returning();
    return userSkin;
  }

  async updateUserAvatar(userId: string, avatarSkinId: string): Promise<User> {
    const [user] = await db
      .update(schema.users)
      .set({ avatarSkinId })
      .where(eq(schema.users.id, userId))
      .returning();
    return user;
  }

  async updateUserCoins(userId: string, coins: number): Promise<User> {
    const [user] = await db
      .update(schema.users)
      .set({ coins })
      .where(eq(schema.users.id, userId))
      .returning();
    return user;
  }

  async getTopUsers(limit: number = 10): Promise<User[]> {
    return await db
      .select()
      .from(schema.users)
      .orderBy(desc(schema.users.totalXp))
      .limit(limit);
  }

  async getAllWorlds(): Promise<World[]> {
    return await db.select().from(schema.worlds);
  }

  async createWorld(insertWorld: InsertWorld): Promise<World> {
    const [world] = await db
      .insert(schema.worlds)
      .values(insertWorld)
      .onConflictDoUpdate({
        target: schema.worlds.slug,
        set: {
          name: insertWorld.name,
          description: insertWorld.description,
          imageUrl: insertWorld.imageUrl,
          locked: insertWorld.locked
        }
      })
      .returning();
    return world;
  }

  async assignProfessorToWorld(worldId: number, professorId: string): Promise<World> {
    const [world] = await db
      .update(schema.worlds)
      .set({ professorId })
      .where(eq(schema.worlds.id, worldId))
      .returning();
    return world;
  }

  async createWorldContent(insertContent: InsertWorldContent): Promise<WorldContent> {
    const [content] = await db
      .insert(schema.worldContent)
      .values(insertContent)
      .returning();
    return content;
  }

  async getAllContentDebug(): Promise<WorldContent[]> {
    return await db.select().from(schema.worldContent);
  }

  async getWorldContent(worldId: number): Promise<WorldContent[]> {
    return await db
      .select()
      .from(schema.worldContent)
      .where(eq(schema.worldContent.worldId, worldId))
      .orderBy(desc(schema.worldContent.createdAt));
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<StudentSubmission> {
    const [submission] = await db
      .insert(schema.studentSubmissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }

  async getSubmissionsForContent(contentId: number): Promise<StudentSubmission[]> {
    return await db
      .select()
      .from(schema.studentSubmissions)
      .where(eq(schema.studentSubmissions.contentId, contentId))
      .orderBy(desc(schema.studentSubmissions.submittedAt));
  }

  async assignStudentToWorld(worldId: number, studentId: string): Promise<void> {
    // Check if already assigned
    const existing = await db
      .select()
      .from(schema.worldStudents)
      .where(and(eq(schema.worldStudents.worldId, worldId), eq(schema.worldStudents.studentId, studentId)));

    if (existing.length === 0) {
      await db.insert(schema.worldStudents).values({ worldId, studentId });
    }
  }

  async getWorldStudents(worldId: number): Promise<string[]> {
    const students = await db
      .select({ studentId: schema.worldStudents.studentId })
      .from(schema.worldStudents)
      .where(eq(schema.worldStudents.worldId, worldId));
    return students.map(s => s.studentId);
  }

  async getStudentWorlds(studentId: string): Promise<number[]> {
    const assignments = await db
      .select({ worldId: schema.worldStudents.worldId })
      .from(schema.worldStudents)
      .where(eq(schema.worldStudents.studentId, studentId));
    return assignments.map(a => a.worldId);
  }
}

export const storage = new DatabaseStorage();
