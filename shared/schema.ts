import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const values = pgTable("values", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  score: integer("score").default(0),
  isCustom: boolean("is_custom").default(false),
  rating: integer("rating"),
});

export const insertValueSchema = createInsertSchema(values).pick({
  name: true,
  description: true,
  score: true,
  isCustom: true,
  rating: true,
});

export type InsertValue = z.infer<typeof insertValueSchema>;
export type Value = typeof values.$inferSelect;
