export const endGame = async (game, message) => {
    const thread = game.activeThread;

    await thread.setLocked(true);

    thread.send({
        content: `<@${game.giverId}>: ${message}`,
        ephemeral: true,
    });
    thread.send({
        content: `<@${game.guesserId}>: ${message}`,
        ephemeral: true,
    });

    // delete the thread after a minute (give users time to read)
    setTimeout(async () => {
        await thread.delete();
    }, 60_000);
};
