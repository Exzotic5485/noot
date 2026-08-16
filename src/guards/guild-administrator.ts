import type { CommandInteraction, Events } from "discord.js";
import { ArgsOf, GuardFunction } from "discordx";

export const GuildAdministrator: GuardFunction<CommandInteraction> = async (
    interaction,
    client,
    next,
) => {
    if (!interaction.inGuild())
        return interaction.reply("Command must be executed within a guild.");

    interaction.member.
};
