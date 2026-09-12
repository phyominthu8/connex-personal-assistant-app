ALTER TABLE `alarms` ADD `projectId` int;--> statement-breakpoint
ALTER TABLE `alarms` ADD CONSTRAINT `alarms_project_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `alarms_project_idx` ON `alarms` (`projectId`);--> statement-breakpoint
CREATE INDEX `alarms_user_project_idx` ON `alarms` (`userId`,`projectId`);