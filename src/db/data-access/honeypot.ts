import { db } from "..";

type HoneypotChannel = {
    guild_id: string;
    channel_id: string;
};

export function createHoneypotChannel(guildId: string, channelId: string) {
    return db
        .query(
            "INSERT INTO honeypot_channels (guild_id, channel_id) VALUES (?, ?)",
        )
        .run(guildId, channelId);
}

export function getHoneypotChannel(guildId: string, channelId: string) {
    return db
        .query<HoneypotChannel, [string, string]>(
            "SELECT * FROM honeypot_channels WHERE guild_id = ? AND channel_id = ? LIMIT 1;",
        )
        .get(guildId, channelId);
}

export function removeHoneypotChannel(guildId: string, channelId: string) {
    return db
        .query(
            "DELETE FROM honeypot_channels WHERE guild_id = ? AND channel_id = ? LIMIT 1;",
        )
        .run();
}
