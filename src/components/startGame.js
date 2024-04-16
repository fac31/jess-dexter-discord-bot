import {
    ButtonStyle,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
} from "discord.js";

// an object containing the different ids used for different components
// in case we need to access the components from an event somewhere else
const START_GAME_IDS = {
    GAME_TYPE_SELECT: "start-game-type",
    PLAYER_TYPE_SELECT: "start-player-type",
    CONFIRM_BUTTON: "start-confirm",
    CANCEL_BUTTON: "start-cancel",
};

const startGameEmbed = (interaction) => {
    const embed = new EmbedBuilder()
        .setColor(0xffa600)
        .setAuthor({
            name: `${interaction.user.globalName}'s HeadsUp Game`,
            iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`,
        })
        .setTitle("Game ID")
        .setDescription("<game id>")
        .addFields(
            { name: "Game Type", value: "-", inline: true },
            { name: "Player Type", value: "-", inline: true }
        )
        .setTimestamp();

    return embed;
};

export const startGameComponent = async (interaction) => {
    const gameTypeSelect = new StringSelectMenuBuilder()
        .setCustomId(START_GAME_IDS.GAME_TYPE_SELECT)
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
        .setCustomId(START_GAME_IDS.PLAYER_TYPE_SELECT)
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
        .setCustomId(START_GAME_IDS.CONFIRM_BUTTON)
        .setLabel("Start Game!")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    const cancel = new ButtonBuilder()
        .setCustomId(START_GAME_IDS.CANCEL_BUTTON)
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary);

    const buttonRow = new ActionRowBuilder().addComponents(cancel, confirm);

    const embed = startGameEmbed(interaction);

    await interaction.reply({
        components: [gameTypeRow, playerTypeRow, buttonRow],
        ephemeral: true,
        embeds: [embed],
        fetchReply: true,
    });
};
