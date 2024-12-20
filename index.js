const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const token = config.DISCORD_TOKEN;
const clientId = config.CLIENT_ID;
const guildId = config.GUILD_ID;

const apiUrl = config.API_URL;
const apiKey = config.API_KEY;

const commands = [
    {
        name: 'prevnames',
        description: 'Récupère tous les pseudos et noms d\'affichage enregistrés pour un utilisateur.',
        options: [
            {
                name: 'user',
                type: 6,  // Type 6 = utilisateur
                description: 'L\'utilisateur dont vous voulez voir les pseudos.',
                required: false,
            },
        ],
    },
];

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Début de l\'enregistrement des commandes slash.');

        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands,
        });

        console.log('Commandes slash enregistrées.');
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement des commandes slash:', error);
    }
})();

client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.nickname !== newMember.nickname || oldMember.user.username !== newMember.user.username) {
        const userId = newMember.user.id;
        const newPseudo = newMember.nickname || newMember.user.username;
        const displayName = newMember.user.username;

        const data = { 
            user_id: userId, 
            username: newPseudo,
        };

        try {
            const response = await axios.post(`${apiUrl}/api/update_name`, data, {
                headers: {
                    'Authorization': apiKey,
                    'bot-id': clientId
                }
            });
            console.log(`Pseudo et nom d'affichage mis à jour pour ${userId}: ${newPseudo} / ${displayName}`);
        } catch (error) {
            if (error.response) {
                console.error('Erreur API:', error.response.data);
                if (error.response.status === 403) {
                    console.error('La clé API est invalide ou le bot n\'est pas autorisé.');
                }
                if (error.response.status === 404) {
                    console.error('L\'URL de l\'API est incorrecte ou le service est inaccessible.');
                }
            } else {
                console.error('Erreur inconnue:', error.message);
            }
        }
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'prevnames') {
        let user = interaction.options.getUser('user');

        if (!user) {
            user = interaction.user;
        }

        const userId = user.id;

        try {
            const response = await axios.get(`${apiUrl}/get_names`, {
                params: { user_id: userId },
                headers: {
                    'Authorization': apiKey,
                    'bot-id': clientId
                }
            });

            if (!response.data || !response.data.names) {
                await interaction.reply(`Aucun pseudo ou nom d'affichage trouvé pour ${user.username}.`);
                return;
            }

            const names = response.data.names || [];
            const displayNames = response.data.display_names || [];

            if (names.length === 0 && displayNames.length === 0) {
                await interaction.reply(`Aucun pseudo ou nom d'affichage trouvé pour ${user.username}.`);
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`Pseudos et noms d'affichage enregistrés pour ${user.username}`)
                    .setDescription(
                        `**Pseudos :**\n${names.join('\n')}\n\n**Noms d'affichage :**\n${displayNames.join('\n')}`
                    )
                    .setFooter({ text: 'NinjaMod | Api | Beta | Prevname.' });

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            if (error.response) {
                console.error('Erreur API:', error.response.data);
                if (error.response.status === 403) {
                    await interaction.reply('La clé API est invalide ou le bot n\'est pas autorisé.');
                } else if (error.response.status === 404) {
                    await interaction.reply('Désolé, nous n\'avons pas enregistré de nom pour vous.');
                } else {
                    await interaction.reply('Une erreur est survenue lors de la récupération des données. Vérifiez si l\'utilisateur a bien des pseudos enregistrés.');
                }
            } else {
                console.error('Erreur inconnue:', error.message);
                await interaction.reply('Une erreur inconnue est survenue.');
            }
        }
    }
});

client.login(token);
