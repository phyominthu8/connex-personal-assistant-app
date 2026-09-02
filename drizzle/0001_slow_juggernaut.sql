CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`dueLabel` varchar(64) NOT NULL DEFAULT 'Today',
	`priority` enum('Low','Medium','High') NOT NULL DEFAULT 'Medium',
	`project` varchar(255) NOT NULL DEFAULT 'Personal',
	`completed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
