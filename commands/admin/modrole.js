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
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName("mod-role")
    .setDescription("modrole commands")
    .addSubcommand((cmd) =>
      cmd.setName("create").setDescription("Create a new mod role."),
  )
  .addSubcommand((cmd) => cmd.setName("delete").setDescription("Delete a mod role.")),
    
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {

    const { options, guild, user: author } = interaction; 
    
    const sub = options.getSubcommand(); 

    switch (sub) { 
      case "create": {
        

      }
        break; 
      case "delete": {

      }
        break; 
    }
  },
};
