import { SlashCommandBuilder } from "discord.js";

import { startGameComponent } from "../../components/startGame.js";
import { joinGame } from "../../joinGame.js";
// import { joinGameComponent } from "../../components/joinGame.js";

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
    if (subcommand === "start") {
        await startGameComponent(interaction);
    } else if (subcommand === "join") {
        const gameId = interaction.options.getInteger("game_id");

        joinGame(interaction, gameId);
    }
}

export { data, execute };
