import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database("./src/db/sqlite.db");
export const db = drizzle(sqlite);

export const proposals = sqliteTable("proposals", {
  id: integer("id").primaryKey().unique(),
  description: text("description").notNull(),
  proposer: text("proposer").notNull(),
  proposalThreshold: integer("proposalThreshold"),
  quorumVotes: integer("quorumVotes").notNull(),
  startBlock: integer("startBlock").notNull(),
  endBlock: integer("endBlock").notNull(),
  executed: integer("executed", { mode: "boolean" }).default(false),
});

export const votes = sqliteTable("votes", {
  id: text("id").unique(),
  voter: text("voter").notNull(),
  proposalId: integer("proposalId").notNull(),
  support: integer("support").notNull(),
  votes: integer("votes").notNull(),
  reason: text("reason"),
});
