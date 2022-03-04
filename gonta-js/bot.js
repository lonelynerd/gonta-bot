//Modules

import { Intents, Client } from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { exit } from "process";

//Fichiers JSON

let config = JSON.parse(readFileSync('config.json')); //importe le fichier de configuration

//Fonctions

async function save_mgmt(objet_score, mode, client) {
  switch (mode) {
    case "backup":
      try {
        let score_data = await readFileSync('score.json', 'utf-8')
        let score_up = JSON.parse(score_data);
        //console.log(objet_score);
        console.log("MSG - save : la réinitialisation a été effectuée avec succès.");
        return score_up;
      } catch {
        console.log("ERR - save : la réinitialisation a échouée.");
        await send_log("ERR - save : la réinitialisation a échouée.", true, client);
        nice_exit(1, client);
      };
    case "save":
      try {
        const data_score = JSON.stringify(objet_score, null, 4);
        writeFileSync('score.json', data_score);
        console.log("MSG - save : la sauvegarde a été effectuée avec succès.");
        return 0;
      } catch {
        console.log("ERR - save : la sauvegarde a échouée.");
        await send_log("ERR - save : la sauvegarde a échouée.", true, client);
        nice_exit(1, client);
      };
    default:
      console.log(`ERR - save : le paramètre ${mode} est invalide.`);
      nice_exit(1, client);
  };
};

async function nice_exit(code, djs_client) {
  await send_log("MSG - exit : un arrêt du programme a été demandé.", true, djs_client);
  console.log("MSG - exit : un arrêt du programme a été demandé.");
  exit(code);
}

async function send_log(message, hour, djs_client) {
  const log_server = djs_client.guilds.cache.find(guild => guild.id === config.DUMMY_ID.D_GUILD); //cherche serveur avec ID correspondant
  const log_room = log_server.channels.cache.find(channel => channel.id === config.DUMMY_ID.D_ROOM); //cherche salon avec ID correspondant
  if (log_room === undefined) {
    console.log("ERR - send_log : salon introuvable.");
    exit(1);
  };
  try {
    const date = new Date(Date.now())
    if (hour == true) {
      await log_room.send({ content: `[${date.getDate()}/${date.getMonth()}/${date.getFullYear()},${date.getHours()}:${date.getMinutes()}] ${message}` });
    } else {
      await log_room.send({ content: `${message}` });
    };
    return 1;
  } catch {
    console.log("ERR - send_log : message impossible à envoyer");
    return 0;
  }
}

//Initialisation du bot

console.log("MSG - main : lancement du bot...");

let intentions = new Intents();
intentions.add(Intents.FLAGS.GUILD_PRESENCES,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGE_TYPING
);
const client = new Client({ intents: intentions, partials: ["CHANNEL", "USER", "REACTIONS"] }) //crée nouvel seesion avec les privilèges Administrateurs

let score = new Object(); //permet de stocker scores
if (config.REINIT == 0) {
  console.log("MSG - save : lancement de la procédure de récupération...")
  score = await save_mgmt(score, "backup", client);
};

client.on("ready", () => {

  console.log("MSG - on_ready : lancement de la procédure de connexion...");

  const guild = client.guilds.cache.find(guild => guild.id === config.GUILD_ID); //cherche serveur avec ID correspondant
  if (guild === undefined) {
    console.log("ERR - on_ready : serveur introuvable.");
    nice_exit(1, client);
  } else if (!(guild.available)) {
    console.log("ERR - on_ready : serveur indisponible.");
    nice_exit(1, client);
  } else {
    console.log(`MSG - on_ready : serveur ${guild.name} (${guild.id}) trouvé.`);
  };

  console.log(`MSG - on_ready : bot connecté sous le nom ${client.user.username} (${client.user.id}).`);
  send_log(`MSG - on_ready : bot lancé sur le serveur ${guild.name}`, true, client);
  //console.log(`DBG - on_ready : score :`);
  //console.log(score);
  setInterval(save_mgmt, config.SAVE_INTRV * 1000, score, "save", client);
});

//Action lors reçu du message

client.on("messageCreate", msg => {
  let id_auth = String(msg.author.id);

  if (msg.author === client.user || msg.author.bot === true) {
    return;
  };

  if (msg.guild === null) {
    console.log(`MSG - on_message : l'utilisateur ${msg.author.username} (${id_auth}) a envoyé un message privé.`);
    msg.author.send({ content: config.DM_ERROR });
    return;
  };

  const guild = client.guilds.cache.find(guild => guild.id === config.GUILD_ID);
  if (guild === undefined) {
    console.log("ERR - on_message : serveur introuvable.");
    nice_exit(1, client);
  };

  let role = guild.roles.cache.find(role => role.name === config.TARGET_ROLES.Tier1.ROLE);

  switch (String(score[id_auth])) {


    case config.TARGET_ROLES.Tier1.TRSH:
      if (msg.member.roles.cache.has(role.id)) {
        console.log(`ERR - on_message : l'utilisateur ${msg.author.username} (${id_auth}) a déjà le rôle ${role.name}.`);
        score[id_auth]++;
        break;
      } else {
        msg.member.roles.add(role);
        msg.author.send({ content: config.CONGRATS + role.name + " !" });
        console.log(`MSG - on_message : l'utilisateur ${msg.author.username} (${id_auth}) a maintenant le rôle ${role.name}.`);
        send_log(`MSG - on_message : l'utilisateur ${msg.author.username} (${id_auth}) a maintenant le rôle ${role.name}.`, true, client);
      }
      score[id_auth]++;
      break;


    case config.TARGET_ROLES.Tier2.TRSH:
      role = guild.roles.cache.find(role => role.name === config.TARGET_ROLES.Tier2.ROLE);
      if (msg.member.roles.cache.has(role.id)) {
        console.log(`ERR - on_message : l'utilisateur ${msg.author.username} (${id_auth}) a déjà le rôle ${role.name}.`);
        score[id_auth]++;
        break;
      } else {
        msg.member.roles.add(role);
        msg.author.send({ content: config.CONGRATS + role.name + " !" });
        console.log(`MSG - on_message : l'utilisateur ${msg.author.username} (${id_auth}) a maintenant le rôle ${role.name}.`);
        send_log(`MSG - on_message : l'utilisateur ${msg.author.username} (${id_auth}) a maintenant le rôle ${role.name}.`, true, client);
      }
      score[id_auth]++;
      break;


    case config.TARGET_ROLES.Tier3.TRSH:
      role = guild.roles.cache.find(role => role.name === config.TARGET_ROLES.Tier3.ROLE);
      if (msg.member.roles.cache.has(role.id)) {
        console.log(`ERR - on_message : l'utilisateur ${msg.author.username} (${id_auth}) a déjà le rôle ${role.name}.`);
        score[id_auth]++;
        break;
      } else {
        msg.member.roles.add(role);
        msg.author.send({ content: config.CONGRATS + role.name + " !" });
        console.log(`MSG - on_message : l'utilisateur ${msg.author.username} (${id_auth}) a maintenant le rôle ${role.name}.`);
        send_log(`MSG - on_message : l'utilisateur ${msg.author.username} (${id_auth}) a maintenant le rôle ${role.name}.`, true, client);
      }
      score[id_auth]++;
      break;


    default:
      if (score[id_auth] == undefined) {
        score[id_auth] = 0;
      }
      score[id_auth]++;
      console.log(`DBG - ${msg.guild}, ${msg.author.username} (${id_auth}) : ${score[id_auth]}.`);
  };
});

client.login(config.BOT_TOKEN);
