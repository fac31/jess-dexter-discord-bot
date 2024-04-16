export function handlePing(client) {
    client.on("messageCreate", (msg) => {
        if (msg.content === "ping") {
            msg.reply("pong");
            console.log("ping detected");
        }
    });
}
