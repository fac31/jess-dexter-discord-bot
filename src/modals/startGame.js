import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const execute = async (interaction) => {
    const testButton = new ButtonBuilder()
        .setCustomId("test")
        .setLabel("Test Button")
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(testButton);

    await interaction.reply({
        content: "Test embed",
        components: [row],
    });
};

export default { execute };
