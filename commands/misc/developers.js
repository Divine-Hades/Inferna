const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const { db, config } = require("../../main");
const devs = require("../../assets/json/developers.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("developers")
    .setDescription("Fetch the developers that have worked on this project!"),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    let data = devs;

    let dataList = [];

    for (const record of data) {
      dataList.push(
        `**Developer Handle:** @${record.discordUsername}\n**GitHub:** ${record.github}`
      );
    }

    dataList = dataList.join("\n\n");

    interaction.reply({
      embeds: [
        {
          title: "Developers!",
          description: `${dataList}`,
          timestamp: new Date(),
          color: parseInt(config.colors.woc),
        },
      ],
    });
  },
};
