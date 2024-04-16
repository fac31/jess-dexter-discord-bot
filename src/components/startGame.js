import {
    ButtonStyle,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
} from "discord.js";

const startGameEmbed = (interaction) => {
    const embed = new EmbedBuilder()
        .setColor(0xffa600)
        .setTitle(`${interaction.user.globalName}'s HeadsUp Game`)
        .setAuthor({
            name: interaction.user.globalName,
            iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`,
        })
        .addFields({ name: "Game ID", value: "<ID>" })
        .setTimestamp();

    return embed;
};

export const startGameComponent = async (interaction) => {
    const gameTypeSelect = new StringSelectMenuBuilder()
        .setCustomId("start-game-type")
        .setPlaceholder("Game Type")
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Private")
                .setDescription(
                    "The game can only be joined by a person you give the game ID to."
                )
                .setValue("private"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Public")
                .setDescription(
                    "The game is joinable by any person that sees the message."
                )
                .setValue("public")
        );

    const gameTypeRow = new ActionRowBuilder().addComponents(gameTypeSelect);

    const playerTypeSelect = new StringSelectMenuBuilder()
        .setCustomId("start-player-type")
        .setPlaceholder("Play As")
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Guesser")
                .setDescription(
                    "You can't see the word. Guess what is it by asking questions and narrowing down the possibilities."
                )
                .setValue("guesser"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Clue Giver")
                .setDescription(
                    "You can see the word. Answer the questions the other player asks about the word."
                )
                .setValue("giver")
        );

    const playerTypeRow = new ActionRowBuilder().addComponents(
        playerTypeSelect
    );

    const confirm = new ButtonBuilder()
        .setCustomId("start-confirm")
        .setLabel("Start Game!")
        .setStyle(ButtonStyle.Primary);

    const cancel = new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary);

    const buttonRow = new ActionRowBuilder().addComponents(cancel, confirm);

    const embed = startGameEmbed(interaction);

    await interaction.reply({
        components: [gameTypeRow, playerTypeRow, buttonRow],
        ephemeral: true,
        embeds: [embed],
    });
};
