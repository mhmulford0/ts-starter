import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database("./src/db/sqlite.db");
export const db = drizzle(sqlite);

export const proposals = sqliteTable("proposals", {
  id: integer("id").primaryKey().unique(),
  description: text("description"),
  proposer: text("proposer"),
  // proposalThreshold: integer("proposalThreshold"),
  // quorumVotes: integer("quorumVotes"),
  startBlock: integer("startBlock"),
  endBlock: integer("endBlock"),
  executed: integer("executed", { mode: "boolean" }).default(false),
});

export const votes = sqliteTable("votes", {
  id: text("id").unique(),
  voter: text("voter"),
  proposalId: integer("proposalId"),
  support: integer("support"),
  votes: integer("votes"),
  reason: text("reason"),
});
