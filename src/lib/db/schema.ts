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
    // Legacy bcrypt hash. Better Auth keeps credentials in `account.password`,
    // so it never writes this column — it must be nullable or new Better Auth
    // signups would violate NOT NULL. Retained (nullable) for rollback until the
    // cutover is verified, then dropped in a later cleanup migration.
    password: text("password"),
    // Better Auth `user` model fields. `name`/`image` stay nullable — the app
    // only ever shows the email. Existing rows are grandfathered email_verified.
    name: text("name"),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
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

// ---------------------------------------------------------------------------
// Better Auth tables. Generated by `@better-auth/cli generate` and adapted to
// reuse the existing `users` table as the `user` model (aliased in the Drizzle
// adapter config). Table/column names match Better Auth's defaults exactly —
// do not rename without regenerating. The oauth_* tables back the OAuth 2.1
// identity provider (shared SSO); they sit empty until a client app registers.
// ---------------------------------------------------------------------------

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at").notNull(),
  expiresAt: timestamp("expires_at"),
});

export const oauthClient = pgTable(
  "oauth_client",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id").notNull().unique(),
    clientSecret: text("client_secret"),
    disabled: boolean("disabled").default(false),
    skipConsent: boolean("skip_consent"),
    enableEndSession: boolean("enable_end_session"),
    subjectType: text("subject_type"),
    scopes: text("scopes").array(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
    name: text("name"),
    uri: text("uri"),
    icon: text("icon"),
    contacts: text("contacts").array(),
    tos: text("tos"),
    policy: text("policy"),
    softwareId: text("software_id"),
    softwareVersion: text("software_version"),
    softwareStatement: text("software_statement"),
    redirectUris: text("redirect_uris").array().notNull(),
    postLogoutRedirectUris: text("post_logout_redirect_uris").array(),
    tokenEndpointAuthMethod: text("token_endpoint_auth_method"),
    grantTypes: text("grant_types").array(),
    responseTypes: text("response_types").array(),
    public: boolean("public"),
    type: text("type"),
    requirePKCE: boolean("require_pkce"),
    referenceId: text("reference_id"),
    metadata: jsonb("metadata"),
  },
  (table) => [index("oauthClient_userId_idx").on(table.userId)],
);

export const oauthRefreshToken = pgTable(
  "oauth_refresh_token",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    sessionId: text("session_id").references(() => session.id, {
      onDelete: "set null",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at"),
    revoked: timestamp("revoked"),
    authTime: timestamp("auth_time"),
    scopes: text("scopes").array().notNull(),
  },
  (table) => [
    index("oauthRefreshToken_clientId_idx").on(table.clientId),
    index("oauthRefreshToken_sessionId_idx").on(table.sessionId),
    index("oauthRefreshToken_userId_idx").on(table.userId),
  ],
);

export const oauthAccessToken = pgTable(
  "oauth_access_token",
  {
    id: text("id").primaryKey(),
    token: text("token").unique(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    sessionId: text("session_id").references(() => session.id, {
      onDelete: "set null",
    }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    refreshId: text("refresh_id").references(() => oauthRefreshToken.id, {
      onDelete: "cascade",
    }),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at"),
    scopes: text("scopes").array().notNull(),
  },
  (table) => [
    index("oauthAccessToken_clientId_idx").on(table.clientId),
    index("oauthAccessToken_sessionId_idx").on(table.sessionId),
    index("oauthAccessToken_userId_idx").on(table.userId),
    index("oauthAccessToken_refreshId_idx").on(table.refreshId),
  ],
);

export const oauthConsent = pgTable(
  "oauth_consent",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    scopes: text("scopes").array().notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("oauthConsent_clientId_idx").on(table.clientId),
    index("oauthConsent_userId_idx").on(table.userId),
  ],
);

export type User = typeof users.$inferSelect;
export type UserValuesSession = typeof userValuesSessions.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
