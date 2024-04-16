export function handlePing(msg) {
    if (msg.content === "ping") {
        msg.reply("pong");
        console.log("ping detected");
    }
}
