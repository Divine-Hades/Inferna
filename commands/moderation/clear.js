const {
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  SlashCommandBuilder,
} = require("discord.js");
const { db, config } = require("../../main"); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName("command")
    .setDescription("description"),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    
    
  },
};