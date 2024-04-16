import { SlashCommandBuilder } from "discord.js";

import { startGameComponent } from "../../components/startGame.js";

const data = new SlashCommandBuilder()
    .setName("headsup")
    .setDescription("Play Heads Up!")
    .addSubcommand((subcommand) =>
        subcommand.setName("start").setDescription("Start a new game")
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("join").setDescription("Join a game")
    );

async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "start") {
        await startGameComponent(interaction);
    } else if (subcommand === "join") {
        await interaction.reply("Joining an existing game!");
    }
}

export { data, execute };
