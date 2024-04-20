import {
    ButtonStyle,
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";

const WORD_TIMEOUT = 60_000;

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
            "Your job is to give clues to the other player about the given word. But first, you must pick a word!\nBe quick, the other player is waiting! (You have 60 seconds to pick a word or a random one will be generated)"
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

const getAiWord = async () => {
    // TODO: fetch word!
};

export const submitWordComponent = (interaction, game) => {
    // we wrap everything in a promise so the promise doesnt resolve right until we have a word
    return new Promise(async (res, rej) => {
        return rej();

        const message = await game.activeThread.send({
            embeds: [submitWordEmbed(game)],
            components: [startGameActions(game)],
        });

        const collectorFilter = (i) => {
            return i.user.id === interaction.user.id;
        };

        try {
            // we only need to listen a single time
            const buttonInteraction = await message.awaitMessageComponent({
                filter: collectorFilter,
                time: WORD_TIMEOUT,
            });

            const modalId = `wordModal_${game.id}`;
            const inputId = `wordModalInp_${game.id}`;

            const modal = new ModalBuilder()
                .setCustomId(modalId)
                .setTitle("Submit Custom Word");

            const hobbiesInput = new TextInputBuilder()
                .setCustomId(inputId)
                .setLabel(
                    "Submit a word of your choosing! (it is case insensitive!)"
                )
                .setMinLength(2)
                .setMaxLength(50)
                .setRequired(true)
                .setStyle(TextInputStyle.Short);

            const wordInput = new ActionRowBuilder().addComponents(
                hobbiesInput
            );

            modal.addComponents(wordInput);

            await buttonInteraction.showModal(modal);

            try {
                const modalResponse = await buttonInteraction.awaitModalSubmit({
                    filter: async (i) => {
                        const filter =
                            collectorFilter(i) && i.customId === modalId;
                        if (filter) {
                            await i.deferReply();
                        }
                        return filter;
                    },
                    time: WORD_TIMEOUT,
                });

                const word = modalResponse.fields.getTextInputValue(inputId);

                res(word);
            } catch {
                interaction.reply({
                    ephemeral: true,
                    content:
                        "The modal failed and a word was not submitted. A new word will be picked by AI.",
                });

                // if the fetch request fails we want to basically just end the game
                getAiWord().then(res).catch(rej);
            }
        } catch {
            interaction.reply({
                ephemeral: true,
                content:
                    "A word was not picked in time. A new word will be picked by AI.",
            });

            // if the fetch request fails we want to basically just end the game
            getAiWord().then(res).catch(rej);
        }
    });
};
