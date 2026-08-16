import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const honeypotChannelsTable = sqliteTable(
    "honeypot_channels",
    {
        guildId: text("guild_id").notNull(),
        channelId: text("channel_id").notNull(),
    },
    (table) => [primaryKey({ columns: [table.guildId, table.channelId] })],
);

export type HoneypotChannel = typeof honeypotChannelsTable.$inferSelect;