const { Client, Interaction, PermissionsBitField } = require("discord.js");
const { storage } = require("../../main");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {Client} client The client object.
   * @param {Interaction} interaction The interaction object.
   * @returns {Promise<void>}
   */
  async execute(client, interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = global.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        content: "This command is outdated.",
        ephemeral: true,
      });

    command.execute(interaction, client);
  },
};
