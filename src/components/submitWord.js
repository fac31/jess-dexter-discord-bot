import {
    ButtonStyle,
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
} from "discord.js";

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

const startGameActions = (game) => {
    const ai_word = new ButtonBuilder()
        .setCustomId(`ai_word_${game.id}`)
        .setLabel("AI")
        .setStyle(ButtonStyle.Primary);

    const custom_word = new ButtonBuilder()
        .setCustomId(`custom_word_${game.id}`)
        .setLabel("Custom")
        .setStyle(ButtonStyle.Primary);

    const buttons = new ActionRowBuilder().addComponents(ai_word, custom_word);

    return buttons;
};

export const submitWordComponent = async (game) => {
    await game.activeThread.send({
        embeds: [submitWordEmbed(game)],
        components: [startGameActions(game)],
    });
};
