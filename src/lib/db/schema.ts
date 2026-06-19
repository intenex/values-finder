import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Pre-existing tables. These mirror the live Neon database exactly and must
// not be altered without a migration — they hold real user data.
// ---------------------------------------------------------------------------

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  // Enforce one account per email case-insensitively, so a mixed-case legacy
  // address can't be duplicated by a lowercased signup.
  (table) => [uniqueIndex("users_email_ci_unique").on(sql`lower(${table.email})`)],
);

export interface SavedValue {
  id: number;
  name: string;
  description: string;
  rating: number;
  score: number;
  isCustom: boolean;
}

export const userValuesSessions = pgTable(
  "user_values_sessions",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    topValues: jsonb("top_values").$type<SavedValue[]>().notNull(),
    allValues: jsonb("all_values").$type<Array<{ id: number; score: number }>>(),
    // Legacy column from the old app's resume feature; unused by the new app.
    progress: jsonb("progress").$type<{
      phase: string;
      completedSets: number;
      totalSets: number;
      currentValues?: unknown[];
    }>(),
  },
  (table) => [
    index("user_values_sessions_user_id_idx").on(table.userId),
    index("user_values_sessions_created_at_idx").on(table.createdAt),
  ],
);

// Legacy bearer-token sessions from the old app. Kept so the baseline
// migration matches the live database; the new app never reads it.
export const legacySessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("sessions_expire_idx").on(table.expire)],
);

// Legacy, never used by the app. Kept to match the live database.
export const legacyValues = pgTable("values", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  score: integer("score").default(0),
  isCustom: boolean("is_custom").default(false),
  rating: integer("rating"),
});

// ---------------------------------------------------------------------------
// New tables.
// ---------------------------------------------------------------------------

export const authSessions = pgTable(
  "auth_sessions",
  {
    // sha256 hex digest of the random cookie token — a DB leak does not
    // expose usable session tokens.
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("auth_sessions_user_id_idx").on(table.userId)],
);

export interface AssessmentSets {
  screening: number[][];
  refinement: number[][] | null;
}

export type AssessmentChoice = { m: number; l: number };

export const assessments = pgTable(
  "assessments",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    seed: integer("seed").notNull(),
    engineVersion: integer("engine_version").notNull().default(1),
    status: text("status").notNull().default("active"), // active | completed | abandoned
    sets: jsonb("sets").$type<AssessmentSets>().notNull(),
    choices: jsonb("choices")
      .$type<AssessmentChoice[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    customizations: jsonb("customizations").$type<
      Record<number, { name: string; description: string }>
    >(),
    ratings: jsonb("ratings").$type<Record<number, number>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("assessments_user_id_idx").on(table.userId),
    uniqueIndex("assessments_one_active_per_user")
      .on(table.userId)
      .where(sql`status = 'active'`),
  ],
);

export type User = typeof users.$inferSelect;
export type UserValuesSession = typeof userValuesSessions.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
