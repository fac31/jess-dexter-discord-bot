import { joinGame } from "../joinGame.js";

export function handleJoin(client) {
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;
        if (interaction.customId.includes("join")) {
            const interactionId = interaction.customId.split("_")[1];
            joinGame(interaction, interactionId);
        }
    });
}
