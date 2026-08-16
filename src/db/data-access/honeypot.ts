import { and, eq } from "drizzle-orm";
import { db } from "..";
import { honeypotChannelsTable } from "../schema";

export function createHoneypotChannel(guildId: string, channelId: string) {
    return db.insert(honeypotChannelsTable).values({ guildId, channelId });
}

export async function getHoneypotChannel(guildId: string, channelId: string) {
    const [value] = await db
        .select()
        .from(honeypotChannelsTable)
        .where(
            and(
                eq(honeypotChannelsTable.guildId, guildId),
                eq(honeypotChannelsTable.channelId, channelId),
            ),
        )
        .limit(1);

    return value;
}

export function removeHoneypotChannel(guildId: string, channelId: string) {
    return db
        .delete(honeypotChannelsTable)
        .where(
            and(
                eq(honeypotChannelsTable.guildId, guildId),
                eq(honeypotChannelsTable.channelId, channelId),
            ),
        );
}
