import {
    ButtonStyle,
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ComponentType,
} from "discord.js";
import { endGame } from "../endGame.js";

let openAiClient = null;
export const setOpenAiClient = (client) => (openAiClient = client);

const aiButtonId = (gameId) => `ai_word_${gameId}`;
const customButtonId = (gameId) => `custom_word_${gameId}`;

const submitWordEmbed = (game) => {
    const interaction = game.ownerInteraction;
    const author = {
        name: `${interaction.user.globalName}'s HeadsUp Game`,
    };
    if (interaction.user.avatar) {
        author.iconURL = `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`;
    }

    const embed = new EmbedBuilder()
        .setColor(0xffa600)
        .setAuthor(author)
        .setTitle("You are the Clue Giver!")
        .setDescription(
            "Your job is to give clues to the other player about the given word. But first, you must pick a word!\nBe quick, the other player is waiting!"
        )
        .addFields(
            {
                name: "AI",
                value: "Use AI to pick a random word",
                inline: true,
            },
            {
                name: "Custom",
                value: "Submit a word of your own",
                inline: true,
            }
        );

    return embed;
};

const wordPickedEmbed = (game, word) => {
    const interaction = game.ownerInteraction;
    const author = {
        name: `${interaction.user.globalName}'s HeadsUp Game`,
    };
    if (interaction.user.avatar) {
        author.iconURL = `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`;
    }

    const embed = new EmbedBuilder()
        .setColor(0xffa600)
        .setAuthor(author)
        .setTitle("Word Picked")
        .setDescription(word);

    return embed;
};

const startGameActions = (game) => {
    const ai_word = new ButtonBuilder()
        .setCustomId(aiButtonId(game.id))
        .setLabel("AI")
        .setStyle(ButtonStyle.Primary);

    const custom_word = new ButtonBuilder()
        .setCustomId(customButtonId(game.id))
        .setLabel("Custom")
        .setStyle(ButtonStyle.Primary);

    const buttons = new ActionRowBuilder().addComponents(ai_word, custom_word);

    return buttons;
};

export const aiWord = async () => {
    return new Promise((res, rej) => {
        openAiClient.chat.completions
            .create(
                {
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are part of a HeadsUp game. Your job is to pick a SINGLE random word. DO NOT say ANYTHING else except the word you chose. Add NO punctuation and DO NOT pick plural words.",
                        },
                        {
                            role: "user",
                            content:
                                "Please pick a unique random word for a HeadsUp game.",
                        },
                    ],
                    model: "gpt-4",
                },
                {
                    maxRetries: 3,
                }
            )
            .then((chatCompletion) => {
                // we only care about 1 choice
                const word = chatCompletion.choices[0].message.content;
                res(word);
            })
            .catch(rej);
    });
};

export const submitWordComponent = (interaction, game) => {
    // we wrap everything in a promise so the promise doesnt resolve right until we have a word
    return new Promise(async (res, rej) => {
        const submitWordMsg = await game.activeThread.send({
            embeds: [submitWordEmbed(game)],
            components: [startGameActions(game)],
        });

        const buttonCollector = submitWordMsg.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            componentType: ComponentType.Button,
            time: 10 * 60_000, // 10 minutes
        });

        let pickedWord = null;

        buttonCollector.on("collect", async (buttonInteraction) => {
            if (buttonInteraction.customId == customButtonId(game.id)) {
                const modalId = `wordModal_${game.id}`;
                const inputId = `wordModalInp_${game.id}`;

                const modal = new ModalBuilder()
                    .setCustomId(modalId)
                    .setTitle("Submit Custom Word");

                const hobbiesInput = new TextInputBuilder()
                    .setCustomId(inputId)
                    .setLabel("Submit your word! (it is case insensitive!)")
                    .setMinLength(2)
                    .setMaxLength(50)
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);

                const wordInput = new ActionRowBuilder().addComponents(
                    hobbiesInput
                );

                modal.addComponents(wordInput);

                await buttonInteraction.showModal(modal);

                buttonInteraction
                    .awaitModalSubmit({
                        filter: (i) =>
                            i.user.id === interaction.user.id &&
                            i.customId === modalId,
                        time: 10 * 60_000, // 10 minutes
                    })
                    .then(async (modalResponse) => {
                        const word =
                            modalResponse.fields.getTextInputValue(inputId);

                        pickedWord = word;

                        await submitWordMsg.delete();
                        await modalResponse.reply({
                            embeds: [wordPickedEmbed(game, word)],
                            ephemeral: true,
                        });

                        res(word);
                    })
                    .catch(async (e) => {
                        console.log("`awaitModalSubmit` failed", e);

                        await buttonInteraction.reply({
                            ephemeral: true,
                            content:
                                "There was an issue with the modal. Please try again.",
                        });
                    });
            } else if (buttonInteraction.customId == aiButtonId(game.id)) {
                buttonInteraction.deferReply({ ephemeral: true });

                aiWord()
                    .then(async (word) => {
                        await submitWordMsg.delete();
                        await buttonInteraction.reply({
                            ephemeral: true,
                            embeds: [wordPickedEmbed(game, word)],
                        });
                        res(word);
                    })
                    .catch(async () => {
                        await submitWordMsg.delete();
                        rej();
                    });
            }
        });

        buttonCollector.on("end", () => {
            if (pickedWord == null) {
                endGame(game, "A word took too long to be picked!");
            }
        });
    });
};
