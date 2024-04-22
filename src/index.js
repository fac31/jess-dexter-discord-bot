import dotenv from "dotenv";
import OpenAi from "openai";

dotenv.config();
const key = process.env.OPEN_AI_KEY;
const discordToken = process.env.DISCORD_KEY;

// Initialise Discord bot
import { Client, GatewayIntentBits, Collection, Events } from "discord.js";
import { handleIntro } from "./events/introHandler.js";
import { handlePing } from "./events/pingHandler.js";
import { handleInitialise } from "./events/initialiseHandler.js";
import { handleInteraction } from "./events/interactionHandler.js";
import { handleJoin } from "./events/joinHandler.js";

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

export const openai = new OpenAi({
    apiKey: process.env.OPEN_AI_KEY,
});

import { aiWord } from "./components/submitWord.js";
aiWord()
    .then((w) => console.log(w))
    .catch(() => console.error("failed"));

handleInitialise(client);
handlePing(client);
handleIntro(client);
handleInteraction(client);
handleJoin(client);
client.login(discordToken);

// Slash commands

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foldersPath = path.join(__dirname, "./commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = `./commands/${folder}/${file}`;
        const command = await import(filePath);

        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}
