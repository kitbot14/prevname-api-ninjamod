# NinjaMod Discord Bot

Ce projet est un **bot Discord** qui interagit avec une **API** pour récupérer et enregistrer des pseudos d'utilisateurs sur un serveur Discord. Il utilise **discord.js** pour l'interface Discord et **axios** pour communiquer avec l'API.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé Node.js et de disposer des éléments suivants :

- Un **token Discord Bot**.
- Un **ID de client Discord**.
- Un **ID de guilde Discord** (ID de serveur).
- Une **URL de l'API** et une **clé API** pour l'accès à l'API externe.

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/kitbot14/prevname-api-ninjamod.git
cd ninja-mod

npm install
```
{
  "DISCORD_TOKEN": "votre_token_discord",
  "CLIENT_ID": "votre_client_id",
  "GUILD_ID": "votre_guild_id",
  "API_URL": "https://exemple.com/api",
  "API_KEY": "votre_clé_api"
}
```

node index.js

ninja-mod-discord-bot/
├── index.js               # Fichier principal du bot
├── config.json          # Fichier de configuration
├── package.json         # Dépendances et informations du projet
└── README.md            # Documentation du projet


### Explications :
- **Installation** : Le fichier explique comment cloner le projet, installer les dépendances et configurer le bot avec un fichier `config.json`.
- **Commandes** : La commande `/prevnames` est détaillée, avec une description de son fonctionnement.
- **Structure du projet** : Une vue d'ensemble de l'organisation des fichiers.
- **Dépannage** : Quelques erreurs courantes sont expliquées.
- **Contribuer** : Encourage les contributions à travers des pull requests.

Cela devrait fournir une bonne base pour que d'autres utilisateurs puissent installer, configurer et utiliser votre bot.

