import {
    APITextDisplayComponent,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    ContainerBuilder,
    InteractionContextType,
    MessageFlags,
    PermissionFlagsBits,
    TextDisplayComponent,
    type ButtonInteraction,
    type CommandInteraction,
} from "discord.js";
import {
    ButtonComponent,
    Discord,
    Slash,
    SlashChoice,
    SlashGroup,
    SlashOption,
    type SlashOptionResult,
} from "discordx";
import {
    countVotes,
    createModpack,
    createModSuggestion,
    getActiveModpack,
    getModSuggestion,
    getModSuggestionVote,
    voteSuggestion,
} from "../db/data-access/modpack";
import { LOADERS } from "../lib/modpack/loaders";
import { getPlatformFromUrl } from "../lib/modpack/platforms";
import { ModVote } from "../db/schema";

const VOTE_TEXT_COMPONENT_ID = 99;
const VOTE_BUTTON_REGEX = /(upvote|downvote)_(.+)/;

@Discord()
@SlashGroup({
    description: "Build a mod pack together",
    name: "modpack",
})
@SlashGroup("modpack")
export class ModpackCommand {
    @Slash({
        description:
            "Set a version & loader to start building a mod pack in your guild",
        defaultMemberPermissions: PermissionFlagsBits.Administrator,
        contexts: [InteractionContextType.Guild],
    })
    async start(
        @SlashOption({
            description: "channel to send the suggestions in",
            name: "channel",
            required: true,
            type: ApplicationCommandOptionType.Channel,
        })
        channelOption: SlashOptionResult[ApplicationCommandOptionType.Channel],
        @SlashChoice("fabric", "forge")
        @SlashOption({
            description: "the mod loader",
            name: "loader",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        loaderOption: SlashOptionResult[ApplicationCommandOptionType.String],
        @SlashOption({
            description: "the minecraft version in format of `x.x.x`",
            name: "version",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        versionOption: SlashOptionResult[ApplicationCommandOptionType.String],
        interaction: CommandInteraction
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

        await createModpack(
            interaction.guildId,
            channel.id,
            loaderOption,
            versionOption
        );

        const container = new ContainerBuilder()
            .addTextDisplayComponents((textDisplay) =>
                textDisplay.setContent(
                    "# 📦 Modpack Suggestions\nLet's build a modpack together! Suggest mods, upvote & downvote others and use threads to discuss the suggestions."
                )
            )
            .addSeparatorComponents((separator) => separator)
            .addSectionComponents((section) =>
                section
                    .addTextDisplayComponents((textDisplay) =>
                        textDisplay.setContent(
                            "## Mod Loader: Fabric\nVersion: 1.20.2"
                        )
                    )
                    .setThumbnailAccessory((thumbnail) =>
                        thumbnail.setURL(LOADERS[loaderOption].logoUrl)
                    )
            )
            .addActionRowComponents((actionRow) =>
                actionRow.setComponents(
                    new ButtonBuilder()
                        .setLabel("Modrinth")
                        .setURL(
                            `https://modrinth.com/discover/mods?g=categories:${loaderOption}&v=${versionOption}`
                        )
                        .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                        .setLabel("Curseforge")
                        .setURL(
                            `https://www.curseforge.com/minecraft/search?class=mc-mods&page=1&pageSize=20&sortBy=relevancy&version=${versionOption}`
                        )
                        .setStyle(ButtonStyle.Link)
                )
            );

        await Promise.all([
            channel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            }),
            interaction.reply({
                content: `Modpack building started!`,
                flags: MessageFlags.Ephemeral,
            }),
        ]);
    }

    @Slash({
        description: "suggest a mod by its url",
        contexts: [InteractionContextType.Guild],
    })
    async suggest(
        @SlashOption({
            description:
                "the url to the mod page, accepts only curseforge.com & modrinth.com",
            name: "url",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        urlOption: SlashOptionResult[ApplicationCommandOptionType.String],
        interaction: CommandInteraction
    ) {
        if (!interaction.inGuild() || !interaction.channel?.isSendable())
            return;

        const modpack = await getActiveModpack(interaction.guildId);

        if (!modpack) {
            return interaction.reply({
                content:
                    "This guild currently does not have an active modpack. Ask an admin to start a modpack before you are able to suggest.",
                flags: [MessageFlags.Ephemeral],
            });
        }

        const platform = getPlatformFromUrl(urlOption);

        if (!platform) {
            return interaction.reply({
                content:
                    "Invalid url. Only urls from modrinth.com & curseforge.com are supported.",
                flags: [MessageFlags.Ephemeral],
            });
        }

        const modId = platform.parseModId(urlOption);

        if (!modId) {
            return interaction.reply({
                content:
                    "Failed to find the mod id in the url provided. Please make sure you have provided a valid mod url",
                flags: [MessageFlags.Ephemeral],
            });
        }

        const mod = await platform.resolveMod(modId);

        if (!mod) {
            return interaction.reply({
                content:
                    "Failed to resolve mod. Please make sure the mod is valid and try again.",
                flags: [MessageFlags.Ephemeral],
            });
        }

        const modSuggestion = await createModSuggestion(
            modpack.id,
            interaction.user.id,
            platform.id,
            modId
        );

        const container = new ContainerBuilder()
            .addSectionComponents((section) =>
                section
                    .addTextDisplayComponents((textDisplay) =>
                        textDisplay.setContent(
                            `# [${mod.title}](${mod.url})\n${mod.description}\n\n\n*Mod suggested by ${interaction.user}*`
                        )
                    )
                    .setThumbnailAccessory((thumbnail) =>
                        thumbnail.setURL(mod.iconUrl)
                    )
            )
            .addSeparatorComponents((separator) => separator)
            .addTextDisplayComponents((textDisplay) =>
                textDisplay.setContent(this.getVoteTextContext(0, 0)).setId(99)
            )
            .addActionRowComponents((actionRow) =>
                actionRow.setComponents(
                    new ButtonBuilder()
                        .setLabel("Upvote")
                        .setEmoji("⬆️")
                        .setStyle(ButtonStyle.Success)
                        .setCustomId(`upvote_${modSuggestion.id}`),
                    new ButtonBuilder()
                        .setLabel("Downvote")
                        .setEmoji("⬇️")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId(`downvote_${modSuggestion.id}`),
                    new ButtonBuilder()
                        .setLabel("Mod Link")
                        .setURL(mod.url)
                        .setStyle(ButtonStyle.Link)
                )
            );

        const message = await interaction.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });

        await message.startThread({ name: mod.title });

        await interaction.reply({
            content: `Mod suggested!`,
            flags: MessageFlags.Ephemeral,
        });
    }

    @ButtonComponent({ id: VOTE_BUTTON_REGEX })
    async voteButton(interaction: ButtonInteraction) {
        const [, vote, modSuggestionId] =
            interaction.customId.match(VOTE_BUTTON_REGEX)!;

        const modSuggestion = await getModSuggestion(modSuggestionId);

        if (!modSuggestion) {
            throw new Error("mod suggestion does not exist.");
        }

        const modSuggestionVote = getModSuggestionVote(
            modSuggestion.id,
            interaction.user.id
        );

        if (modSuggestionVote && modSuggestionVote.vote == vote) {
            return interaction.reply({
                content: `You have already ${vote}d this post.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        await voteSuggestion(
            modSuggestion.id,
            interaction.user.id,
            vote as ModVote
        );

        const votes = countVotes(modSuggestion.id);

        const container = interaction.message.components
            .find((component) => component.type == ComponentType.Container)
            ?.toJSON();

        const textDisplay = container?.components.find(
            (component): component is APITextDisplayComponent =>
                component.id == VOTE_TEXT_COMPONENT_ID &&
                component.type == ComponentType.TextDisplay
        );

        if (
            !container ||
            !textDisplay ||
            !votes ||
            !interaction.message.editable
        ) {
            return interaction.reply({
                content: "Unable to update message.",
            });
        }

        textDisplay.content = this.getVoteTextContext(
            votes.upvotes,
            votes.downvotes
        );

        await Promise.all([
            interaction.deferUpdate(),
            interaction.message.edit({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            }),
        ]);

        if (interaction.message.hasThread) {
            await interaction.message.thread?.send({
                components: [
                    new ContainerBuilder().addTextDisplayComponents(
                        (textDisplay) =>
                            textDisplay.setContent(
                                `${interaction.user} has ${vote}d this suggestion.`
                            )
                    ),
                ],
                flags: MessageFlags.IsComponentsV2,
            });
        }
    }

    getVoteTextContext(upvotes: number, downvotes: number) {
        return `⬆️ **${upvotes}** / ⬇️ **${downvotes}**   |   (Score: **${upvotes - downvotes}**)`;
    }
}
