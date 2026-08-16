CREATE TABLE `honeypot_channels` (
	`guild_id` text NOT NULL,
	`channel_id` text NOT NULL,
	CONSTRAINT `honeypot_channels_pk` PRIMARY KEY(`guild_id`, `channel_id`)
);
