import {
    ButtonStyle,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ComponentType,
} from "discord.js";
import { gamesIndex } from "../gamesIndex.js";
// this may be held somewhere else at a later date
// it maps user id to another object holding the interaction data
const currentStartGameInteractions = {};

const GAME_TIMEOUT = 60_000;

// an object containing the different ids used for different components
// in case we need to access the components from an event somewhere else
export const START_GAME_IDS = {
    GAME_TYPE_SELECT: "start-game-type",
    PLAYER_TYPE_SELECT: "start-player-type",
    CONFIRM_BUTTON: "start-confirm",
    CANCEL_BUTTON: "start-cancel",
    JOIN_BUTTON: "join",
};

const PLAYER_TYPE_VALUE_MAP = {
    private: "Private",
    public: "Public",
};
const GAME_TYPE_VALUE_MAP = {
    guesser: "Guesser",
    giver: "Clue Giver",
};

const startGameEmbed = (interaction, embedData = {}) => {
    const embed = new EmbedBuilder()
        .setColor(0xffa600)
        .setAuthor({
            name: `${interaction.user.globalName}'s HeadsUp Game`,
            iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`,
        })
        .setTitle("Game Id")
        .setDescription(embedData.gameId ?? "-")
        .addFields(
            {
                name: "Game Type",
                value: embedData.gameType ?? "-",
                inline: true,
            },
            {
                name: "Player Type",
                value: embedData.playerType ?? "-",
                inline: true,
            }
        )
        .setTimestamp();

    return embed;
};

const startGameComponents = (data = {}) => {
    const gameTypeSelect = new StringSelectMenuBuilder()
        .setCustomId(START_GAME_IDS.GAME_TYPE_SELECT)
        .setPlaceholder("Game Type")
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Private")
                .setDescription(
                    "The game can only be joined by a person you give the game Id to."
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
        .setDisabled(data.startDisabled ?? true);

    const cancel = new ButtonBuilder()
        .setCustomId(START_GAME_IDS.CANCEL_BUTTON)
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary);

    const buttonRow = new ActionRowBuilder().addComponents(cancel, confirm);

    return [playerTypeRow, gameTypeRow, buttonRow];
};

const joinGameEmbed = (interaction, gameId, playerType, player) => {
    const embed = new EmbedBuilder()
        .setColor(0xffa600)
        .setDescription(
            `ID: ${gameId}\nGuesser: ${playerType === "Guesser" ? player : "Spot open!"}\nClue Giver: ${playerType === "Clue Giver" ? player : "Spot open!"}`
        )
        .setAuthor({
            name: `HeadsUp Game`,
            iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`,
        });

    return embed;
};

const joinGameAction = () => {
    const join = new ButtonBuilder()
        .setCustomId(START_GAME_IDS.JOIN_BUTTON)
        .setLabel("Join Game!")
        .setStyle(ButtonStyle.Primary);

    const joinButton = new ActionRowBuilder().addComponents(join);

    return [joinButton];
};

const cancelGame = (interaction) => {
    delete currentStartGameInteractions[interaction.user.id];
};

export const startGameComponent = async (interaction) => {
    const components = startGameComponents();

    const message = await interaction.reply({
        components: components,
        ephemeral: true,
        embeds: [startGameEmbed(interaction)],
        fetchReply: true,
    });

    currentStartGameInteractions[interaction.user.id] = {
        embedData: { gameType: null, playerType: null, gameId: null },
        buttonData: { startDisabled: true },
    };

    // this function will ignore any events that arent by the current user
    // may not be neccessary as the message is ephemeral but better to be safe
    const collectorFilter = (i) => {
        // this stops the error showing that the interaction failed
        // shouldnt need it since we edit but discord thinks we arent doing anything
        if (i.customId !== START_GAME_IDS.JOIN_BUTTON) {
            i.deferUpdate();
        }
        return i.user.id === interaction.user.id;
    };
    // listenes for the string select drop downs to be changed and emits and event if they do
    const selectCollector = message.createMessageComponentCollector({
        filter: collectorFilter,
        componentType: ComponentType.StringSelect,
        time: GAME_TIMEOUT,
    });
    const buttonCollector = message.createMessageComponentCollector({
        filter: collectorFilter,
        componentType: ComponentType.Button,
        time: GAME_TIMEOUT,
    });

    selectCollector.on("collect", (selectInteraction) => {
        const currentUserData =
            currentStartGameInteractions[interaction.user.id];

        if (selectInteraction.customId == START_GAME_IDS.GAME_TYPE_SELECT) {
            const selectedType = selectInteraction.values[0];

            // update the current user's embed data so the embed will change
            // and will stay changed if they update a different property
            currentUserData.embedData.gameType =
                PLAYER_TYPE_VALUE_MAP[selectedType];

            interaction.editReply({
                embeds: [
                    startGameEmbed(interaction, currentUserData.embedData),
                ],
            });
        } else if (
            selectInteraction.customId == START_GAME_IDS.PLAYER_TYPE_SELECT
        ) {
            const selectedType = selectInteraction.values[0];

            currentUserData.embedData.playerType =
                GAME_TYPE_VALUE_MAP[selectedType];

            interaction.editReply({
                embeds: [
                    startGameEmbed(interaction, currentUserData.embedData),
                ],
            });
        }

        if (
            currentUserData.embedData.gameType != undefined &&
            currentUserData.embedData.playerType != undefined
        ) {
            currentUserData.buttonData.startDisabled = false;
            interaction.editReply({
                components: startGameComponents(currentUserData.buttonData),
            });
        }
    });

    buttonCollector.on("collect", (buttonInteration) => {
        if (buttonInteration.customId == START_GAME_IDS.CANCEL_BUTTON) {
            interaction.editReply({
                embeds: [],
                components: [],
                content: "Game was cancelled!",
            });

            cancelGame(interaction);
        }
    });

    // if the user takes too long we edit the message and
    // delete their data
    let startGameClicked = false;
    selectCollector.on("end", () => {
        if (!startGameClicked) {
            interaction.editReply({
                embeds: [],
                components: [],
                content: "Game took too long to start!",
            });

            cancelGame(interaction);
        }
    });

    buttonCollector.on("collect", (buttonInteraction) => {
        const currentUserData =
            currentStartGameInteractions[interaction.user.id];
        if (buttonInteraction.customId == START_GAME_IDS.CONFIRM_BUTTON) {
            startGameClicked = true;

            let maxId = 0;
            for (const id in gamesIndex) {
                if (parseInt(id) > maxId) {
                    maxId = parseInt(id);
                }
            }
            const newId = maxId + 1;
            const newGame = {
                id: newId,
                guesser:
                    currentUserData.embedData.playerType === "Guesser"
                        ? interaction.user.username
                        : null,
                giver:
                    currentUserData.embedData.playerType === "Clue Giver"
                        ? interaction.user.username
                        : null,
                gameType: currentUserData.embedData.gameType,
                gameState: "pending",
            };
            gamesIndex[newId] = newGame;

            if (currentUserData.embedData.gameType === "Private") {
                interaction.editReply({
                    embeds: [],
                    components: [],
                    content: `Game ID: ${newId}. Invite a friend to join!`,
                });
            }

            const joinComponents = joinGameAction();

            if (currentUserData.embedData.gameType === "Public") {
                interaction.channel.send({
                    embeds: [
                        joinGameEmbed(
                            interaction,
                            newId,
                            currentUserData.embedData.playerType,
                            interaction.user.username
                        ),
                    ],
                    components: joinComponents,
                    content: `Game initiated! Waiting for second player...`,
                });
            }
        }
        console.log(gamesIndex);
    });
};
