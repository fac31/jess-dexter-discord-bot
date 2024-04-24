import { gamesIndex } from "../gamesIndex.js";

export function handleGuess(client) {
    client.on("messageCreate", async (msg) => {
        if (msg.author.bot) return;
        const channel = await msg.channel.fetch();
        const msgThread = channel.name.slice(-6);
        const userId = msg.author.id;
        const username = msg.author.username;

        const game = gamesIndex[msgThread];
        const thread = game.activeThread;

        let gameAnswer;
        if (game) {
            gameAnswer = game.currentWord;
        }

        if (
            gameAnswer &&
            userId === game.guesserId &&
            new RegExp(`\\b${gameAnswer}\\b`).test(msg.content)
        ) {
            msg.channel.send(`That's right! ${username} wins!`);

            await thread.setLocked(true);
            setTimeout(async () => {
                await thread.delete();
            }, 60_000);
        }
    });
}
