export function handleIntro(msg) {
    if (msg.author.bot) return;
    msg.channel.send("Hello!");
}
