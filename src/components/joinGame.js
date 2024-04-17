import { START_GAME_IDS } from "./startGame.js";
import {
    ButtonStyle,
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
} from "discord.js";

export const joinGameEmbed = (interaction, gameId, playerType, player) => {
    const embed = new EmbedBuilder()
        .setColor(0xffa600)
        .setAuthor({
            name: `HeadsUp Game`,
            iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`,
        })
        .addFields(
            { name: "**ID**", value: gameId },
            {
                name: "**Guesser**",
                value: playerType === "Guesser" ? player : "Spot open!",
            },
            {
                name: "**Clue Giver**",
                value: playerType === "Clue Giver" ? player : "Spot open!",
            }
        );

    return embed;
};

export const joinGameAction = () => {
    const join = new ButtonBuilder()
        .setCustomId(START_GAME_IDS.JOIN_BUTTON)
        .setLabel("Join Game!")
        .setStyle(ButtonStyle.Primary);

    const joinButton = new ActionRowBuilder().addComponents(join);

    return [joinButton];
};
