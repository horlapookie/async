# TruvaGPT WhatsApp Bot

## Overview
TruvaGPT is a feature-rich WhatsApp bot built with Node.js using the Baileys library. It provides various commands for group management, media processing, games, AI chat, and more.

## Project Structure
```
├── index.js          # Main entry point - handles WhatsApp connection
├── main.js           # Message handling and command routing
├── config.js         # API configurations
├── settings.js       # Bot settings (owner, packname, etc.)
├── commands/         # Individual command handlers
├── lib/              # Utility libraries and helpers
├── data/             # JSON data storage for bot state
├── assets/           # Static assets (images, stickers)
└── session/          # WhatsApp session credentials
```

## Setup Instructions

### First-Time Setup
1. Run the workflow "WhatsApp Bot"
2. The bot will prompt for your WhatsApp phone number (format: countrycode + number without + or spaces)
3. Enter your number and you'll receive a pairing code
4. Open WhatsApp > Settings > Linked Devices > Link a Device
5. Enter the pairing code displayed in the console
6. The bot will connect and store session credentials in the `session/` folder

### Required Configuration
- `settings.js`: Configure owner number, bot name, and other settings
- `config.js`: API keys for various services

## Running the Bot
The bot runs as a console application via the "WhatsApp Bot" workflow. It will:
- Connect to WhatsApp servers
- Listen for incoming messages
- Process commands (starting with `/`)
- Auto-reconnect on disconnection

## Key Features
- Group management (kick, ban, mute, promote, demote)
- Sticker creation and conversion
- AI chat integration
- Media downloading (YouTube, TikTok, Instagram, Facebook)
- Games (Tic-Tac-Toe, Hangman, Trivia)
- Antilink, Antibadword moderation
- Welcome/Goodbye messages
- And many more!

## Commands
Use `/help` or `/menu` to see all available commands in WhatsApp.

## Dependencies
- Node.js 20
- FFmpeg (for media processing)
- Various npm packages (see package.json)

## Recent Changes
- December 12, 2025: Fixed syntax errors in main.js, lib/welcome.js, commands/antidelete.js, commands/facebook.js
- December 12, 2025: Configured for Replit environment with FFmpeg support
