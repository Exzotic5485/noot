import { dirname, importx } from "@discordx/importer";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import { ENV } from "./env";
import { runMigrations } from "./db";

export const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
    ],
    silent: false,
});

async function run() {
    runMigrations();
    await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

    await client.login(ENV.BOT_TOKEN);
}

void run();
