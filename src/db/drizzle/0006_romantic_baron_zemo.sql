CREATE TABLE `votes` (
	`id` text PRIMARY KEY NOT NULL,
	`voter` text NOT NULL,
	`proposalId` integer NOT NULL,
	`support` integer NOT NULL,
	`votes` integer NOT NULL,
	`reason` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `votes_id_unique` ON `votes` (`id`);