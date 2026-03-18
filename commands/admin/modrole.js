const {
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const { db, config } = require("../../main");
const { emojis, colors } = config;

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName("mod-role")
    .setDescription("modrole commands")
    .addSubcommand((cmd) =>
      cmd
        .setName("create")
        .setDescription("Create a new mod role.")
        .addRoleOption((opt) =>
          opt
            .setName("role")
            .setDescription("Choose a role.")
            .setRequired(true),
        ),
    )
    .addSubcommand((cmd) =>
      cmd.setName("delete").setDescription("Delete a mod role."),
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, guild, user: author } = interaction;

    const sub = options.getSubcommand();

    switch (sub) {
      case "create":
        {
          let role = options.getRole("role");

          const existingData = await db.modRoles.findUnique({
            where: {
              guildId_roleId: {
                guildId: guild.id,
                roleId: role.id,
              },
            },
          });

          if (existingData)
            return interaction.reply({
              embeds: [
                {
                  title: `Unexpected Result`,
                  description: `${emojis.error} ${role} has already been assigned as a mod role. \n\nUse the command **/mod-role list** to view all of the mod roles the server has created, as well as their settings.`,
                  color: parseInt(colors.red),
                  timestamp: new Date(),
                },
              ],
              flags: "Ephemeral"
            });

          await db.modRoles
            .create({
              data: {
                guildId: guild.id,
                roleId: role.id,
              },
            })
            .then(async (record) => {
              const selectMenu = new StringSelectMenuBuilder({
                customId: "ModRoleSelectMenu",
                placeholder: "Select the commands to allow.",
                options: [
                  {
                    label: "Kick",
                    description: "Enables the kick command.",
                    value: "mr_sm_kick_cmd",
                  },
                  {
                    label: "Ban",
                    description: "Enables the ban command.",
                    value: "mr_sm_ban_cmd",
                  },
                  {
                    label: "Unban",
                    description: "Enables the unban command.",
                    value: "mr_sm_unban_cmd",
                  },
                  {
                    label: "Timeout",
                    description: "Enables the timeout command.",
                    value: "mr_sm_timeout_cmd",
                  },
                  {
                    label: "Remove Timeout",
                    description: "Enables the timeout remove command.",
                    value: "mr_sm_removetimeout_cmd",
                  },
                  {
                    label: "Warn Add",
                    description: "Enables the warn add command.",
                    value: "mr_sm_warn_add_cmd",
                  },
                  {
                    label: "Warn Remove",
                    description: "Enables the warn remove command.",
                    value: "mr_sm_warn_remove_cmd",
                  },
                ],
                max_values: 7,
              });

              const skipButton = new ButtonBuilder({
                custom_id: "mr_btn_skip",
                label: "Skip for later",
                style: ButtonStyle.Primary,
              });

              const row = new ActionRowBuilder().addComponents(selectMenu);
              const row2 = new ActionRowBuilder().addComponents(skipButton);

              let res = await interaction.reply({
                embeds: [
                  {
                    description: `- **Currently Configuring:** ${role}\n\nChoose the commands you want to enable for this mod role below. If none, just select skip.`,
                    color: parseInt(colors.inferna),
                  },
                ],
                components: [row, row2],
                flags: "Ephemeral"
              });

              const btn_collector = res.createMessageComponentCollector({
                componentType: ComponentType.Button
              }); 

              btn_collector.on("collect", async (i) => {
                if (i.customId === "mr_btn_skip") {
                  await db.modRoleOptions
                    .create({
                      data: {
                        modRoleId: record.modRoleId,
                      },
                    })
                    .then(async () => {
                      res.edit({
                        embeds: [
                          {
                            description:
                              `${emojis.check} Mod role created! Skipped command setup.\n\nThis can be done later by using the command **/mod-role edit**`,
                            color: parseInt(colors.green),
                          },
                        ],
                        components: [],
                      }); 
                    });
                }
              }); 
              
              const slct_collector = res.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
              });

              slct_collector.on("collect", async (i) => {
                let enabled_cmds = [];

                let opt_ban = false;
                let opt_unban = false;
                let opt_timeout = false;
                let opt_removeTimeout = false;
                let opt_kick = false;
                let opt_warnAdd = false;
                let opt_warnRemove = false

                for (const selected of i.values) {
                  if (selected === "mr_sm_ban_cmd") {
                    enabled_cmds.push("Ban");
                    opt_ban = true;
                  }

                  if (selected === "mr_sm_unban_cmd") {
                    enabled_cmds.push("Unban");
                    opt_unban = true;
                  }

                  if (selected === "mr_sm_timeout_cmd") {
                    enabled_cmds.push("Timeout");
                    opt_timeout = true;
                  }

                  if (selected === "mr_sm_removetimeout_cmd") {
                    enabled_cmds.push("Timeout Remove");
                    opt_removeTimeout = true;
                  }

                  if (selected === "mr_sm_warn_add_cmd") {
                    enabled_cmds.push("Warn Add");
                    opt_warnAdd = true;
                  }
                  
                  if (selected === "mr_sm_warn_remove_cmd") {
                    enabled_cmds.push("Warn Remove");
                    opt_warnRemove = true;
                  }

                  if (selected === "mr_sm_kick_cmd") {
                    enabled_cmds.push("Kick");
                    opt_kick = true;
                  }
                }

                await db.modRoleOptions
                  .create({
                    data: {
                      modRoleId: record.modRoleId,
                      enableBan: opt_ban,
                      enableUnban: opt_unban,
                      enableKick: opt_kick,
                      enableTimeoutRemove: opt_removeTimeout,
                      enableTimeout: opt_timeout,
                      enableWarnAdd: opt_warnAdd,
                      enableWarnRemove: opt_warnRemove,
                    },
                  })
                  .then(async (rec) => {
                    res.edit({
                      components: [],
                      embeds: [
                        {
                          color: parseInt(colors.green),
                          description: `${
                            emojis.check
                          } Mod role created!\n\n**Commands enabled**:\n${enabled_cmds.join(
                            ", ",
                          )}`,
                        },
                      ],
                    });
                  });
              })

            });
        }
        break;
      case "delete":
        {
        }
        break;
    }
  },
};
