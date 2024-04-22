import { gamesIndex } from "../gamesIndex.js";

export function handleGuess(client) {
    client.on("messageCreate", async (msg) => {
        const channel = await msg.channel.fetch();
        const msgThread = channel.name.slice(-6);

        if (msg.author.bot) return;
        // if (msg.channelId === threadId && msg.content.includes(word)) {
        //     msg.reply("correct");
        // }
    });
}
