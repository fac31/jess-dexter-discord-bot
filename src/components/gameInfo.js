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

const publicGameInfoEmbed = (interaction, gameId, playerType, player) => {
    const author = {
        name: `${player}'s HeadsUp Game`,
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
                    playerType === PLAYER_TYPE.GUESSER ? player : "Spot open!",
            },
            {
                name: "**Clue Giver**",
                value: playerType === PLAYER_TYPE.GIVER ? player : "Spot open!",
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

const gameInfoAction = () => {
    const join = new ButtonBuilder()
        .setCustomId(START_GAME_IDS.JOIN_BUTTON)
        .setLabel("Join Game!")
        .setStyle(ButtonStyle.Primary);

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

    const newGame = {
        id: gameId,
        guesser:
            currentUserData.embedData.playerType === PLAYER_TYPE.GUESSER
                ? interaction.user.username
                : null,
        guesserId:
            currentUserData.embedData.playerType === PLAYER_TYPE.GUESSER
                ? interaction.user.id
                : null,
        giver:
            currentUserData.embedData.playerType === PLAYER_TYPE.GIVER
                ? interaction.user.username
                : null,
        giverId:
            currentUserData.embedData.playerType === PLAYER_TYPE.GIVER
                ? interaction.user.id
                : null,
        gameType: currentUserData.embedData.gameType,
        gameState: GAME_STATE.PENDING,
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
        const joinComponents = gameInfoAction();

        interaction.channel.send({
            embeds: [
                publicGameInfoEmbed(
                    interaction,
                    gameId,
                    currentUserData.embedData.playerType,
                    interaction.user.globalName
                ),
            ],
            components: joinComponents,
            content: `Game initiated! Waiting for second player...`,
        });
    }
};
