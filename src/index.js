import express from "express";
import dotenv from "dotenv";
dotenv.config();
const key = process.env.OPEN_AI_KEY;
const discordToken = process.env.DISCORD_KEY;

const app = express();

app.get("/", (_req, res) => {
    console.log("hello");
    res.send("Hello, World new again!");
});

app.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
});

// Initialise Discord bot
import { Client, GatewayIntentBits } from "discord.js";
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
    if (msg.content === "ping") {
        msg.reply("pong");
        console.log("ping detected");
    }
});

client.login(discordToken);
