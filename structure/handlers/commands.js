const { Client } = require("discord.js");
const { loadFiles } = require("../functions/loadFiles");
const { ServiceLogger } = require("../classes/logger");
const Table = require("cli-table3");

/**
 *
 * @param {Client} client
 * @returns {Promise<void>}
 */
async function LoadCommands(client) {
  const table = new Table();

  await global.commands.clear();

  let CommandsArray = [];

  const Files = await loadFiles("commands");
  Files.forEach((file) => {
    const command = require(file);
    const filename = file.replace(/^.*[\\/]/, "");
    if (!command.data.name || global.commands.has(command.data.name)) {
      table.push([
        "+",
        "🔴",
        `${filename}`,
        "Could not load - No name given to the command or name is already in use.",
      ]);
    } else if (!command.data.description) {
      table.push([
        "+",
        "🔴",
        `${filename}`,
        "Could not load - No description was given.",
      ]);
    } else {
      global.commands.set(command.data.name, command);
      CommandsArray.push(command.data.toJSON());
      table.push(["+", "🟢", filename, command.data.description]);
    }
  });

  table.options.head = [
    table.length,
    "Status",
    "File Name",
    "Description/Notice",
  ];

  table.options.wordWrap = true;
  client.application.commands.set(CommandsArray);

  console.log(table.toString());

  return ServiceLogger.info("Commands Loaded.");
}

module.exports = { LoadCommands };