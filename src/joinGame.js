import { GAME_STATE, gamesIndex } from "./gamesIndex.js";

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

export const joinGame = async (interaction, gameId) => {
    const game = gamesIndex[gameId.toString()];

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
        game.giverId = interaction.user.id;
    } else {
        game.guesser = interaction.user.username;
        game.guesserId = interaction.user.id;
    }

    GAME_STATE.STATUS = "playing";

    !interaction.reply({
        ephemeral: true,
        content: `Joined game!`,
    });

    const channel = interaction.guild.channels.cache.get(interaction.channelId);

    // type 12 creates private thread
    const gameThread = await channel.threads.create({
        name: `Game Thread - ${gameId}`,
        type: 12,
    });

    await gameThread.members.add(game.giverId);
    await gameThread.members.add(game.guesserId);
};
