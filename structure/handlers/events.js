const { Events, Client } = require("discord.js");
const { loadFiles } = require("../functions/loadFiles");
const CliTable3 = require("cli-table3");
const { ServiceLogger } = require("../classes/logger");

/**
 *
 * @param {Client} client
 * @returns {Promise<void>}
 */
async function LoadEvents(client) {
  const table = new CliTable3();

  await global.events.clear();

  const files = await loadFiles("events");

  files.forEach((file) => {
    const event = require(file);
    const filename = file.replace(/^.*[\\/]/, "");
    const execute = (...args) => event.execute(client, ...args);

    if (!Object.values(Events).includes(event.name)) {
      table.push([
        "+",
        "🔴",
        `${event.name}`,
        `${filename}`,
        "Event not loaded - event name does not exist.",
      ]);
    } else {
      global.events.set(event.name, execute);
      if (event.rest) {
        if (event.once) client.rest.once(event.name, execute);
        else client.on(event.name, execute);
      } else {
        if (event.once) client.once(event.name, execute);
        else client.on(event.name, execute);
      }

      table.push(["+", "🟢", `${event.name}`, `${filename}`, ""]);
    }
  });
  table.options.head = [
    table.length,
    "Status",
    "Event Action",
    "File",
    "Message",
  ];

  console.log(table.toString());
  return ServiceLogger.info("Events Loaded.");
}

module.exports = { LoadEvents };
