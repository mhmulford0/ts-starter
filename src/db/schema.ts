import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  blob,
} from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database("./src/db/sqlite.db");
export const db = drizzle(sqlite);

export const proposals = sqliteTable("proposals", {
  id: blob("id", { mode: "bigint" }).primaryKey(),
  description: text("description").notNull(),
  proposer: text("proposer").notNull(),
  proposalThreshold: blob("proposalThreshold", { mode: "bigint" }).notNull(),
  quorumVotes: blob("quorumVotes", { mode: "bigint" }).notNull(),
});
