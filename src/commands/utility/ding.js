import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
    .setName("ding")
    .setDescription("Replies with Dong!");

async function execute(interaction) {
    await interaction.reply("Dong!");
}

export { data, execute };
