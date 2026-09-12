ALTER TABLE `alarms` ADD CONSTRAINT `alarms_task_fk` FOREIGN KEY (`taskId`) REFERENCES `tasks`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `milestones` ADD CONSTRAINT `milestones_project_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_project_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_milestone_fk` FOREIGN KEY (`milestoneId`) REFERENCES `milestones`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `alarms_user_idx` ON `alarms` (`userId`);--> statement-breakpoint
CREATE INDEX `alarms_task_idx` ON `alarms` (`taskId`);--> statement-breakpoint
CREATE INDEX `alarms_user_enabled_fire_idx` ON `alarms` (`userId`,`enabled`,`fireAt`);--> statement-breakpoint
CREATE INDEX `milestones_user_idx` ON `milestones` (`userId`);--> statement-breakpoint
CREATE INDEX `milestones_project_idx` ON `milestones` (`projectId`);--> statement-breakpoint
CREATE INDEX `milestones_user_project_idx` ON `milestones` (`userId`,`projectId`);--> statement-breakpoint
CREATE INDEX `milestones_user_due_idx` ON `milestones` (`userId`,`dueDate`);--> statement-breakpoint
CREATE INDEX `projects_user_idx` ON `projects` (`userId`);--> statement-breakpoint
CREATE INDEX `projects_user_status_idx` ON `projects` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `tasks_user_idx` ON `tasks` (`userId`);--> statement-breakpoint
CREATE INDEX `tasks_project_idx` ON `tasks` (`projectId`);--> statement-breakpoint
CREATE INDEX `tasks_milestone_idx` ON `tasks` (`milestoneId`);--> statement-breakpoint
CREATE INDEX `tasks_user_project_idx` ON `tasks` (`userId`,`projectId`);--> statement-breakpoint
CREATE INDEX `tasks_user_milestone_idx` ON `tasks` (`userId`,`milestoneId`);
