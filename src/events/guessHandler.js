import { gamesIndex } from "../gamesIndex.js";
import { endGame } from "../endGame.js";

export function handleGuess(client) {
    client.on("messageCreate", async (msg) => {
        if (msg.author.bot) return;
        const channel = await msg.channel.fetch();
        const msgThread = channel.name.slice(-6);

        const game = gamesIndex[msgThread];
        let gameAnswer;
        if (game) {
            gameAnswer = game.currentWord;
        }

        if (gameAnswer && new RegExp(`\\b${gameAnswer}\\b`).test(msg.content)) {
            endGame(game, "That's right!");
        }
    });
}
