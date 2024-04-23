import {
    GAME_STATE,
    GAME_TYPE,
    PLAYER_TYPE,
    gamesIndex,
} from "../gamesIndex.js";
import { START_GAME_IDS } from "./startGame.js";
import {
    ButtonStyle,
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
} from "discord.js";

const publicGameInfoEmbed = (interaction, gameId, playerType) => {
    const author = {
        name: `${interaction.user.globalName}'s HeadsUp Game`,
    };
    if (interaction.user.avatar) {
        author.iconURL = `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`;
    }

    const embed = new EmbedBuilder()
        .setColor(0xffa600)
        .setAuthor(author)
        .addFields(
            { name: "**Game Id**", value: gameId },
            {
                name: "**Guesser**",
                value:
                    playerType === PLAYER_TYPE.GUESSER
                        ? interaction.user.globalName
                        : "Spot open!",
            },
            {
                name: "**Clue Giver**",
                value:
                    playerType === PLAYER_TYPE.GIVER
                        ? interaction.user.globalName
                        : "Spot open!",
            }
        );

    return embed;
};

const privateGameInfoEmbed = (interaction, gameId) => {
    const author = {
        name: `${interaction.user.globalName}'s HeadsUp Game`,
    };
    if (interaction.user.avatar) {
        author.iconURL = `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`;
    }

    const embed = new EmbedBuilder()
        .setColor(0xffa600)
        .setAuthor(author)
        .addFields({ name: "**Game Id**", value: gameId });

    return embed;
};

export const joinGameComponents = (gameId, data = {}) => {
    const join = new ButtonBuilder()
        .setCustomId(`${START_GAME_IDS.JOIN_BUTTON}_${gameId}`)
        .setLabel("Join Game!")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(data.startDisabled ?? false);

    const joinButton = new ActionRowBuilder().addComponents(join);

    return [joinButton];
};

export const gameInfoComponent = (interaction, currentUserData) => {
    function generateUniqueId() {
        const randomNumber = Math.floor(Math.random() * 100000);
        const paddedNumber = randomNumber.toString().padStart(6, "0");
        return paddedNumber;
    }

    function getUniqueGameId() {
        let newId;
        while (true) {
            newId = generateUniqueId();
            if (!gamesIndex[newId]) {
                break;
            }
        }
        return newId;
    }
    const gameId = getUniqueGameId();

    const expireTimeout = setTimeout(async () => {
        interaction.editReply({
            content: `Game left idle for too long!`,
            components: [],
            embeds: [],
        });

        delete gamesIndex[gameId];
    }, 60_000 * 10);

    const newGame = {
        // interaction of the owner of the game
        // the one that executed (/headsup start)
        ownerInteraction: interaction,
        id: gameId,
        // guesser:
        //     currentUserData.embedData.playerType === PLAYER_TYPE.GUESSER
        //         ? interaction.user.username
        //         : null,
        guesserId:
            currentUserData.embedData.playerType === PLAYER_TYPE.GUESSER
                ? interaction.user.id
                : null,
        // giver:
        //     currentUserData.embedData.playerType === PLAYER_TYPE.GIVER
        //         ? interaction.user.username
        //         : null,
        giverId:
            currentUserData.embedData.playerType === PLAYER_TYPE.GIVER
                ? interaction.user.id
                : null,
        gameType: currentUserData.embedData.gameType,
        gameState: GAME_STATE.PENDING,
        currentWord: "",
        expireTimeout,
    };
    gamesIndex[gameId] = newGame;

    if (currentUserData.embedData.gameType === GAME_TYPE.PRIVATE) {
        interaction.editReply({
            embeds: [privateGameInfoEmbed(interaction, gameId)],
            components: [],
            content: `Game initiated! Invite a friend to join!`,
        });
    }

    if (currentUserData.embedData.gameType === GAME_TYPE.PUBLIC) {
        const joinComponents = joinGameComponents(gameId);

        interaction.channel.send({
            embeds: [
                publicGameInfoEmbed(
                    interaction,
                    gameId,
                    currentUserData.embedData.playerType
                ),
            ],
            components: joinComponents,
            content: `Game initiated! Waiting for second player...`,
        });
    }
};
