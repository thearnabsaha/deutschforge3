CREATE TABLE `word_set_members` (
	`id` text PRIMARY KEY NOT NULL,
	`set_id` text NOT NULL,
	`word_id` text NOT NULL,
	`user_id` text NOT NULL,
	`added_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `word_set_members_set_id_idx` ON `word_set_members` (`set_id`);--> statement-breakpoint
CREATE INDEX `word_set_members_word_id_idx` ON `word_set_members` (`word_id`);--> statement-breakpoint
CREATE INDEX `word_set_members_user_id_idx` ON `word_set_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `word_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `word_sets_user_id_idx` ON `word_sets` (`user_id`);