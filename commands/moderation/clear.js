const {
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  SlashCommandBuilder,
  ChannelType,
  Role,
} = require("discord.js");
const { db, config } = require("../../main");
const { checkModPerms } = require("../../structure/functions/checkPerms");
const { emojis, colors } = config;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Purge a number of messages from the server.")
    .addIntegerOption((opt) =>
      opt
        .setName("amount")
        .setDescription("Enter the number of messages to delete.")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true),
    )
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Choose a channel to delete messages from.")
        .addChannelTypes(ChannelType.GuildText),
    )
    .addUserOption((opt) =>
      opt
        .setName("user")
        .setDescription("Enter a user to delete their messages specifically."),
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    
    async function checkModPerm() {
      let authorRoles = await interaction.member.roles.cache.get()
      
      for (let role of authorRoles) {
        
      }
    } 
      
    let allowed = await checkModPerm();

    if (!allowed) {
      console.log("❌ Permission denied")
    } else {
      console.log("✅ Permission accepted");

    }

    // return interaction.reply({
    //   flags: "Ephemeral",
    //   embeds: [
    //     {
    //       description: `${config.emojis.error} You do not have permission to use **/${interaction.commandName}**`,
    //       color: parseInt(config.colors.red),
    //       timestamp: new Date(),
    //     },
    //   ],
    // });

    // let channel =
    //     (await interaction.options.getChannel("channel")) || interaction.channel;
    //   let amount = interaction.options.getInteger("amount");
    // let user = interaction.options.getUser("user");

    // let messages = channel.messages.fetch();
    // let filtered = [];

    // if (user) {
    //   let i = 0;

    //   (await messages).filter((m) => {
    //     if (m.author.id === user.id && amount > i) {
    //       filtered.push(m);
    //       i++;
    //     }
    //   });

    //   await channel.bulkDelete(filtered, true).then((messages) => {
    //     interaction.reply({
    //       embeds: [
    //         {
    //           title: "Messages Cleared",
    //           description: `${emojis.check} ***${messages.size} message(s) sent by ${user} have been cleared in ${channel}.***`,
    //           color: parseInt(colors.green),
    //           timestamp: new Date(),
    //         },
    //       ],
    //       flags: "Ephemeral",
    //     });
    //   });
    // } else {
    //   await channel.bulkDelete(amount, true).then((messages) => {
    //     interaction.reply({
    //       embeds: [
    //         {
    //           title: "Messages Cleared",
    //           description: `${emojis.check} ***${messages.size} message(s) have been cleared in ${channel}.***`,
    //           color: parseInt(emojis.check),
    //           timestamp: new Date(),
    //         },
    //       ],
    //       flags: "Ephemeral",
    //     });
    //   });
    // }
  },
};
