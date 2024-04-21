import { SlashCommandBuilder } from "discord.js";

import { startGameComponent } from "../../components/startGame.js";
import { joinGame } from "../../joinGame.js";

const data = new SlashCommandBuilder()
    .setName("headsup")
    .setDescription("Play Heads Up!")
    .addSubcommand((subcommand) =>
        subcommand.setName("start").setDescription("Start a new game")
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("join")
            .setDescription("Join a game")
            .addIntegerOption((option) =>
                option
                    .setName("game_id")
                    .setDescription("Id of the game to join.")
                    .setRequired(true)
            )
    );

async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (interaction.channel.isThread()) {
        await handleThreadCommand(interaction, subcommand);
        return;
    }

    if (subcommand === "start") {
        await startGameComponent(interaction);
    } else if (subcommand === "join") {
        const gameId = interaction.options.getInteger("game_id");
        const gameIdString = String(gameId).padStart(6, "0");
        joinGame(interaction, gameIdString);
    }
}

async function handleThreadCommand(interaction, subcommand) {
    let messageContent;
    if (subcommand === "start") {
        messageContent = "New games must be started from the main channel.";
    } else if (subcommand === "join") {
        messageContent = "Games must be joined from the main channel.";
    }
    await interaction.reply({
        content: messageContent,
        ephemeral: true,
    });
}

export { data, execute };
