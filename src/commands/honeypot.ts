import {
    ApplicationCommandOptionType,
    ContainerBuilder,
    Events,
    InteractionContextType,
    MessageFlags,
    PermissionFlagsBits,
    type CommandInteraction,
} from "discord.js";
import {
    Discord,
    On,
    Slash,
    SlashGroup,
    SlashOption,
    type ArgsOf,
    type Client,
    type SlashOptionResult,
} from "discordx";
import {
    createHoneypotChannel,
    getHoneypotChannel,
    removeHoneypotChannel,
} from "../db/data-access/honeypot";

@Discord()
@SlashGroup({
    description: "Create, edit and delete honeypot channels.",
    name: "honeypot",
})
@SlashGroup("honeypot")
export class HoneypotCommand {
    @Slash({
        description:
            "Any user who messages in the honeypot channel will be kicked and have previous messages deleted",
        defaultMemberPermissions: PermissionFlagsBits.BanMembers,
        contexts: [InteractionContextType.Guild],
    })
    async add(
        @SlashOption({
            description: "channel to make honeypot in",
            name: "channel",
            required: false,
            type: ApplicationCommandOptionType.Channel,
        })
        channelOption:
            SlashOptionResult[ApplicationCommandOptionType.Channel] | undefined,
        interaction: CommandInteraction,
    ) {
        const channel = channelOption ?? interaction.channel;

        if (
            !channel?.isTextBased() ||
            !interaction.inGuild() ||
            !channel.isSendable()
        ) {
            return interaction.reply({
                content: "Not a valid channel.",
                flags: MessageFlags.Ephemeral,
            });
        }

        if (getHoneypotChannel(interaction.guildId, channel.id)) {
            return interaction.reply({
                content: "Channel is already a honeypot channel!",
                flags: MessageFlags.Ephemeral,
            });
        }

        createHoneypotChannel(interaction.guildId, channel.id);

        const container = new ContainerBuilder().addTextDisplayComponents(
            (textDisplay) =>
                textDisplay.setContent(
                    "# ⚠️ DO NOT MESSAGE HERE ⚠️\nIf you send a message here you will be **kicked** & have your messages sent within 24 hours deleted. This channel is used to catch spam bots",
                ),
        );

        await Promise.all([
            channel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            }),
            interaction.reply({
                content: `Created honeypot channel in ${channel}!`,
                flags: MessageFlags.Ephemeral,
            }),
        ]);
    }

    @Slash({
        description:
            "removes the current / chosen channel from being a honeypot",
        defaultMemberPermissions: PermissionFlagsBits.BanMembers,
        contexts: [InteractionContextType.Guild],
    })
    async remove(
        @SlashOption({
            description: "channel to remove honeypot in",
            name: "channel",
            required: false,
            type: ApplicationCommandOptionType.Channel,
        })
        channelOption:
            SlashOptionResult[ApplicationCommandOptionType.Channel] | undefined,
        interaction: CommandInteraction,
    ) {
        const channel = channelOption ?? interaction.channel;

        if (
            !channel?.isTextBased() ||
            !interaction.inGuild() ||
            !channel.isSendable()
        ) {
            return interaction.reply({
                content: "Not a valid channel.",
                flags: MessageFlags.Ephemeral,
            });
        }

        removeHoneypotChannel(interaction.guildId!, interaction.channelId);

        await interaction.reply({
            content: "Done!",
            flags: MessageFlags.Ephemeral,
        });
    }

    @On({ event: Events.MessageCreate })
    async onMessage([message]: ArgsOf<Events.MessageCreate>, client: Client) {
        if (!message.inGuild() || message.member?.user.bot) return;

        const honeypotChannel = getHoneypotChannel(
            message.guildId,
            message.channelId,
        );

        if (!honeypotChannel || !message.member?.bannable) return;

        await message.member.ban({
            reason: "Honeypot Channel / Spam Bot",
            deleteMessageSeconds: 60 * 60 * 24,
        });

        await message.guild.bans.remove(message.member);
    }
}
