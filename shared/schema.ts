import { pgTable, text, integer, timestamp, boolean, jsonb, index, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Users table schema
export const users = pgTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Values table schema (standard values library)
export const values = pgTable("values", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  score: integer("score").default(0),
  isCustom: boolean("is_custom").default(false),
  rating: integer("rating"),
});

// User values sessions table - stores each completed values exercise
export const userValuesSessions = pgTable("user_values_sessions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  // Store the top 10 values with their customizations and ratings as JSON
  topValues: jsonb("top_values").$type<Array<{
    id: number;
    name: string;
    description: string;
    rating: number;
    score: number;
    isCustom: boolean;
  }>>().notNull(),
  // Store all values rankings if needed
  allValues: jsonb("all_values").$type<Array<{
    id: number;
    score: number;
  }>>(),
  // Store progress for incomplete sessions
  progress: jsonb("progress").$type<{
    phase: 'screening' | 'refinement' | 'rating';
    completedSets: number;
    totalSets: number;
    currentValues?: any[];
  }>(),
}, (table) => ({
  userIdIdx: index("user_values_sessions_user_id_idx").on(table.userId),
  createdAtIdx: index("user_values_sessions_created_at_idx").on(table.createdAt),
}));

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
}, (table) => ({
  expireIdx: index("sessions_expire_idx").on(table.expire),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export const insertValueSchema = createInsertSchema(values).pick({
  name: true,
  description: true,
  score: true,
  isCustom: true,
  rating: true,
});

export const insertUserValuesSessionSchema = createInsertSchema(userValuesSessions).pick({
  userId: true,
  completedAt: true,
  topValues: true,
  allValues: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Value = typeof values.$inferSelect;
export type InsertValue = z.infer<typeof insertValueSchema>;
export type UserValuesSession = typeof userValuesSessions.$inferSelect;
export type InsertUserValuesSession = z.infer<typeof insertUserValuesSessionSchema>;