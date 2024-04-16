import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
    .setName("headsup_start")
    .setDescription("Starts game");

async function execute(interaction) {
    await interaction.reply("Let's play!");
}

export { data, execute };
