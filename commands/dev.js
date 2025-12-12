// 🤖 TruvaGPT Developer Command — All-in-One Version
// Created by DevAfeez | https://wa.me/2348029214393
// Do not edit or share without giving proper credit.

const settings = require('../settings');

async function devCommand(sock, chatId, message, prefix = "/") {
    try {
        const command = (message.body || message.message?.conversation || "")
            .trim()
            .toLowerCase();

        const devInfo = {
            name: "DevAfeez",
            whatsapp: "wa.me/2348029214393",
            youtube: "https://youtube.com/@DevAfeez",
            github: "https://github.com/Coded-bot-code",
            image: "https://files.catbox.moe/71ds56.jpg"
        };

        // 🧩 Handle subcommands
        if (command.startsWith(`${prefix}about`)) {
            const aboutMsg = `
╔══ ✦ *About TruvaGPT* ✦ ══╗
│
├◆ ⚡ *Name:* TruvaGPT
├◆ 🧠 *Type:* Advanced WhatsApp AI Bot
├◆ 💻 *Language:* Node.js (Baileys Library)
├◆ 🧩 *Features:* 100+ Commands
├◆ 🌐 *Creator:* DevAfeez
│
╚═══════════════════════════╝
💡 Type /dev to go back to menu.
`;
            return await sock.sendMessage(chatId, {
                image: { url: devInfo.image },
                caption: aboutMsg
            }, { quoted: message });
        }

        if (command.startsWith(`${prefix}source`)) {
            const sourceMsg = `
╔══ ✦ *Source Code* ✦ ══╗
│
├◆ 🧩 *GitHub:* ${devInfo.github}
├◆ 🧠 *Language:* JavaScript (Node.js)
├◆ 💡 *Libraries:* Baileys, Express, Axios
│
╚═══════════════════════════╝
📦 *Clone & Contribute!*  
💬 *Developed by DevAfeez*
`;
            return await sock.sendMessage(chatId, {
                image: { url: devInfo.image },
                caption: sourceMsg
            }, { quoted: message });
        }

        if (command.startsWith(`${prefix}contact`)) {
            const contactMsg = `
╔══ ✦ *Contact Developer* ✦ ══╗
│
├◆ 👑 *Name:* ${devInfo.name}
├◆ 💬 *WhatsApp:* ${devInfo.whatsapp}
├◆ 📺 *YouTube:* ${devInfo.youtube}
│
╚═══════════════════════════╝
❤️ *Support my work by subscribing!*
`;
            return await sock.sendMessage(chatId, {
                image: { url: devInfo.image },
                caption: contactMsg
            }, { quoted: message });
        }

        // 🧠 Main menu (/dev)
        const menuCaption = `
╔══ ✦ *TRUVAGPT DEVELOPER MENU* ✦ ══╗
│
├◆ 👋 Hello ${message.pushName || "there"}!
├◆ I'm *DevAfeez*, the creator of TruvaGPT.
│
├◆ 🧠 *Bot:* TruvaGPT  
├◆ ⚙️ *Version:* ${settings.version || '1.0.0'}  
├◆ 🌍 *Platform:* WhatsApp AI Assistant  
│
╚═══════════════════════════╝
💡 Select an option below ↓
`;

        await sock.sendMessage(chatId, {
            image: { url: devInfo.image },
            caption: menuCaption,
            footer: 'TruvaGPT — Powered by DevAfeez ⚡',
            buttons: [
                { buttonId: `${prefix}about`, buttonText: { displayText: '📘 About Bot' }, type: 1 },
                { buttonId: `${prefix}source`, buttonText: { displayText: '💻 Source Code' }, type: 1 },
                { buttonId: `${prefix}contact`, buttonText: { displayText: '📞 Contact Dev' }, type: 1 }
            ],
            headerType: 4,
            contextInfo: {
                mentionedJid: [message.key.remoteJid],
                externalAdReply: {
                    title: 'TruvaGPT 🤖',
                    body: 'Developed by DevAfeez',
                    thumbnailUrl: devInfo.image,
                    mediaType: 1,
                    sourceUrl: devInfo.youtube
                }
            }
        }, { quoted: message });

    } catch (err) {
        console.error('Dev Command Error:', err);
        await sock.sendMessage(chatId, { text: '❌ Failed to load Dev Info menu.' });
    }
}

module.exports = devCommand;