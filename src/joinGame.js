import { submitWordComponent } from "./components/submitWord.js";
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
    const user = interaction.user.id;
    let usersUnique = true;

    if (user === game.guesserId || user === game.giverId) {
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

    if (!game.giverId) {
        // game.giver = interaction.user.username;
        game.giverId = interaction.user.id;
    } else {
        // game.guesser = interaction.user.username;
        game.guesserId = interaction.user.id;
    }

    game.gameState = GAME_STATE.PLAYING;

    const channel = interaction.guild.channels.cache.get(interaction.channelId);

    // type 12 creates private thread
    const gameThread = await channel.threads.create({
        name: `Game Thread - ${gameId}`,
        type: 12,
    });

    // store the thread in case we need to use it later
    game.activeThread = gameThread;

    await gameThread.members.add(game.giverId);

    // this wont work while we are using ourselves as the second player
    // once more than one person is joining this should function correctly
    if (game.giverId == interaction.user.id) {
        await interaction.reply({
            ephemeral: true,
            content: `Joined game! Please enter the thread and pick a word!`,
        });
    } else {
        await interaction.reply({
            ephemeral: true,
            content: `Joined game! Waiting for Clue Giver to pick a word...`,
        });
    }

    submitWordComponent(interaction, game)
        .then(async (word) => {
            console.log(game.id, word);

            game.currentWord = word.toLowerCase();
            // add the player once we have the word
            await gameThread.members.add(game.guesserId);
        })
        .catch(async () => {
            // lock the thread and ping both users with an ephemeral message
            await gameThread.setLocked(true);

            gameThread.send({
                content: `<@${game.giverId}>: A word could not be picked so the game could not continue. Please try again.`,
                ephemeral: true,
            });
            gameThread.send({
                content: `<@${game.guesserId}>: A word could not be picked so the game could not continue. Please try again.`,
                ephemeral: true,
            });

            // delete the thread after a minute (give users time to read)
            setTimeout(async () => {
                await gameThread.delete();
            }, 60_000);
        });
};
