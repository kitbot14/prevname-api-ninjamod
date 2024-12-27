const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');
const fs = require('fs');


// Chargement de la configuration depuis config.json
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
        description: 'Récupère tous les pseudos enregistrés pour un utilisateur.',
        options: [
            {
                name: 'user',
                type: 6, // Type 6 = utilisateur
                description: 'L\'utilisateur dont vous voulez voir les pseudos.',
                required: false,
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(token);

// Enregistrement des commandes Slash
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

// Démarrage du bot
client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

// Détection des changements de pseudo
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const oldNickname = oldMember.nickname || null; // Ancien pseudo d'affichage
    const newNickname = newMember.nickname || null; // Nouveau pseudo d'affichage

    const oldUsername = oldMember.user.username; // Ancien nom d'utilisateur
    const newUsername = newMember.user.username; // Nouveau nom d'utilisateur

    // Détecter si le pseudo d'affichage ou le nom d'utilisateur a changé
    if (oldNickname !== newNickname || oldUsername !== newUsername) {
        const userId = newMember.user.id;
        const newName = newNickname || newUsername; // Priorité au pseudo d'affichage

        const data = { 
            user_id: userId, 
            username: newName
        };

        try {
            const response = await axios.post(`${apiUrl}/api/update_name`, data, {
                headers: {
                    'Authorization': apiKey,
                    'bot-id': clientId
                }
            });
            console.log(`Nom mis à jour dans la base de données : ${newName} pour l'utilisateur ${userId}`);
        } catch (error) {
            console.error('Erreur lors de l\'appel à l\'API:', error.response ? error.response.data : error.message);
            console.log('Ancien pseudo :', oldNickname, ' | Nouveau pseudo :', newNickname);
            console.log('Ancien nom d\'utilisateur :', oldUsername, ' | Nouveau nom d\'utilisateur :', newUsername);
        }
    }
});

// Commande /prevnames pour récupérer les pseudos enregistrés
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
            const response = await axios.get(`${apiUrl}/api/get_names`, {
                params: { user_id: userId },
                headers: {
                    'Authorization': apiKey,
                    'bot-id': clientId
                }
            });

            const pseudonyms = response.data.pseudonyms || [];

            if (pseudonyms.length === 0) {
                await interaction.reply(`Aucun pseudo trouvé pour ${user.username}.`);
            } else {
                // Formater les pseudonymes et les timestamps
                const formattedNames = pseudonyms.map(entry => {
                    const date = new Date(entry.timestamp * 1000).toLocaleString(); // Convertir le timestamp en date lisible
                    return `**${entry.old_name}** - changé le ${date}`;
                }).join('\n');

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`Pseudos enregistrés pour ${user.username}`)
                    .setDescription(formattedNames)
                    .setFooter({ text: 'NinjaMod | Historique des pseudos.' });

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des noms:', error.response ? error.response.data : error.message);
            await interaction.reply('Aucun pseudo trouvé.');
        }
    }
});

// Connexion au bot
client.login(token);
