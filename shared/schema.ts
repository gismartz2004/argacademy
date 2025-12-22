import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - keeping existing ID structure
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // "admin" or "user"
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

// Worlds table
export const worlds = pgTable("worlds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  professorId: text("professor_id").references(() => users.id), // Assigned professor
  imageUrl: text("image_url"),
  locked: boolean("locked").notNull().default(true),
});

export const insertWorldSchema = createInsertSchema(worlds).omit({
  id: true
});
export type InsertWorld = z.infer<typeof insertWorldSchema>;
export type World = typeof worlds.$inferSelect;

// World Content table
export const worldContent = pgTable("world_content", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => worlds.id),
  level: integer("level").notNull().default(1), // Level association
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'pdf', 'video', 'assignment'
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWorldContentSchema = createInsertSchema(worldContent).omit({
  id: true,
  createdAt: true
});
export type InsertWorldContent = z.infer<typeof insertWorldContentSchema>;
export type WorldContent = typeof worldContent.$inferSelect;

// Student Submissions table
export const studentSubmissions = pgTable("student_submissions", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => worldContent.id),
  studentId: text("student_id").notNull().references(() => users.id),
  fileUrl: text("file_url").notNull(),
  grade: integer("grade"), // 0-100
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(studentSubmissions).omit({
  id: true,
  submittedAt: true
});
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type StudentSubmission = typeof studentSubmissions.$inferSelect;

// World Students table (Many-to-Many)
export const worldStudents = pgTable("world_students", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => worlds.id),
  studentId: text("student_id").notNull().references(() => users.id),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

export const insertWorldStudentSchema = createInsertSchema(worldStudents).omit({
  id: true,
  assignedAt: true
});
export type InsertWorldStudent = z.infer<typeof insertWorldStudentSchema>;
export type WorldStudent = typeof worldStudents.$inferSelect;
