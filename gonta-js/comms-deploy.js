import { Intents, Client } from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { exit } from "process";

import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

let config = JSON.parse(readFileSync('config.json'));

let clientId = config.CLIENT_ID; 
let guildId = config.GUILD_ID;
let token = config.BOT_TOKEN;

const commands = [
	new SlashCommandBuilder().setName('didier').setDescription("Didier."),
	new SlashCommandBuilder().setName('level').setDescription("Replies with the user's level. / Envoie le niveau de l'utilisateur."),
	new SlashCommandBuilder().setName('requ').setDescription("Helps the user in DMs. / Aide l'utilisateur en passant par les messages privés."),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('MSG - comms_deploy : mise à jour des commandes faite avec succès.'))
	.catch(console.error);
