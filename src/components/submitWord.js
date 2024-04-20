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

export const submitWordComponent = async (interaction, game) => {
    const message = await game.activeThread.send({
        embeds: [submitWordEmbed(game)],
        components: [startGameActions(game)],
    });

    const collectorFilter = (i) => i.user.id === interaction.user.id;

    try {
        // we only need to listen a single time
        const buttonInteraction = await message.awaitMessageComponent({
            filter: collectorFilter,
            time: WORD_TIMEOUT,
        });

        const modalId = `wordModal_${game.id}`;

        const modal = new ModalBuilder()
            .setCustomId(modalId)
            .setTitle("Submit Custom Word");

        const hobbiesInput = new TextInputBuilder()
            .setCustomId(`wordModalInp_${game.id}`)
            .setLabel("Submit a word of your choosing!")
            .setMinLength(2)
            .setMaxLength(50)
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const wordInput = new ActionRowBuilder().addComponents(hobbiesInput);

        modal.addComponents(wordInput);

        await buttonInteraction.showModal(modal);

        const modalResponse = await await buttonInteraction.awaitModalSubmit({
            filter: (i) => i.customId == modalId && collectorFilter(i),
            time: WORD_TIMEOUT,
        });

        console.log(modalResponse);
    } catch {
        // TODO: generate ai word
    }
};
