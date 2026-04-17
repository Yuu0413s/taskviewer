import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== Auth.js 標準テーブル ====================

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { mode: "date" }).$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { mode: "date" }).$defaultFn(() => new Date()),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("session_token").unique().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ==================== アプリケーション固有テーブル ====================

export const taskTypes = pgTable("task_types", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#3b82f6"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).$defaultFn(() => new Date()),
});

export const timeEntries = pgTable("time_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  taskTypeId: text("task_type_id")
    .notNull()
    .references(() => taskTypes.id),
  date: text("date").notNull(),
  startedAt: timestamp("started_at", { mode: "date" }).notNull(),
  endedAt: timestamp("ended_at", { mode: "date" }),
  durationMinutes: integer("duration_minutes"),
  status: text("status", { enum: ["working", "on_break", "completed"] })
    .notNull()
    .default("working"),
  memo: text("memo"),
  createdAt: timestamp("created_at", { mode: "date" }).$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { mode: "date" }).$defaultFn(() => new Date()),
});

// ==================== リレーション ====================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  taskTypes: many(taskTypes),
  timeEntries: many(timeEntries),
}));

export const taskTypesRelations = relations(taskTypes, ({ one, many }) => ({
  user: one(users, {
    fields: [taskTypes.userId],
    references: [users.id],
  }),
  timeEntries: many(timeEntries),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  user: one(users, {
    fields: [timeEntries.userId],
    references: [users.id],
  }),
  taskType: one(taskTypes, {
    fields: [timeEntries.taskTypeId],
    references: [taskTypes.id],
  }),
}));

// 型エクスポート
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type TaskType = typeof taskTypes.$inferSelect;
export type NewTaskType = typeof taskTypes.$inferInsert;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type NewTimeEntry = typeof timeEntries.$inferInsert;

export type TimeEntryWithTaskType = TimeEntry & {
  taskType: TaskType;
};
