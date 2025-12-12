const fs = require('fs');
const path = require('path');

// Full command info
const commandInfo = {
    // GENERAL COMMANDS
    help: { description: "Displays the bot menu or list of commands", usage: "/help or /menu", whoCanUse: "Everyone", category: "General Commands" },
    menu: { description: "Same as /help", usage: "/menu", whoCanUse: "Everyone", category: "General Commands" },
    ping: { description: "Checks if the bot is alive", usage: "/ping or /alive", whoCanUse: "Everyone", category: "General Commands" },
    alive: { description: "Same as /ping", usage: "/alive", whoCanUse: "Everyone", category: "General Commands" },
    tts: { description: "Converts text to speech", usage: "/tts <text>", whoCanUse: "Everyone", category: "General Commands" },
    owner: { description: "Displays the bot owner contact", usage: "/owner", whoCanUse: "Everyone", category: "General Commands" },
    joke: { description: "Sends a random joke", usage: "/joke", whoCanUse: "Everyone", category: "General Commands" },
    quote: { description: "Sends a random quote", usage: "/quote", whoCanUse: "Everyone", category: "General Commands" },
    fact: { description: "Sends a random fact", usage: "/fact", whoCanUse: "Everyone", category: "General Commands" },
    weather: { description: "Shows weather info for a city", usage: "/weather <city>", whoCanUse: "Everyone", category: "General Commands" },
    news: { description: "Shows latest news", usage: "/news", whoCanUse: "Everyone", category: "General Commands" },
    attp: { description: "Generates sticker from text", usage: "/attp <text>", whoCanUse: "Everyone", category: "General Commands" },
    lyrics: { description: "Shows lyrics for a song", usage: "/lyrics <title>", whoCanUse: "Everyone", category: "General Commands" },
    "8ball": { description: "Ask the magic 8-ball a question", usage: "/8ball <question>", whoCanUse: "Everyone", category: "General Commands" },
    groupinfo: { description: "Shows group info", usage: "/groupinfo", whoCanUse: "Everyone", category: "General Commands" },
    staff: { description: "Displays group staff info", usage: "/staff", whoCanUse: "Everyone", category: "General Commands" },
    vv: { description: "Get voice/video info", usage: "/vv", whoCanUse: "Everyone", category: "General Commands" },
    jid: { description: "Get WhatsApp ID info", usage: "/jid", whoCanUse: "Everyone", category: "General Commands" },
    trt: { description: "Translate text", usage: "/trt <text> <lang>", whoCanUse: "Everyone", category: "General Commands" },
    ss: { description: "Take screenshot of website", usage: "/ss <link>", whoCanUse: "Everyone", category: "General Commands" },

    // ADMIN COMMANDS
    ban: { description: "Bans or kicks a user", usage: "/ban or /kick @user", whoCanUse: "Admins", category: "Admin Commands" },
    promote: { description: "Promotes a member to admin", usage: "/promote @user", whoCanUse: "Admins", category: "Admin Commands" },
    demote: { description: "Demotes an admin to member", usage: "/demote @user", whoCanUse: "Admins", category: "Admin Commands" },
    mute: { description: "Mutes a member for a duration", usage: "/mute <minutes>", whoCanUse: "Admins", category: "Admin Commands" },
    unmute: { description: "Unmutes a member", usage: "/unmute", whoCanUse: "Admins", category: "Admin Commands" },
    delete: { description: "Deletes a message", usage: "/delete", whoCanUse: "Admins", category: "Admin Commands" },
    clear: { description: "Clears messages", usage: "/clear", whoCanUse: "Admins", category: "Admin Commands" },
    warn: { description: "Warns a member", usage: "/warn @user", whoCanUse: "Admins", category: "Admin Commands" },
    warnings: { description: "Shows warnings of a user", usage: "/warnings @user", whoCanUse: "Admins", category: "Admin Commands" },
    antilink: { description: "Protects group from links", usage: "/antilink", whoCanUse: "Admins", category: "Admin Commands" },
    antibadword: { description: "Filters bad words", usage: "/antibadword", whoCanUse: "Admins", category: "Admin Commands" },
    antitag: { description: "Control mention tagging", usage: "/antitag <on/off>", whoCanUse: "Admins", category: "Admin Commands" },
    tag: { description: "Mentions someone", usage: "/tag <message>", whoCanUse: "Admins", category: "Admin Commands" },
    tagall: { description: "Mentions all members", usage: "/tagall", whoCanUse: "Admins", category: "Admin Commands" },
    chatbot: { description: "Enables group chatbot", usage: "/chatbot", whoCanUse: "Admins", category: "Admin Commands" },
    resetlink: { description: "Resets group invite link", usage: "/resetlink", whoCanUse: "Admins", category: "Admin Commands" },
    vcf: { description: "Exports contact vCard", usage: "/vcf", whoCanUse: "Admins", category: "Admin Commands" },
    welcome: { description: "Enable or set welcome message", usage: "/welcome <on/off>", whoCanUse: "Admins", category: "Admin Commands" },
    goodbye: { description: "Enable or set goodbye message", usage: "/goodbye <on/off>", whoCanUse: "Admins", category: "Admin Commands" },

    // OWNER COMMANDS
    mode: { description: "Changes bot mode", usage: "/mode", whoCanUse: "Owner", category: "Owner Commands" },
    update: { description: "Updates bot", usage: "/update", whoCanUse: "Owner", category: "Owner Commands" },
    setpp: { description: "Sets profile picture", usage: "/setpp <image>", whoCanUse: "Owner", category: "Owner Commands" },
    clearsession: { description: "Clears current session", usage: "/clearsession", whoCanUse: "Owner", category: "Owner Commands" },
    cleartmp: { description: "Clears temporary files", usage: "/cleartmp", whoCanUse: "Owner", category: "Owner Commands" },
    autostatus: { description: "Sets auto status", usage: "/autostatus", whoCanUse: "Owner", category: "Owner Commands" },
    autoreact: { description: "Auto reacts to messages", usage: "/autoreact <on/off>", whoCanUse: "Owner", category: "Owner Commands" },
    autotyping: { description: "Shows typing automatically", usage: "/autotyping <on/off>", whoCanUse: "Owner", category: "Owner Commands" },
    autoread: { description: "Auto reads messages", usage: "/autoread <on/off>", whoCanUse: "Owner", category: "Owner Commands" },
    anticall: { description: "Blocks incoming calls", usage: "/anticall <on/off>", whoCanUse: "Owner", category: "Owner Commands" },

    // IMAGE & STICKERS
    blur: { description: "Blurs an image", usage: "/blur <image>", whoCanUse: "Everyone", category: "Image & Stickers" },
    crop: { description: "Crops an image", usage: "/crop <image>", whoCanUse: "Everyone", category: "Image & Stickers" },
    simage: { description: "Converts image to sticker", usage: "/simage <sticker>", whoCanUse: "Everyone", category: "Image & Stickers" },
    sticker: { description: "Converts image to sticker", usage: "/sticker <image>", whoCanUse: "Everyone", category: "Image & Stickers" },
    take: { description: "Sets packname for sticker", usage: "/take <packname>", whoCanUse: "Everyone", category: "Image & Stickers" },
    meme: { description: "Generates a meme", usage: "/meme", whoCanUse: "Everyone", category: "Image & Stickers" },
    emojimix: { description: "Combines emojis", usage: "/emojimix", whoCanUse: "Everyone", category: "Image & Stickers" },
    igs: { description: "Downloads Instagram image/video", usage: "/igs <link>", whoCanUse: "Everyone", category: "Image & Stickers" },
    igsc: { description: "Downloads Instagram story", usage: "/igsc <link>", whoCanUse: "Everyone", category: "Image & Stickers" },
    removebg: { description: "Removes background from image", usage: "/removebg", whoCanUse: "Everyone", category: "Image & Stickers" },
    remini: { description: "Enhances image", usage: "/remini", whoCanUse: "Everyone", category: "Image & Stickers" },

    // PIES COMMANDS
    pies: { description: "Shows pies for a country", usage: "/pies <country>", whoCanUse: "Everyone", category: "PIES Commands" },
    china: { description: "Shows China pie", usage: "/china", whoCanUse: "Everyone", category: "PIES Commands" },
    indonesia: { description: "Shows Indonesia pie", usage: "/indonesia", whoCanUse: "Everyone", category: "PIES Commands" },
    japan: { description: "Shows Japan pie", usage: "/japan", whoCanUse: "Everyone", category: "PIES Commands" },
    korea: { description: "Shows Korea pie", usage: "/korea", whoCanUse: "Everyone", category: "PIES Commands" },
    hijab: { description: "Shows hijab pie", usage: "/hijab", whoCanUse: "Everyone", category: "PIES Commands" },

    // GAME COMMANDS
    tictactoe: { description: "Play TicTacToe with a user", usage: "/tictactoe @user", whoCanUse: "Everyone", category: "Game Commands" },
    hangman: { description: "Play Hangman", usage: "/hangman", whoCanUse: "Everyone", category: "Game Commands" },
    guess: { description: "Guess a letter", usage: "/guess <letter>", whoCanUse: "Everyone", category: "Game Commands" },
    trivia: { description: "Answer trivia questions", usage: "/trivia", whoCanUse: "Everyone", category: "Game Commands" },
    answer: { description: "Answer trivia", usage: "/answer <ans>", whoCanUse: "Everyone", category: "Game Commands" },
    truth: { description: "Truth or dare game", usage: "/truth", whoCanUse: "Everyone", category: "Game Commands" },
    dare: { description: "Truth or dare game", usage: "/dare", whoCanUse: "Everyone", category: "Game Commands" },

    // AI COMMANDS
    truvagpt: { description: "Ask TruvaGPT a question", usage: "/truvagpt <question>", whoCanUse: "Everyone", category: "AI Commands" },
    gemini: { description: "Ask Gemini AI a question", usage: "/gemini <question>", whoCanUse: "Everyone", category: "AI Commands" },
    imagine: { description: "Generate image from prompt", usage: "/imagine <prompt>", whoCanUse: "Everyone", category: "AI Commands" },
    flux: { description: "Ask Flux AI", usage: "/flux <prompt>", whoCanUse: "Everyone", category: "AI Commands" },
    bot: { description: "Get info about a command", usage: "/bot <command>", whoCanUse: "Everyone", category: "AI Commands" },

    // FUN COMMANDS
    compliment: { description: "Compliment a user", usage: "/compliment", whoCanUse: "Everyone", category: "Fun Commands" },
    insult: { description: "Insult a user", usage: "/insult @user", whoCanUse: "Everyone", category: "Fun Commands" },
    flirt: { description: "Flirt with someone", usage: "/flirt", whoCanUse: "Everyone", category: "Fun Commands" },
    shayari: { description: "Send shayari", usage: "/shayari", whoCanUse: "Everyone", category: "Fun Commands" },
    goodnight: { description: "Send goodnight message", usage: "/goodnight", whoCanUse: "Everyone", category: "Fun Commands" },
    roseday: { description: "Send rose day wishes", usage: "/roseday", whoCanUse: "Everyone", category: "Fun Commands" },
    character: { description: "Send character info", usage: "/character @user", whoCanUse: "Everyone", category: "Fun Commands" },
    wasted: { description: "Send wasted image", usage: "/wasted", whoCanUse: "Everyone", category: "Fun Commands" },
    ship: { description: "Ship two users", usage: "/ship", whoCanUse: "Everyone", category: "Fun Commands" },
    simp: { description: "Simulate simp", usage: "/simp @user", whoCanUse: "Everyone", category: "Fun Commands" },
    stupid: { description: "Send stupid message", usage: "/stupid @user [text]", whoCanUse: "Everyone", category: "Fun Commands" },

    // TEXTMAKER COMMANDS
    metallic: { description: "Text effect metallic", usage: "/metallic", whoCanUse: "Everyone", category: "Textmaker Commands" },
    ice: { description: "Text effect ice", usage: "/ice", whoCanUse: "Everyone", category: "Textmaker Commands" },
    snow: { description: "Text effect snow", usage: "/snow", whoCanUse: "Everyone", category: "Textmaker Commands" },
    matrix: { description: "Text effect matrix", usage: "/matrix", whoCanUse: "Everyone", category: "Textmaker Commands" },
    neon: { description: "Text effect neon", usage: "/neon", whoCanUse: "Everyone", category: "Textmaker Commands" },
    devil: { description: "Text effect devil", usage: "/devil", whoCanUse: "Everyone", category: "Textmaker Commands" },
    purple: { description: "Text effect purple", usage: "/purple", whoCanUse: "Everyone", category: "Textmaker Commands" },
    thunder: { description: "Text effect thunder", usage: "/thunder", whoCanUse: "Everyone", category: "Textmaker Commands" },
    light: { description: "Text effect light", usage: "/light", whoCanUse: "Everyone", category: "Textmaker Commands" },
    arena: { description: "Text effect arena", usage: "/arena", whoCanUse: "Everyone", category: "Textmaker Commands" },
    hacker: { description: "Text effect hacker", usage: "/hacker", whoCanUse: "Everyone", category: "Textmaker Commands" },
    sand: { description: "Text effect sand", usage: "/sand", whoCanUse: "Everyone", category: "Textmaker Commands" },
    blackpink: { description: "Text effect blackpink", usage: "/blackpink", whoCanUse: "Everyone", category: "Textmaker Commands" },
    glitch: { description: "Text effect glitch", usage: "/glitch", whoCanUse: "Everyone", category: "Textmaker Commands" },
    fire: { description: "Text effect fire", usage: "/fire", whoCanUse: "Everyone", category: "Textmaker Commands" },

    // DOWNLOADER
    play: { description: "Download song from YouTube", usage: "/play | /song <name>", whoCanUse: "Everyone", category: "Downloader Commands" },
    ytmp4: { description: "Download YouTube video", usage: "/ytmp4 <link>", whoCanUse: "Everyone", category: "Downloader Commands" },
    video: { description: "Download video by name", usage: "/video <name>", whoCanUse: "Everyone", category: "Downloader Commands" },
    instagram: { description: "Download Instagram media", usage: "/instagram", whoCanUse: "Everyone", category: "Downloader Commands" },
    facebook: { description: "Download Facebook media", usage: "/facebook", whoCanUse: "Everyone", category: "Downloader Commands" },
    tiktok: { description: "Download TikTok media", usage: "/tiktok", whoCanUse: "Everyone", category: "Downloader Commands" },
    movie: { description: "Get movie info", usage: "/movie <title>", whoCanUse: "Everyone", category: "Downloader Commands" },

    // DEV COMMANDS
    createapi: { description: "Create API endpoint", usage: "/createapi <METHOD> <ENDPOINT> <RESPONSE_TYPE>", whoCanUse: "Developers", category: "Dev Commands" },
    dev: { description: "Developer info", usage: "/dev | /developer", whoCanUse: "Developers", category: "Dev Commands" },

    // TOOLS
    tempnum: { description: "Get temporary number", usage: "/tempnum <country-code>", whoCanUse: "Everyone", category: "Tools Commands" },
    templist: { description: "Get list of temporary numbers", usage: "/templist", whoCanUse: "Everyone", category: "Tools Commands" },
    otpbox: { description: "Get OTP from number", usage: "/otpbox <number>", whoCanUse: "Everyone", category: "Tools Commands" },

    // MISC COMMANDS
lolice: { description: "Shows lolice image or effect", usage: "/lolice", whoCanUse: "Everyone", category: "Misc Commands" },
namecard: { description: "Generates a namecard image", usage: "/namecard username|birthday|description(optional)", whoCanUse: "Everyone", category: "Misc Commands" },
oogway: { description: "Shows oogway effect", usage: "/oogway", whoCanUse: "Everyone", category: "Misc Commands" },
tweet: { description: "Shows tweet info", usage: "/tweet", whoCanUse: "Everyone", category: "Misc Commands" },
ytcomment: { description: "Generates YouTube comment effect", usage: "/ytcomment", whoCanUse: "Everyone", category: "Misc Commands" },
jail: { description: "Generates jail image effect", usage: "/jail", whoCanUse: "Everyone", category: "Misc Commands" },
passed: { description: "Generates passed effect", usage: "/passed", whoCanUse: "Everyone", category: "Misc Commands" },
triggered: { description: "Generates triggered effect", usage: "/triggered", whoCanUse: "Everyone", category: "Misc Commands" },
glass: { description: "Glass effect image", usage: "/glass", whoCanUse: "Everyone", category: "Misc Commands" },

// ANIME COMMANDS
neko: { description: "Sends neko image", usage: "/neko", whoCanUse: "Everyone", category: "Anime Commands" },
waifu: { description: "Sends waifu image", usage: "/waifu", whoCanUse: "Everyone", category: "Anime Commands" },
loli: { description: "Sends loli image", usage: "/loli", whoCanUse: "Everyone", category: "Anime Commands" },
nom: { description: "Noms another user", usage: "/nom", whoCanUse: "Everyone", category: "Anime Commands" },
poke: { description: "Poke another user", usage: "/poke", whoCanUse: "Everyone", category: "Anime Commands" },
cry: { description: "Cry image or effect", usage: "/cry", whoCanUse: "Everyone", category: "Anime Commands" },
kiss: { description: "Kiss another user", usage: "/kiss", whoCanUse: "Everyone", category: "Anime Commands" },
pat: { description: "Pat another user", usage: "/pat", whoCanUse: "Everyone", category: "Anime Commands" },
hug: { description: "Hug another user", usage: "/hug", whoCanUse: "Everyone", category: "Anime Commands" },
wink: { description: "Wink another user", usage: "/wink", whoCanUse: "Everyone", category: "Anime Commands" },
facepalm: { description: "Facepalm image effect", usage: "/facepalm", whoCanUse: "Everyone", category: "Anime Commands" },

// GITHUB COMMANDS
git: { description: "Git info", usage: "/git", whoCanUse: "Everyone", category: "GitHub Commands" },
github: { description: "Same as /git", usage: "/github", whoCanUse: "Everyone", category: "GitHub Commands" },
sc: { description: "Shows source code info", usage: "/sc", whoCanUse: "Everyone", category: "GitHub Commands" },
repo: { description: "Shows repo info", usage: "/repo", whoCanUse: "Everyone", category: "GitHub Commands" },

};

// Main function to send command info
async function truvagptCommand(sock, chatId, message, args) {
    const commandName = args[0]?.toLowerCase();

    if (!commandName) {
        await sock.sendMessage(chatId, { text: "📌 Usage: /bot <command>\nExample: /bot tagall\n\nSee details about any command." }, { quoted: message });
        return;
    }

    const info = commandInfo[commandName];
    if (!info) {
        await sock.sendMessage(chatId, { text: `❌ Command "${commandName}" not found.` }, { quoted: message });
        return;
    }

    const reply = `
┌─〔 🤖 Command Info 〕
├◆ Command: ${commandName}
├◆ Description: ${info.description}
├◆ Usage: ${info.usage}
├◆ Who Can Use: ${info.whoCanUse}
├◆ Category: ${info.category}
└───────────────────◆
`;

    // Optional image
    const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
    if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        await sock.sendMessage(chatId, { image: imageBuffer, caption: reply, contextInfo: { forwardingScore: 1, isForwarded: false } }, { quoted: message });
    } else {
        await sock.sendMessage(chatId, { text: reply }, { quoted: message });
    }
}

module.exports = truvagptCommand;