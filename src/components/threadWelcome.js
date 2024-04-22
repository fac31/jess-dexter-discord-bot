import { EmbedBuilder } from "discord.js";

export const threadWelcomeComponent = (guildMemberCache, game) => {
    const interaction = game.ownerInteraction;

    const author = {
        name: `${interaction.user.globalName}'s HeadsUp Game`,
    };
    if (interaction.user.avatar) {
        author.iconURL = `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`;
    }

    const embed = new EmbedBuilder()
        .setColor(0xffa600)
        .setTitle("Welcome!")
        .setDescription(
            "Welcome both players. Get ready to start guessing.\n\nAt any point, either player can forfeit using the button below!"
        )
        .setAuthor(author)
        .addFields(
            {
                name: "Guesser",
                value: guildMemberCache.get(game.guesserId).user.globalName,
                inline: true,
            },
            {
                name: "Clue Giver",
                value: guildMemberCache.get(game.giverId).user.globalName,
                inline: true,
            }
        );

    return embed;
};
