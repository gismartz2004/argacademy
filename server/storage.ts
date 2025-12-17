import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
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
  InsertUserSkin
} from "@shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProgress(userId: string, xp: number, coins: number, currentLevelId: number): Promise<User>;
  updateUserSkin(userId: string, skinId: string): Promise<User>;

  // Progress methods
  getUserProgress(userId: string): Promise<UserProgress[]>;
  markLevelComplete(userId: string, levelId: number, xpEarned: number): Promise<UserProgress>;
  
  // Skin methods
  getAllSkins(): Promise<Skin[]>;
  getUserSkins(userId: string): Promise<string[]>; // Returns array of skin IDs
  purchaseSkin(userId: string, skinId: string, price: number): Promise<UserSkin>;
  
  // Leaderboard
  getTopUsers(limit: number): Promise<User[]>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(schema.users).values(insertUser).returning();
    
    // Give user the default "blue" skin
    await db.insert(schema.userSkins).values({
      userId: user.id,
      skinId: "blue"
    });
    
    return user;
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

  async getUserSkins(userId: string): Promise<string[]> {
    const ownedSkins = await db
      .select({ skinId: schema.userSkins.skinId })
      .from(schema.userSkins)
      .where(eq(schema.userSkins.userId, userId));
    
    return ownedSkins.map(s => s.skinId);
  }

  async purchaseSkin(userId: string, skinId: string, price: number): Promise<UserSkin> {
    // Deduct coins
    await db
      .update(schema.users)
      .set({ coins: db.$count(schema.users, eq(schema.users.id, userId)) })
      .where(eq(schema.users.id, userId));

    // Add skin to user
    const [userSkin] = await db
      .insert(schema.userSkins)
      .values({ userId, skinId })
      .returning();

    return userSkin;
  }

  async getTopUsers(limit: number = 10): Promise<User[]> {
    return await db
      .select()
      .from(schema.users)
      .orderBy(desc(schema.users.totalXp))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
