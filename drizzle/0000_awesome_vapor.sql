CREATE TABLE `actions` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`action_type` text NOT NULL,
	`pos_x` real,
	`pos_y` real,
	`timestamp` integer NOT NULL,
	`details` text,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at` integer NOT NULL,
	`last_active` integer NOT NULL,
	`sector_reached` integer DEFAULT 1,
	`qte_success_count` integer DEFAULT 0,
	`qte_fail_count` integer DEFAULT 0
);
