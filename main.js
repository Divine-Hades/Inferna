const { Client, Partials, Collection, Events } = require("discord.js");
const { LoadEvents } = require("./structure/handlers/events");
const { PrismaClient } = require("./generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const { connectionString } = require("pg/lib/defaults");
require("dotenv").config();

const pool = new Pool({
  connectionString: `${process.env.DATABASE_URL}`,
});
const adapter = new PrismaPg(pool, {
  schema: process.env.SCHEMA
}); 

const db = new PrismaClient({
  adapter, 
});

const client = new Client({
  intents: [3276799],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
});

global.client = client;
global.env = process.env;
global.commands = new Collection();
global.events = new Collection();

const config = {
  emojis: require("./configs/emojis.json"),
  colors: require("./configs/colors.json"),
};

module.exports = {
  client,
  config,
  db,
};

LoadEvents(client);

client.login(env.TOKEN);