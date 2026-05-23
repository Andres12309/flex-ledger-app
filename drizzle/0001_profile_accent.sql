ALTER TABLE `user_settings` ADD `display_name` text;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `family_label` text;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `family_size` integer;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `accent_theme_id` text DEFAULT 'teal' NOT NULL;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `expense_coach_seen` integer DEFAULT false NOT NULL;
