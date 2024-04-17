import { gamesIndex } from "./gamesIndex.js";

const checkGameExists = (gameId) => {
    let idExists = false;

    for (const id in gamesIndex) {
        if (id === gameId) {
            idExists = true;
            break;
        }
    }

    if (!idExists) {
        interaction.reply({
            ephemeral: true,
            content: `Game does not exist with ID ${gameId}. Please try to join another game.`,
        });
    }

    return idExists;
};

const checkGameNotFull = (gameId) => {};

export const joinGame = (interaction, gameId) => {
    if (!checkGameExists(gameId) || !checkGameNotFull(gameId)) return;
};
