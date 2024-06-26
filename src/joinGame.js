import { submitWordComponent } from "./components/submitWord.js";
import { GAME_STATE, GAME_TYPE, gamesIndex } from "./gamesIndex.js";
import { endGame } from "./endGame.js";
import { joinGameComponents } from "./components/gameInfo.js";
import {
    forfeitGameComponent,
    forfeitGameAction,
} from "./components/forfeitGame.js";
import { threadWelcomeComponent } from "./components/threadWelcome.js";

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

    if (game == null) {
        // in the off-chance they join a game just as it expires, we tell the user here
        interaction.reply({
            ephemeral: true,
            content: `This game has been closed. Sorry!`,
        });

        return;
    }

    // remove the timeout so it doesnt trigger after the game has started
    clearTimeout(game.expireTimeout);

    if (
        !checkGameExists(interaction, gameId) ||
        checkGameNotFull(interaction, gameId) ||
        checkGameUsers(interaction, gameId)
    )
        if (!game.giverId) {
            // if (
            //     !checkGameExists(interaction, gameId) ||
            //     checkGameNotFull(interaction, gameId)
            // )
            //     return;

            // game.giver = interaction.user.username;
            game.giverId = interaction.user.id;
        } else {
            // game.guesser = interaction.user.username;
            game.guesserId = interaction.user.id;
        }

    game.gameState = GAME_STATE.PLAYING;

    // disabling join button as player2 joins
    if (game.gameType === GAME_TYPE.PUBLIC) {
        const components = joinGameComponents(gameId, {
            startDisabled: true,
        });
        const message = await interaction.channel.messages.fetch(
            interaction.message.id
        );
        await message.edit({
            components: components,
        });
    }

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
            game.currentWord = word.toLowerCase();
            // add the player once we have the word
            await gameThread.members.add(game.guesserId);

            const welcomeMessage = await gameThread.send({
                embeds: [
                    threadWelcomeComponent(
                        interaction.guild.members.cache,
                        game
                    ),
                ],
                components: [forfeitGameComponent(game)],
            });
            welcomeMessage.pin();

            forfeitGameAction(welcomeMessage, game);
        })
        .catch((e) => {
            console.error("failed word", e);
            endGame(
                game,
                "A word could not be picked so the game could not continue. Please try again."
            );
        });
};
