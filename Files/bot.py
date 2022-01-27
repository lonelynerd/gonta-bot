###############################################
# Gonta-bot ver1.0.3.2                        #
#                                             #
# by Nerd                                     #
#                                             #
# Limits access to certain rooms according to #
# to a number of messages.                    #
###############################################

import discord
from dotenv import dotenv_values
import csv


class Gonta(discord.Client):
    async def on_ready(self):
        print("init done")  # if overwrite doesn't work


intents = discord.Intents.default()
intents.members = True
client = Gonta(intents=intents)

config_env = dotenv_values(".env")
debug_mode = int(config_env["DEBUG_M"])
if debug_mode:
    print(config_env)

GUILD = config_env["GUILD_ID"]
NAME = config_env["GUILD_NAME"]

welcome_message = config_env["WELC_MESS"]
reinit = int(config_env["REINIT"])
write_log = int(config_env["WRITE_LOG"])

message_treshold = int(config_env["MESS_TRESH"])
done_value = int(config_env["DONE_VAL"])
score_mul = int(config_env["SCORE_MUL"])
target_role = config_env["TARGET_ROLE"]
congrats = config_env["CONGRATS"]
dm_error = config_env["DM_ERROR"]


def score_management(reinit_l, members_l, score_l):
    if reinit_l:
        for usr in members_l:
            score_l[str(usr.id)] = 0
        # reinit_l=False
        print("Reinitialisation done")
        return score_l
    else:
        with open('score.csv') as csv_file:
            reader = csv.reader(csv_file)
            score_l = dict(reader)
        print("Back on track done")
        return score_l
    return score_l


def score_update(score_l):
    with open('score.csv', 'w') as csv_file:
        writer = csv.writer(csv_file)
        for key, value in score_l.items():
            writer.writerow([key, value])
    return 1


@client.event
async def on_ready():
    score = {}

    print(welcome_message)

    for guild in client.guilds:
        if guild.name == NAME:
            break

    score = score_management(reinit, guild.members, score)

    if write_log and reinit:
        score_update(score)

    if debug_mode:
        print("Logged as :")
        print(client.user.name)
        print(client.user.id)
        print("-----\nScore :")
        print(score)
        print("-----")
        print("Log available at Gonta-bot/score.csv")
        print("-----\n")


@client.event
async def on_message(message):
    for guild in client.guilds:
        if guild.name == NAME:
            break

    with open('score.csv') as csv_file:
        reader = csv.reader(csv_file)
        score = dict(reader)

    role = discord.utils.get(guild.roles, name=target_role)
    id = message.author.id

    if message.channel.type == discord.ChannelType.private and message.author != client.user :
        print("User [", str(id), "] tried to fool me by Dming me.")
        await message.author.send(dm_error)
        pass
    else :
        try:
            user_score = int(score[str(id)])
        except:
            score[str(id)] = "0"
            user_score = int(score[str(id)])

        if user_score == done_value:
            if debug_mode:
                print("User [", str(id), "] already got the value.")
        elif message.author == client.user :
            pass
        else:
            score[str(id)] = str(int(score[str(id)]) + 1 * score_mul)

        if debug_mode and message.author != client.user:
            print(str(id) + " : " + score[str(id)])

        if int(score[str(id)]) >= message_treshold:
            score[str(id)] = str(done_value)
            await message.author.add_roles(role)
            await message.author.send(congrats)
            if debug_mode:
                print("User [", str(id), "] is now able to join the locked room.")

        if write_log:
            score_update(score)


client.run(config_env["BOT_TOKEN"])
