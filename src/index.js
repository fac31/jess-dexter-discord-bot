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

import startGame from "./components/startGame.js";
client.on("messageCreate", (msg) => {
    if (msg.content === "ping") {
        msg.reply("pong");
        console.log("ping detected");
    }

    if (msg.content == "fancy message") {
        startGame.execute(msg);
    }
});

client.once("messageCreate", (msg) => {
    if (msg.author.bot) return;
    msg.channel.send("Hello!");
});

client.login(discordToken);
