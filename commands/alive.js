// This plugin was created by DevAfeez 
// Don't Edit Or share without given me credits 

const axios = require('axios');
const os = require('os');
const moment = require('moment');
const settings = require('../settings');
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

async function aliveCommand(sock, chatId, message) {
    try {
        // Get system information
        const uptime = formatUptime(process.uptime());
        const ramUsage = formatRam(os.totalmem(), os.freemem());
        const cpuModel = os.cpus()[0].model.split(' ')[0];
        const cpuSpeed = os.cpus()[0].speed;
        const platform = `${process.platform} ${os.release()}`;
        const nodeVersion = process.version.replace('v', '');
        
        // Format current time and date
        const now = moment();
        const currentTime = now.format("HH:mm:ss");
        const currentDate = now.format("dddd, MMMM Do YYYY");
        
        // Create animated status indicator
        const statusIndicators = ['⠇', '⠧', '⠏', '⠛', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧'];
        const randomIndicator = statusIndicators[Math.floor(Math.random() * statusIndicators.length)];
        
        // Create animated loading bar
        const loadingBarLength = 15;
        const filledLength = Math.floor(Math.random() * loadingBarLength);
        const loadingBar = '▰'.repeat(filledLength) + '▱'.repeat(loadingBarLength - filledLength);
        
        // Format the alive message with animation effects
        const aliveMessage = `
╔══ ✦ *TruvaGPT Bot Status* ✦ ══╗
      🤖 Powered by DevAfeez
╚═══════════════════════╝
│
├◆ ✅ *Status:* Online & Stable
├◆ ⏱️ *Uptime:* ${uptime}
├◆ 📅 *Date:* ${currentDate}
├◆ ⏰ *Time:* ${currentTime}
├◆ 💻 *Platform:* AI Web – TruvaGPT
├◆ ⚙️ *Runtime:* Node.js ${nodeVersion}
├◆ 📦 *Version:* ${settings.version || '1.0.0'}
├◆ 🔐 *Mode:* ${settings.mode || 'Public'}
│
├◆ 📊 *System Resources:*
├◆ 💾 RAM: ${ramUsage}
├◆ ⚙️ CPU: ${cpuModel} @ ${cpuSpeed}MHz
├◆ 🖥️ OS: ${platform}
│
├◆ 🌟 *Core Features:*
├◆ • Smart AI Chat (/truvagpt)
├◆ • Gemini Integration (/gemini)
├◆ • Movie & Media Tools
├◆ • Group Management Tools
├◆ • API Builder Utility
│
├◆ 📈 *System Health:* ${loadingBar} ${Math.floor(Math.random() * 100)}%
│
└❏ *Thank you for choosing TruvaGPT!*  
━━━━━━━━━━━━━━━━━━━━━━━
⚡ *TruvaGPT is active and ready!*  
💡 Type */help* to explore commands.  
━━━━━━━━━━━━━━━━━━━━━━━
`;

        // Send the alive message with animated image
        await sock.sendMessage(chatId, {
            video: { url: 'https://files.catbox.moe/op8uzc.mp4' },
            caption: aliveMessage,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: false,
                mentionedJid: [message.key.remoteJid],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401657714060@newsletter',
                    newsletterName: 'TruvaGPT',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Alive Command Error:', error);
        
        // Create error box
        const errorBox = `╔══ ✦ *Alive Error* ✦ ══╗
      🤖 Powered by DevAfeez
╚═══════════════════════╝
│
├◆ ❌ Failed to check bot status
├◆ 🔍 Error: ${error.message.substring(0, 50)}...
└ ❏`;
        
        await sock.sendMessage(chatId, {
            text: errorBox,
            react: { text: '❌', key: message.key }
        });
    }
}

module.exports = aliveCommand;