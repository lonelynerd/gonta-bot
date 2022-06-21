//Modules

import { assert } from "console";
import { Intents, Client, MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { exit } from "process";

//Fichiers JSON

let config = JSON.parse(readFileSync('config.json')); //importe le fichier de configuration

//Création arbre de rôles

let roles = {
  "ROLE1": {
    "ROLEDS": null,
    "ROLENAME": config.TARGET_ROLES.Tier1.NM,
    "ROLETRSH": config.TARGET_ROLES.Tier1.TRSH,
    "ROLECG": config.TARGET_ROLES.Tier1.CG,
    "LASTROLE": null
  },
  "ROLE2": {
    "ROLEDS": null,
    "ROLENAME": config.TARGET_ROLES.Tier2.NM,
    "ROLETRSH": config.TARGET_ROLES.Tier2.TRSH,
    "ROLECG": config.TARGET_ROLES.Tier2.CG,
    "LASTROLE": null
  },
  "ROLE3": {
    "ROLEDS": null,
    "ROLENAME": config.TARGET_ROLES.Tier3.NM,
    "ROLETRSH": config.TARGET_ROLES.Tier3.TRSH,
    "ROLECG": config.TARGET_ROLES.Tier3.CG,
    "LASTROLE": null
  },
  "ROLE4": {
    "ROLEDS": null,
    "ROLENAME": config.TARGET_ROLES.Tier4.NM,
    "ROLETRSH": config.TARGET_ROLES.Tier4.TRSH,
    "ROLECG": config.TARGET_ROLES.Tier4.CG,
    "LASTROLE": null
  },
  "ROLE5": {
    "ROLEDS": null,
    "ROLENAME": config.TARGET_ROLES.Tier5.NM,
    "ROLETRSH": config.TARGET_ROLES.Tier5.TRSH,
    "ROLECG": config.TARGET_ROLES.Tier5.CG,
    "LASTROLE": null
  }
}

let roles_trsh = {};

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
const client = new Client({ intents: intentions, partials: ["CHANNEL", "USER", "REACTIONS"] }); //crée nouvel seesion avec les privilèges Administrateurs

let score = new Object(); //permet de stocker scores
if (config.REINIT == 0) {
  console.log("MSG - save : lancement de la procédure de récupération...");
  score = await save_mgmt(score, "backup", client);
} else {
  console.log("MSG - save : lancement de la procédure de réinitialisation...");
}

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

  //Récupération données rôles

  if (!(roles.ROLE1.ROLETRSH < roles.ROLE2.ROLETRSH < roles.ROLE3.ROLETRSH < roles.ROLE4.ROLETRSH < roles.ROLE5.ROLETRSH)) {
    exit(-1);
  }

  roles['ROLE1']['ROLEDS'] = guild.roles.cache.find(role => role.name === config.TARGET_ROLES.Tier1.NM);
  roles['ROLE2']['ROLEDS'] = guild.roles.cache.find(role => role.name === config.TARGET_ROLES.Tier2.NM);
  roles['ROLE3']['ROLEDS'] = guild.roles.cache.find(role => role.name === config.TARGET_ROLES.Tier3.NM);
  roles['ROLE4']['ROLEDS'] = guild.roles.cache.find(role => role.name === config.TARGET_ROLES.Tier4.NM);
  roles['ROLE5']['ROLEDS'] = guild.roles.cache.find(role => role.name === config.TARGET_ROLES.Tier5.NM);

  roles['ROLE2']['LASTROLE'] = roles.ROLE1;
  roles['ROLE3']['LASTROLE'] = roles.ROLE2;
  roles['ROLE4']['LASTROLE'] = roles.ROLE3;
  roles['ROLE5']['LASTROLE'] = roles.ROLE4;

  roles_trsh[`${roles.ROLE1.ROLETRSH}`] = roles['ROLE1'];
  roles_trsh[`${roles.ROLE2.ROLETRSH}`] = roles['ROLE2'];
  roles_trsh[`${roles.ROLE3.ROLETRSH}`] = roles['ROLE3'];
  roles_trsh[`${roles.ROLE4.ROLETRSH}`] = roles['ROLE4'];
  roles_trsh[`${roles.ROLE5.ROLETRSH}`] = roles['ROLE5'];

  console.log("MSG - on_ready : rôles chargés");

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

  if (score[id_auth] == undefined) {
    score[id_auth] = 0;
  }
  score[id_auth]++;
  console.log(`DBG - on_message : ${msg.guild}, ${msg.author.username} (${id_auth}) : ${score[id_auth]}.`);

  for (const trsh in roles_trsh) {
    if (score[id_auth] == trsh) { //si l'utilisateur gagne un rank
      let role = roles_trsh[trsh];
      if (msg.member.roles.cache.has(role.ROLEDS.id)) {
        console.log(`ERR - on_message : l'utilisateur ${msg.author.username} (${id_auth}) a déjà le rôle ${role.ROLENAME}.`);
      } else {
        msg.member.roles.add(role.ROLEDS);
        msg.author.send({ content: role.ROLECG });
        console.log(`MSG - on_message : l'utilisateur ${msg.author.username} (${id_auth}) a maintenant le rôle ${role.ROLENAME}.`);
        send_log(`MSG - on_message : l'utilisateur ${msg.author.username} (${id_auth}) a maintenant le rôle ${role.ROLENAME}.`, true, client);
      };
      if (roles_trsh[trsh].LASTROLE != null) {
        msg.member.roles.remove(role.LASTROLE.ROLEDS);
      };
      break;
    }
  }
});

//Commandes ( voir comms-deploy.js pour l'édition de commandes )

client.on('interactionCreate', interaction => {
  //console.log("HERE");
  if (!interaction.isCommand()) {
    return;
  }

  const { commandName } = interaction;

  console.log("DBG - comms : c'est une commande.");

  if (commandName === 'didier') {
    interaction.reply('Didier');
  } else if (commandName === 'level') {

    let score_user = "0";
    if (score[String(interaction.user.id)] != undefined) {
      score_user = String(score[interaction.user.id]);
    }

    const date = new Date(Date.now());

    let user_rank = "None";
    if (!(score[String(interaction.user.id)] == 0 || score[String(interaction.user.id)] == undefined)) {
      for (const trsh in roles_trsh) {
        if (score[String(interaction.user.id)] < trsh) {
          break;
        } else {
          user_rank = roles_trsh[trsh].ROLENAME;
        }
      }
    }

    const LevelEmbed = new MessageEmbed()
      .setColor('#3B60E4')
      .setTitle(`${interaction.user.username}'s level`)
      .setAuthor({ name: `Gonta → ${interaction.user.username}`, iconURL: `${client.user.avatarURL()}` })
      .addFields(
        { name: 'Level', value: `${score_user}` },
        { name: 'Rank', value: `${user_rank}` }
      )
      .setThumbnail(`${interaction.user.avatarURL()}`)
      .setFooter({ text: `Powered by Gonta - ${date.getDate()}/${date.getMonth()}/${date.getFullYear()},${date.getHours()}:${date.getMinutes()}` });

    interaction.reply({ embeds: [LevelEmbed] });
  } else if (commandName === 'requ') {

    const date = new Date(Date.now());

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('bug')
          .setLabel('🐛')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('rank')
          .setLabel('🏆')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('feat')
          .setLabel('📧')
          .setStyle('PRIMARY'),
      );


    const RequEmbed = new MessageEmbed()
      .setColor('#3B60E4')
      .setTitle(`Do you need help, ${interaction.user.username} ?`)
      .setAuthor({ name: `Gonta → ${interaction.user.username}`, iconURL: `${client.user.avatarURL()}` })
      .setDescription("This bot is still under active development, and some functions may present some bugs or unclear features. If you need to contact the devs or the server's admin, you can use the buttons below, someone will answer you shortly.\n")
      .addFields(
        { name: '▶ :bug:', value: `**Bug found**`, inline: true },
        { name: '▶ :trophy:', value: `**Ranks problem**`, inline: true },
        { name: '▶ :love_letter:', value: `**Feature request**`, inline: true }
      )
      //.setThumbnail(`${interaction.user.avatarURL()}`)
      .setFooter({ text: `Powered by Gonta - ${date.getDate()}/${date.getMonth()}/${date.getFullYear()},${date.getHours()}:${date.getMinutes()}` });

    interaction.reply({ embeds: [RequEmbed], ephemeral: true, components: [row] });
    //requMess.react(':bug:');
    //requMess.react(':trophy:');
    //requMess.react(':love_letter:');
    //interaction.reply({ content: "**Check your DMs !** - Gonta"});
  }
});

client.on('interactionCreate', interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId == "bug") {
    send_log(`REQ - bug : ${interaction.user.username} (${interaction.user.id}) voudrait rapporter un bug.`, true, client);
  } else if (interaction.customId == "rank") {
    send_log(`REQ - rank : ${interaction.user.username} (${interaction.user.id}) voudrait rapporter un problème de rang.`, true, client);
  } else if (interaction.customId == "feat") {
    send_log(`REQ - feat : ${interaction.user.username} (${interaction.user.id}) voudrait suggérer une idée.`, true, client);
  }

  const date = new Date(Date.now());

  const RespEmbed = new MessageEmbed()
    .setColor('#3B60E4')
    .setTitle(`Thanks, ${interaction.user.username} !`)
    .setAuthor({ name: `Gonta → ${interaction.user.username}`, iconURL: `${client.user.avatarURL()}` })
    .setDescription("Your request has been sent to the devs/admins.\nPlease **don't spam the requests**, it may cause your requests to be ignored.")
    //.setThumbnail(`${interaction.user.avatarURL()}`)
    .setFooter({ text: `Powered by Gonta - ${date.getDate()}/${date.getMonth()}/${date.getFullYear()},${date.getHours()}:${date.getMinutes()}` });


  interaction.update({ embeds: [RespEmbed], components: [] })
});


client.login(config.BOT_TOKEN);
