CREATE TABLE `alarms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskId` int,
	`title` varchar(255) NOT NULL,
	`fireAt` timestamp NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alarms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tasks` ADD `category` varchar(64) DEFAULT 'General' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `recurrence` varchar(32);