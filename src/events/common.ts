import { Discord, On, Once, type ArgsOf, type Client } from "discordx";
import { ENV } from "../env";
import { MessageFlags } from "discord.js";
import { MessageSafeError } from "../lib/errors";

@Discord()
export class CommonEvents {
    @Once()
    async clientReady([]: ArgsOf<"ready">, client: Client) {
        client.initApplicationCommands();

        console.log(`Bot loggined in as ${client.user?.username}!`);
    }

    @On()
    async interactionCreate(
        [interation]: ArgsOf<"interactionCreate">,
        client: Client
    ) {
        try {
            await client.executeInteraction(interation);
        } catch (e) {
            if (interation.isRepliable()) {
                let content = `Interaction failed. Please try again or contact <@${ENV.OWNER_ID}> if is issue persists.`;

                if (e instanceof MessageSafeError) {
                    content = e.message;
                }

                interation
                    .reply({
                        content,
                        flags: MessageFlags.Ephemeral,
                    })
                    .catch(() => {});
            }

            console.log(
                `Interaction ${interation.id} failed, Type: ${interation.type}`,
                e
            );
        }
    }
}
