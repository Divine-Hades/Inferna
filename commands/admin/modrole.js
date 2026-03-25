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
const { Pagination } = require("pagination.djs");
const { emojis, colors } = config;

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName("modrole")
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
      cmd
        .setName("delete")
        .setDescription("Delete a mod role.")
        .addRoleOption((opt) =>
          opt
            .setName("role")
            .setDescription("Choose a role.")
            .setRequired(true),
        ),
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("edit")
        .setDescription("Edit a mod role.")
        .addRoleOption((opt) =>
          opt
            .setName("role")
            .setDescription("Choose a role.")
            .setRequired(true),
        ),
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("list")
        .setDescription("Get the list all of all the server mod roles"),
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
                  description: `${emojis.error} ${role} has already been assigned as a mod role. \n\nUse the command **/modrole list** to view all of the mod roles the server has created, as well as their settings.`,
                  color: parseInt(colors.red),
                  timestamp: new Date(),
                },
              ],
              flags: "Ephemeral",
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
                  {
                    label: "Purge Messages",
                    description: "Enables the /purge command - clears messages",
                    value: "mr_sm_purge_cmd",
                  },
                ],
                max_values: 8,
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
                flags: "Ephemeral",
              });

              const btn_collector = res.createMessageComponentCollector({
                componentType: ComponentType.Button,
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
                            description: `${emojis.check} Mod role created! Skipped command setup.\n\nThis can be done later by using the command **/mod-role edit**`,
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
                let opt_warnRemove = false;
                let opt_purge = false;

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
                    enabled_cmds.push("Warn");
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

                  if (selected === "mr_sm_purge_cmd") {
                    enabled_cmds.push("Purge");
                    opt_purge = true
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
                      enablePurge: opt_purge
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
              });
            });
        }
        break;
      case "delete":
        {
          let role = interaction.options.getRole("role");

          const modRole = await db.modRoles.findUnique({
            where: {
              guildId_roleId: {
                guildId: guild.id,
                roleId: role.id,
              },
            },
          });

          if (!modRole)
            return interaction.reply({
              flags: "Ephemeral",
              embeds: [
                {
                  title: "Unexpected Result",
                  description: `${emojis.error} ${role} hasn't been assigned as a mod role. Please check the **/modrole list** to see what roles are set up as a mod role.`,
                  color: parseInt(colors.red),
                  timestamp: new Date(),
                },
              ],
            });

          let btn_yes = new ButtonBuilder({
            customId: "btn_yes",
            label: "Confirm",
            style: ButtonStyle.Success,
          });

          let btn_no = new ButtonBuilder({
            customId: "btn_no",
            label: "Deny",
            style: ButtonStyle.Danger,
          });

          let row = new ActionRowBuilder().addComponents(btn_yes, btn_no);

          let res = await interaction.reply({
            embeds: [
              {
                description: `Are you sure you want to remove ${role} as a mod role and unassign all moderator commands from the role?`,
                color: parseInt(colors.inferna),
                timestamp: new Date(),
              },
            ],
            components: [row],
            flags: "Ephemeral",
          });

          let btn_collector = res.createMessageComponentCollector({
            componentType: ComponentType.Button,
          });

          btn_collector.on("collect", async (i) => {
            switch (i.customId) {
              case "btn_yes":
                {
                  await db.modRoles.delete({
                    where: {
                      guildId_roleId: {
                        guildId: guild.id,
                        roleId: role.id,
                      },
                    },
                  });

                  await db.modRoleOptions.delete({
                    where: {
                      modRoleId: `${modRole.modRoleId}`,
                    },
                  });

                  res.edit({
                    embeds: [
                      {
                        description: `${emojis.check} ${role} has been removed as a moderator.`,
                        color: parseInt(colors.green),
                        timestamp: new Date(),
                      },
                    ],
                    components: [],
                  });
                }
                break;
              case "btn_no": {
                return res.edit({
                  embeds: [
                    {
                      description: `Your action has been **cancelled**, have a nice day.`,
                      color: parseInt(colors.red),
                      timestamp: new Date(),
                    },
                  ],
                  components: [],
                });
              }
            }
          });
        }
        break;
      case "list":
        {
          let modRoleRecords = await db.modRoles.findMany({
            where: {
              guildId: guild.id,
            },
          });

          if (modRoleRecords.length < 1)
            return interaction.reply({
              flags: ["Ephemeral"],
              embeds: [
                {
                  title: "Unexpected Result",
                  description: `${emojis.error} This server has no mod roles set up. Use **/modrole create** to create a mod role.`,
                  color: parseInt(colors.red),
                  timestamp: new Date(),
                },
              ],
            });

          let fields = [];

          for (const record of modRoleRecords) {
            let modRolePermissions = await db.modRoleOptions.findUnique({
              where: {
                modRoleId: record.modRoleId,
              },
            });

            let enabledPerms = [];

            if (modRolePermissions.enableBan === true) enabledPerms.push("Ban");
            if (modRolePermissions.enableUnban === true)
              enabledPerms.push("Unban");
            if (modRolePermissions.enableTimeout === true)
              enabledPerms.push("Timeout");
            if (modRolePermissions.enableTimeoutRemove === true)
              enabledPerms.push("Timeout Remove");
            if (modRolePermissions.enableKick === true)
              enabledPerms.push("Kick");
            if (modRolePermissions.enableWarnAdd === true)
              enabledPerms.push("Warn Add");
            if (modRolePermissions.enableWarnRemove === true)
              enabledPerms.push("Warn Remove");
            if (modRolePermissions.enablePurge === true) 
              enabledPerms.push("Purge")

            fields.push({
              name: `__Mod Role ${fields.length + 1}__`,
              value: `**Assigned Role**: <@&${record.roleId}>\n**Enabled Commands**: ${enabledPerms.join(", ")}`,
            });
          }
          const pagination = new Pagination(interaction, {
            limit: 3,
            ephemeral: true,
            loop: true,
          });

          pagination
            .setTitle("Server Mod Roles")
            .setColor(parseInt(colors.inferna))
            .addFields(fields)
            .paginateFields(true);

          pagination.render();
        }
        break;
      case "edit": {
        const role = options.getRole("role");

        let existingData = await db.modRoles.findUnique({
          where: {
            guildId_roleId: { guildId: guild.id, roleId: role.id },
          },
        });

        if (!existingData)
          return interaction.reply({
            flags: "Ephemeral",
            embeds: [
              {
                title: "Unexpected Result",
                description: `${emojis.error} ${role} is not assigned as a mod role. Please use **/modrole list** to view all active mod roles.`,
                color: parseInt(colors.red),
                timestamp: new Date(),
              },
            ],
          });

        let modRole_options = await db.modRoleOptions.findUnique({
          where: {
            modRoleId: existingData.modRoleId,
          },
        });

        let slct_menu = new StringSelectMenuBuilder({
          customId: "slct_edit_modrole",
          placeholder: "Select mod commands to enable/disable",
          max_values: 8,
          options: [
            {
              label: "Kick",
              description: "Enables the kick command.",
              value: "mr_sm_kick_cmd",
              default: modRole_options.enableKick,
            },
            {
              label: "Ban",
              description: "Enables the ban command.",
              value: "mr_sm_ban_cmd",
              default: modRole_options.enableBan,
            },
            {
              label: "Unban",
              description: "Enables the unban command.",
              value: "mr_sm_unban_cmd",
              default: modRole_options.enableUnban,
            },
            {
              label: "Timeout",
              description: "Enables the timeout command.",
              value: "mr_sm_timeout_cmd",
              default: modRole_options.enableTimeout,
            },
            {
              label: "Remove Timeout",
              description: "Enables the timeout remove command.",
              value: "mr_sm_removetimeout_cmd",
              default: modRole_options.enableTimeoutRemove,
            },
            {
              label: "Warn Add",
              description: "Enables the warn add command.",
              value: "mr_sm_warn_add_cmd",
              default: modRole_options.enableWarnAdd,
            },
            {
              label: "Warn Remove",
              description: "Enables the warn remove command.",
              value: "mr_sm_warn_remove_cmd",
              default: modRole_options.enableWarnRemove,
            },
            {
              label: "Purge",
              description: "Enables the /purge remove command.",
              value: "mr_sm_purge_cmd",
              default: modRole_options.enablePurge,
            },
          ],
        });

        let row = new ActionRowBuilder().addComponents(slct_menu);

        let res = await interaction.reply({
          embeds: [
            {
              description: `**Currently editing:** ${role}\n\nEnable/Disable moderation commands using the select menu below.`,
              color: parseInt(colors.inferna),
              timestamp: new Date(),
            },
          ],
          components: [row],
          flags: "Ephemeral"
        });

        let collector = await res.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
        });

        let enabledCommands = [];
        let disabledCommands = [];

        let enableKick = false;
        let enableBan = false;
        let enableUnban = false;
        let enableTimeout = false;
        let enableTimeoutRemove = false;
        let enableWarnAdd = false;
        let enableWarnRemove = false;
        let enablePurge = false;

        collector.on("collect", async (i) => {
          for (const val of i.values) {
            if (val === "mr_sm_kick_cmd") {
              enableKick = true;
              enabledCommands.push("Kick");
            }

            if (val === "mr_sm_ban_cmd") {
              enableBan = true;
              enabledCommands.push("Ban");
            }

            if (val === "mr_sm_unban_cmd") {
              enableUnban = true;
              enabledCommands.push("Unban");
            }

            if (val === "mr_sm_timeout_cmd") {
              enableTimeout = true;
              enabledCommands.push("Timeout");
            }

            if (val === "mr_sm_removetimeout_cmd") {
              enableTimeoutRemove = true;
              enabledCommands.push("Timeout Remove");
            }

            if (val === "mr_sm_warn_add_cmd") {
              enableWarnAdd = true;
              enabledCommands.push("Warn");
            }

            if (val === "mr_sm_warn_remove_cmd") {
              enableWarnRemove = true;
              enabledCommands.push("Warn Remove");
            }

            if (val === "mr_sm_purge_cmd") {
              enablePurge = true; 
              enabledCommands.push("Purge");
            }
          }

          if (enableKick === false) disabledCommands.push("Kick");
          if (enableBan === false) disabledCommands.push("Ban");
          if (enableUnban === false) disabledCommands.push("Unban");
          if (enableTimeout === false) disabledCommands.push("Timeout");
          if (enableTimeoutRemove === false)
            disabledCommands.push("Timeout Remove");
          if (enableWarnAdd === false) disabledCommands.push("Warn");
          if (enableWarnRemove === false) disabledCommands.push("Warn Remove");
          if (enablePurge === false) disabledCommands.push("Purge");

          await db.modRoleOptions
            .update({
              where: {
                modRoleId: modRole_options.modRoleId,
              },
              data: {
                enableBan: enableBan,
                enableKick: enableKick,
                enableTimeout: enableTimeout,
                enableTimeoutRemove: enableTimeoutRemove,
                enableUnban: enableUnban,
                enableWarnAdd: enableWarnAdd,
                enableWarnRemove: enableWarnRemove,
                enablePurge: enablePurge
              },
            })
            .then(() => {
              res.edit({
                components: [],
                embeds: [
                  {
                    description: `${emojis.check} ${role} mod role updated!\n\n`,
                    color: parseInt(colors.green), 
                    timestamp: new Date(),
                    fields: [
                      {
                        name: "Enabled Commands",
                        value: enabledCommands.join(", "),
                      },
                      {
                        name: "Disabled Commands",
                        value: disabledCommands.join(", ") || "*None*",
                      },
                    ],
                  },
                ],
              });
            });
        });
      }
    }
  },
};
