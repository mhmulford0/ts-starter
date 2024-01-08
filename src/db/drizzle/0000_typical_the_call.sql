CREATE TABLE `proposals` (
	`id` blob PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`proposer` text NOT NULL,
	`proposalThreshold` blob NOT NULL,
	`quorumVotes` blob NOT NULL
);
