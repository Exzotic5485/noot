CREATE TABLE `mod_suggestions` (
	`id` text PRIMARY KEY,
	`modpack_id` text NOT NULL,
	`platform` text NOT NULL,
	`platform_id` text NOT NULL,
	`user_id` text NOT NULL,
	CONSTRAINT `fk_mod_suggestions_modpack_id_modpacks_id_fk` FOREIGN KEY (`modpack_id`) REFERENCES `modpacks`(`id`)
);
--> statement-breakpoint
CREATE TABLE `mod_suggestions_votes` (
	`mod_id` text NOT NULL,
	`user_id` text NOT NULL,
	`vote` text NOT NULL,
	CONSTRAINT `mod_suggestions_votes_pk` PRIMARY KEY(`mod_id`, `user_id`),
	CONSTRAINT `fk_mod_suggestions_votes_mod_id_mod_suggestions_id_fk` FOREIGN KEY (`mod_id`) REFERENCES `mod_suggestions`(`id`)
);
--> statement-breakpoint
CREATE TABLE `modpacks` (
	`id` text PRIMARY KEY,
	`guild_id` text NOT NULL,
	`channel_id` text NOT NULL,
	`version` text NOT NULL,
	`loader` text NOT NULL
);
