import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { textId } from "./utilts";

export const honeypotChannelsTable = sqliteTable(
    "honeypot_channels",
    {
        guildId: text("guild_id").notNull(),
        channelId: text("channel_id").notNull(),
    },
    (table) => [primaryKey({ columns: [table.guildId, table.channelId] })]
);

export type HoneypotChannel = typeof honeypotChannelsTable.$inferSelect;

export const modpacksTable = sqliteTable("modpacks", {
    id: textId(),
    guildId: text("guild_id").notNull(),
    channelId: text("channel_id").notNull(),
    version: text().notNull(),
    loader: text().notNull(),
});

export type Modpack = typeof modpacksTable.$inferSelect;

export const modSuggestionsTable = sqliteTable("mod_suggestions", {
    id: textId(),
    modpackId: text("modpack_id")
        .notNull()
        .references(() => modpacksTable.id),
    platform: text().notNull(),
    platformId: text("platform_id").notNull(),
    userId: text("user_id").notNull(),
});

export type ModSuggestion = typeof modSuggestionsTable.$inferSelect;

export enum ModVote {
    Upvote = "upvote",
    Downvote = "downvote",
}

export const modSuggestionsVotesTable = sqliteTable(
    "mod_suggestions_votes",
    {
        modId: text("mod_id")
            .notNull()
            .references(() => modSuggestionsTable.id),
        userId: text("user_id").notNull(),
        vote: text({
            enum: Object.values(ModVote) as [ModVote, ...ModVote[]],
        }).notNull(),
    },
    (table) => [primaryKey({ columns: [table.modId, table.userId] })]
);

export type ModSuggestionVote = typeof modSuggestionsVotesTable.$inferSelect;
