import {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType,
} from "discord.js";
import { endGame } from "../endGame.js";

const forfeitButtonId = (gameId) => `forfeit_${gameId}`;

export const forfeitGameAction = (message, game) => {
    const filter = (i) => {
        i.deferUpdate();
        return i.user.id === game.giverId || i.user.id === game.guesserId;
    };

    const buttonCollector = message.createMessageComponentCollector({
        filter: filter,
        componentType: ComponentType.Button,
        time: 2_147_483_646,
    });

    buttonCollector.on("collect", async (buttonInteraction) => {
        if (buttonInteraction.customId == forfeitButtonId(game.id)) {
            await buttonCollector.stop();

            await endGame(
                game,
                "Uh Oh! A player has forfeit the game! Better luck next time..."
            );
        }
    });
};

export const forfeitGameComponent = (game) => {
    const forfeit = new ButtonBuilder()
        .setCustomId(forfeitButtonId(game.id))
        .setLabel("Forfeit Game!")
        .setStyle(ButtonStyle.Danger);

    const button = new ActionRowBuilder().addComponents(forfeit);

    return button;
};
