import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { REST, Routes } from "discord.js";
const discordToken = process.env.DISCORD_KEY;
const discordGuildId = process.env.GUILD_ID;
const discordClientId = process.env.CLIENT_ID;

const commands = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foldersPath = path.join(__dirname, "./commands");
const commandFolders = fs.readdirSync(foldersPath);

(async () => {
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs
            .readdirSync(commandsPath)
            .filter((file) => file.endsWith(".js"));

        for (const file of commandFiles) {
            const filePath = `./commands/${folder}/${file}`;
            const command = await import(filePath);

            if ("data" in command && "execute" in command) {
                commands.push(command.data.toJSON());
                console.log(commands);
            } else {
                console.log(
                    `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                );
            }
        }
    }

    const rest = new REST().setToken(discordToken);

    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );

        const data = await rest.put(
            Routes.applicationGuildCommands(discordClientId, discordGuildId),
            { body: commands }
        );

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        console.error(error);
    }
})();
