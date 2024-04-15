import dotenv from "dotenv";
dotenv.config();
const key = process.env.OPEN_AI_KEY;
const discordToken = process.env.DISCORD_KEY;

// Initialise Discord bot
import { Client, GatewayIntentBits } from "discord.js";
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (msg) => {
    if (msg.content === "ping") {
        msg.reply("pong");
        console.log("ping detected");
    }
});

client.once("messageCreate", (msg) => {
    if (msg.author.bot) return;
    msg.channel.send("Hello!");
});

client.login(discordToken);
