import { gamesIndex } from "./gamesIndex.js";

const checkGameExists = (interaction, gameId) => {
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

const checkGameNotFull = (interaction, gameId) => {
    const game = gamesIndex[gameId];
    let gameFull = false;

    if (game.guesser && game.giver) {
        gameFull = true;
        interaction.reply({
            ephemeral: true,
            content: `Game is already full! Please try to join another game.`,
        });
    }

    return gameFull;
};

const checkGameUsers = (interaction, gameId) => {
    const game = gamesIndex[gameId];
    const user = interaction.user.username;
    let usersUnique = true;

    if (user === game.guesser || user === game.giver) {
        usersUnique = false;
        interaction.reply({
            ephemeral: true,
            content: `You can't play against yourself!`,
        });
    }

    return usersUnique;
};

export const joinGame = (interaction, gameId) => {
    const game = gamesIndex[gameId];

    // Swap to this if check once testing complete
    //   if (
    //     !checkGameExists(interaction, gameId) ||
    //     checkGameNotFull(interaction, gameId) ||
    //     checkGameUsers(interaction, gameId)
    // )

    if (
        !checkGameExists(interaction, gameId) ||
        checkGameNotFull(interaction, gameId)
    )
        return;

    if (!game.giver) {
        game.giver = interaction.user.username;
    } else {
        game.guesser = interaction.user.username;
    }

    gamesIndex.gameState = "playing";

    !interaction.reply({
        ephemeral: true,
        content: `Joined game!`,
    });
};
