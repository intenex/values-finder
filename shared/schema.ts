import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";

// Users table schema
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Values table schema (standard values library)
export const values = sqliteTable("values", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  score: integer("score").default(0),
  isCustom: integer("is_custom", { mode: "boolean" }).default(false),
  rating: integer("rating"),
});

// User values sessions table - stores each completed values exercise
export const userValuesSessions = sqliteTable("user_values_sessions", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  // Store the top 10 values with their customizations and ratings as JSON
  topValues: text("top_values", { mode: "json" }).$type<Array<{
    id: number;
    name: string;
    description: string;
    rating: number;
    score: number;
    isCustom: boolean;
  }>>().notNull(),
  // Store all values rankings if needed
  allValues: text("all_values", { mode: "json" }).$type<Array<{
    id: number;
    score: number;
  }>>(),
}, (table) => ({
  userIdIdx: index("user_values_sessions_user_id_idx").on(table.userId),
  createdAtIdx: index("user_values_sessions_created_at_idx").on(table.createdAt),
}));

// Sessions table for authentication
export const sessions = sqliteTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: text("sess", { mode: "json" }).notNull(),
  expire: integer("expire", { mode: "timestamp" }).notNull(),
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