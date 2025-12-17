import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - keeping existing ID structure
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatarSkinId: text("avatar_skin_id").notNull().default("blue"),
  totalXp: integer("total_xp").notNull().default(0),
  coins: integer("coins").notNull().default(0),
  currentLevelId: integer("current_level_id").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User Progress table
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  levelId: integer("level_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  xpEarned: integer("xp_earned").notNull().default(0),
  completedAt: timestamp("completed_at"),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ 
  id: true 
});
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

// Skins table
export const skins = pgTable("skins", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull().default(0),
  rarity: text("rarity").notNull().default("common"),
  imageUrl: text("image_url").notNull(),
});

export const insertSkinSchema = createInsertSchema(skins);
export type InsertSkin = z.infer<typeof insertSkinSchema>;
export type Skin = typeof skins.$inferSelect;

// User Owned Skins
export const userSkins = pgTable("user_skins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  skinId: text("skin_id").notNull().references(() => skins.id),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
});

export const insertUserSkinSchema = createInsertSchema(userSkins).omit({ 
  id: true, 
  purchasedAt: true 
});
export type InsertUserSkin = z.infer<typeof insertUserSkinSchema>;
export type UserSkin = typeof userSkins.$inferSelect;
