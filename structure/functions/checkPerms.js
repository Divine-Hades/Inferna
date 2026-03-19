const {
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
} = require("discord.js");
const { db, client } = require("../../main");

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 * @param {Client} client
 * @param {modCmdOption} cmd
 */
async function checkModPerms(interaction, client, cmd) {
  let result = false;

  let modRoles = await db.modRoles.findMany({
    where: {
      guildId: interaction.guild.id,
    },
  });

  if (!modRoles) {
    if (
      interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      result = true;
    }
  }

  for (const dat of modRoles) {
    if (interaction.member.roles.includes(dat.roleId)) {
      let modRoleOptions = await db.modRoleOptions.findUnique({
        where: {
          modRoleId: dat.modRoleId,
        },
      });

      if (cmd === "Ban" && modRoleOptions.enableBan === true) {
        result === true;
      }

      if (cmd === "Unban" && modRoleOptions.enableUnban === true) {
        result === true;
      }

      if (cmd === "Kick" && modRoleOptions.enableKick === true) {
        result === true;
      }

      if (cmd === "Timeout" && modRoleOptions.enableTimeout === true) {
        result === true;
      }

      if (
        cmd === "Timeout Remove" &&
        modRoleOptions.enableTimeoutRemove === true
      ) {
        result === true;
      }

      if (cmd === "Warn" && modRoleOptions.enableWarnAdd === true) {
        result === true;
      }

      if (cmd === "Warn Remove" && modRoleOptions.enableWarnRemove === true) {
        result === true;
      }

      if (cmd === "Purge" && modRoleOptions.enablePurge === true) {
        result === true;
      }
    }
  }

  return result;
}
