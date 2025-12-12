const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ================================
// 🔵 Fake Meta-Verified Contact
// ================================
async function createVerifiedTruvaContact(sock) {
    return {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast"
        },
        message: {
            contactMessage: {
                displayName: "TruvaGPT Bot",
                vcard:
                    "BEGIN:VCARD\n" +
                    "VERSION:3.0\n" +
                    "FN:TruvaGPT Official\n" +
                    "ORG:TruvaGPT Systems;\n" +
                    "TEL;type=CELL:+00000000000\n" +
                    "END:VCARD"
            }
        }
    };
}

// Format uptime properly
function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

// Format RAM usage
function formatRam(total, free) {
    const used = (total - free) / (1024 * 1024 * 1024);
    const totalGb = total / (1024 * 1024 * 1024);
    const percent = ((used / totalGb) * 100).toFixed(1);
    return `${used.toFixed(1)}GB / ${totalGb.toFixed(1)}GB (${percent}%)`;
}

// Count total commands
function countCommands() {
    return 158; // Replace with actual command count
}

// Get mood emoji based on time
function getMoodEmoji() {
    const hour = getLagosTime().getHours();
    if (hour < 12) return '🌅';
    if (hour < 18) return '☀️';
    return '🌙';
}

// Get countdown to next day
function getCountdown() {
    const now = getLagosTime();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `(${hours}h ${minutes}m)`;
}

// Get current time in Africa/Lagos timezone
function getLagosTime() {
    try {
        const options = {
            timeZone: 'Africa/Lagos',
            hour12: false,
            hour: 'numeric',
            minute: 'numeric'
        };
        
        const formatter = new Intl.DateTimeFormat('en-GB', options);
        const parts = formatter.formatToParts(new Date());
        
        const hour = parts.find(part => part.type === 'hour').value;
        const minute = parts.find(part => part.type === 'minute').value;
        
        const now = new Date();
        const lagosDate = new Date(now.toLocaleString('en-US', {timeZone: 'Africa/Lagos'}));
        
        return lagosDate;
    } catch (error) {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        return new Date(utc + (3600000 * 1));
    }
}

// Format time specifically for Africa/Lagos
function formatLagosTime() {
    const lagosTime = getLagosTime();
    const hours = lagosTime.getHours().toString().padStart(2, '0');
    const minutes = lagosTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

async function helpCommand(sock, chatId, message) {

    // ================================
    // 🟦 Insert Verified Contact Here
    // ================================
    const verifiedQuote = await createVerifiedTruvaContact(sock);

    const helpMessage = `
┌─〔 ⚡ *TruvaGPT Bot Menu* ⚡ 〕
│
├◆ 👤 Owner: ${settings.botOwner || 'DevAfeez'}
├◆ 📌 Prefix: /
├◆ 🙍 User: ${message.pushName}
├◆ 💎 Plan: Free User ✓
├◆ 📦 Version: ${settings.version || 'Latest'}
├◆ 🕒 Time: ${formatLagosTime()} (Africa/Lagos)
├◆ ⏳ Uptime: ${formatUptime(process.uptime())}
├◆ 📊 Commands: ${countCommands()}
├◆ 📅 Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
├◆ 📆 Date: ${new Date().toLocaleDateString('en-GB')}
├◆ 💻 Platform: AI Web TruvaGPT
├◆ 🖥 Runtime: Node.js v${process.version.replace('v', '')}
├◆ ⚙ CPU: ${os.cpus()[0].model.split(' ')[0]} ${os.cpus()[0].speed}MHz
├◆ 🗂 RAM: ${formatRam(os.totalmem(), os.freemem())}
├◆ 🌐 Mode: ${settings.commandMode || 'Public'}
├◆ 🎭 Mood: ${getMoodEmoji()} ${getCountdown()}
└───────────────────◆

┌─〔 🛠 GENERAL COMMANDS 〕
├◆ /help | /menu
├◆ /ping | /alive
├◆ /tts <text> | /owner
├◆ /joke | /quote | /fact
├◆ /weather <city> | /news
├◆ /attp <text> | /lyrics <title>
├◆ /8ball <quest>
├◆ /groupinfo | /staff
├◆ /vv | /jid | /trt <txt> <lg>
├◆ /ss <link>
└───────────────────◆

┌─〔 🛡 ADMIN COMMANDS 〕
├◆ /ban | /kick @user
├◆ /promote | /demote @user
├◆ /mute <minutes> | /unmute
├◆ /delete | /clear
├◆ /warn | /warnings @user
├◆ /antilink | /antibadword | /antitag <on/off>
├◆ /tag <message> | /tagall
├◆ /chatbot
├◆ /resetlink | /vcf
├◆ /welcome <on/off> | /goodbye <on/off>
└───────────────────◆

┌─〔 👑 OWNER COMMANDS 〕
├◆ /mode | /update
├◆ /setpp <image>
├◆ /clearsession | /cleartmp
├◆ /autostatus | /autoreact <on/off>
├◆ /autotyping <on/off> | /autoread <on/off>
├◆ /anticall <on/off>
└───────────────────◆

┌─〔 🖼 IMAGE & STICKERS 〕
├◆ /blur <image> | /crop <image>
├◆ /simage <sticker> | /sticker <image>
├◆ /take <packname>
├◆ /meme | /emojimix
├◆ /igs <link> | /igsc <link>
├◆ /removebg | /remini
└───────────────────◆

┌─〔 🌏 PIES COMMANDS 〕
├◆ /pies <country>
├◆ /china | /indonesia | /japan | /korea | /hijab
└───────────────────◆

┌─〔 🎮 GAME COMMANDS 〕
├◆ /tictactoe @user
├◆ /hangman | /guess <letter>
├◆ /trivia | /answer <ans>
├◆ /truth | /dare
└───────────────────◆

┌─〔 🤖 AI COMMANDS 〕
├◆ /truvagpt <question>
├◆ /gemini <question>
├◆ /imagine <prompt>
├◆ /flux <prompt>
├◆ /bot <query>
└───────────────────◆

┌─〔 🎭 FUN COMMANDS 〕
├◆ /compliment | /insult @user
├◆ /flirt | /shayari | /goodnight
├◆ /roseday | /character @user
├◆ /wasted | /ship | /simp @user
├◆ /stupid @user [text]
└───────────────────◆

┌─〔 ✍ TEXTMAKER 〕
├◆ /metallic | /ice | /snow | /matrix
├◆ /neon | /devil | /purple | /thunder
├◆ /light | /arena | /hacker | /sand
├◆ /blackpink | /glitch | /fire
└───────────────────◆

┌─〔 ⬇️ DOWNLOADER 〕
├◆ /play | /song <name>
├◆ /ytmp4 <link> | /video <name>
├◆ /instagram | /facebook | /tiktok
├◆ /movie <title>
└───────────────────◆

┌─〔 💻 DEV COMMANDS 〕
├◆ /createapi <METHOD> <ENDPOINT> <RESPONSE_TYPE>
├◆ /dev | /developer
└───────────────────◆

┌─〔 🔧 TOOLS 〕
├◆ /tempnum <country-code>
├◆ /templist | /otpbox <number>
└───────────────────◆

┌─〔 🎲 MISC COMMANDS 〕
├◆ /heart | /horny | /circle | /lgbt
├◆ /lolice | /namecard | /oogway
├◆ /tweet | /ytcomment | /jail
├◆ /passed | /triggered | /glass
└───────────────────◆

┌─〔 🎌 ANIME COMMANDS 〕
├◆ /neko | /waifu | /loli
├◆ /nom | /poke | /cry | /kiss
├◆ /pat | /hug | /wink | /facepalm
└───────────────────◆

┌─〔 🐙 GITHUB 〕
├◆ /git | /github | /sc | /repo
└───────────────────◆

*🤖 Join my channel for more updates*
*✨ /bot <command> for main help*
`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: false,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401657714060@newsletter',
                        newsletterName: 'TruvaGPT',
                        serverMessageId: -1
                    }
                }
            }, { quoted: verifiedQuote }); // 🔵 ONLY CHANGE
        } else {
            console.error('Bot image not found at:', imagePath);
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: false,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401657714060@newsletter',
                        newsletterName: 'TruvaGPT',
                        serverMessageId: -1
                    } 
                }
            }, { quoted: verifiedQuote }); // 🔵 ONLY CHANGE
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage }, { quoted: verifiedQuote });
    }
}

module.exports = helpCommand;