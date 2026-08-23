import { and, count, eq, sql } from "drizzle-orm";
import { db } from "..";
import {
    modpacksTable,
    modSuggestionsTable,
    modSuggestionsVotesTable,
    type ModVote,
} from "../schema";

export function createModpack(
    guildId: string,
    channelId: string,
    loader: string,
    version: string
) {
    return db
        .insert(modpacksTable)
        .values({ guildId, channelId, loader, version });
}

export async function getActiveModpack(guildId: string) {
    return db
        .select()
        .from(modpacksTable)
        .where(eq(modpacksTable.guildId, guildId))
        .get();
}

export function getActiveModpackByChannel(guildId: string, channelId: string) {
    return db
        .select()
        .from(modpacksTable)
        .where(
            and(
                eq(modpacksTable.guildId, guildId),
                eq(modpacksTable.channelId, channelId)
            )
        )
        .get();
}

export async function createModSuggestion(
    modpackId: string,
    userId: string,
    platform: string,
    platformId: string
) {
    return db
        .insert(modSuggestionsTable)
        .values({ modpackId, platform, platformId, userId })
        .returning()
        .get();
}

export async function createModSuggestionVote(
    modId: string,
    userId: string,
    vote: ModVote
) {
    return db.insert(modSuggestionsVotesTable).values({ modId, userId, vote });
}

export async function getModSuggestion(id: string) {
    return db
        .select()
        .from(modSuggestionsTable)
        .where(eq(modSuggestionsTable.id, id))
        .get();
}

export function voteSuggestion(modId: string, userId: string, vote: ModVote) {
    return db
        .insert(modSuggestionsVotesTable)
        .values({ modId, userId, vote })
        .onConflictDoUpdate({
            target: [
                modSuggestionsVotesTable.modId,
                modSuggestionsVotesTable.userId,
            ],
            set: { vote },
        });
}

export function countVotes(modId: string) {
    return db
        .select({
            upvotes:
                sql`COUNT(CASE WHEN ${modSuggestionsVotesTable.vote} = 'upvote' THEN 1 END)`.mapWith(
                    Number
                ),
            downvotes:
                sql`COUNT(CASE WHEN ${modSuggestionsVotesTable.vote} = 'downvote' THEN 1 END)`.mapWith(
                    Number
                ),
        })
        .from(modSuggestionsVotesTable)
        .where(eq(modSuggestionsVotesTable.modId, modId))
        .get();
}

export function getModSuggestionVote(modId: string, userId: string) {
    return db
        .select()
        .from(modSuggestionsVotesTable)
        .where(
            and(
                eq(modSuggestionsVotesTable.modId, modId),
                eq(modSuggestionsVotesTable.userId, userId)
            )
        )
        .get();
}
