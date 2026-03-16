const { Client } = require("discord.js");
const { ServiceLogger } = require("../../structure/classes/logger");
const { LoadCommands } = require("../../structure/handlers/commands");

module.exports = {
  name: "clientReady",
  once: true,
  /**
   *
   * @param {Client} client
   */
  async execute(client) {
    LoadCommands(client).then(() => {
      ServiceLogger.info(
        `Client logged in as ${client.user.tag}\n    - Client Id: ${client.user.id}\n    - Creator: @divinehades\n    - Creator Id: 621358600933081088`
      );
    });
  },
};