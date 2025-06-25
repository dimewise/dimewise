CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`budget` integer NOT NULL,
	`currency` text NOT NULL,
	`deleted_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_category_user_id` ON `category` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_category_deleted_at` ON `category` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_category_user_id_name` ON `category` (`user_id`,`name`);--> statement-breakpoint
CREATE TABLE `exchange_rate` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`base_currency` text DEFAULT 'USD' NOT NULL,
	`target_currency` text NOT NULL,
	`buy_rate` real NOT NULL,
	`sell_rate` real NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_exchange_rate_target_currency` ON `exchange_rate` (`target_currency`);--> statement-breakpoint
CREATE INDEX `idx_exchange_rate_updated_at` ON `exchange_rate` (`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_exchange_rate_base_target` ON `exchange_rate` (`base_currency`,`target_currency`);--> statement-breakpoint
CREATE TABLE `expense` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category_id` text,
	`payment_method_id` text,
	`title` text NOT NULL,
	`description` text,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`incurred_at` text NOT NULL,
	`verified_at` text,
	`deleted_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payment_method_id`) REFERENCES `payment_method`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_expense_user_id` ON `expense` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_expense_category_id` ON `expense` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_expense_payment_method_id` ON `expense` (`payment_method_id`);--> statement-breakpoint
CREATE INDEX `idx_expense_incurred_at` ON `expense` (`incurred_at`);--> statement-breakpoint
CREATE INDEX `idx_expense_deleted_at` ON `expense` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_expense_user_id_incurred_at` ON `expense` (`user_id`,`incurred_at`);--> statement-breakpoint
CREATE TABLE `payment_method` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`deleted_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_payment_method_user_id` ON `payment_method` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_payment_method_deleted_at` ON `payment_method` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_setting` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`currency` text NOT NULL,
	`preferred_language` text DEFAULT 'en',
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_setting_user_id_unique` ON `user_setting` (`user_id`);