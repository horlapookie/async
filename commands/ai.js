const axios = require('axios');
const fetch = require('node-fetch');

async function aiCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: "Please provide a question after /truvagpt or /gemini\n\nExample: /truvagpt write a basic html code"
            });
        }

        const parts = text.split(' ');
        const command = parts[0].toLowerCase();
        const query = parts.slice(1).join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, { 
                text: "Please provide a question after /truvagpt or /gemini"
            });
        }

        // 🧠 Auto-replies for identity or creator questions
        const lowerQuery = query.toLowerCase();
        const devKeywords = ["who created you", "who made you", "who's your dev", "who is your dev", "your developer", "your owner"];
        const nameKeywords = ["what's your name", "who are you", "your name", "what ai are you", "which ai is this"];

        if (devKeywords.some(word => lowerQuery.includes(word))) {
            return await sock.sendMessage(chatId, { text: "👨‍💻 My developer is *DevAfeez*." });
        }

        if (nameKeywords.some(word => lowerQuery.includes(word))) {
            return await sock.sendMessage(chatId, { text: "🤖 I’m *TruvaGPT*, your intelligent assistant." });
        }

        // React with 🤖 while processing
        await sock.sendMessage(chatId, {
            react: { text: '🤖', key: message.key }
        });

        // 🧩 Handle TruvaGPT command
        if (command === '/truvagpt') {
            const response = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.success && response.data.result) {
                const answer = response.data.result.prompt;
                await sock.sendMessage(chatId, { text: answer }, { quoted: message });
            } else {
                throw new Error('Invalid response from API');
            }

        // 🧩 Handle Gemini command
        } else if (command === '/gemini') {
            const apis = [
                `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
                `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`,
                `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(query)}`,
                `https://api.dreaded.site/api/gemini2?text=${encodeURIComponent(query)}`,
                `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`,
                `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(query)}`
            ];

            for (const api of apis) {
                try {
                    const response = await fetch(api);
                    const data = await response.json();

                    if (data.message || data.data || data.answer || data.result) {
                        const answer = data.message || data.data || data.answer || data.result;
                        await sock.sendMessage(chatId, { text: answer }, { quoted: message });
                        return;
                    }
                } catch {
                    continue;
                }
            }
            throw new Error('All Gemini APIs failed');
        }

    } catch (error) {
        console.error('AI Command Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
            contextInfo: {
                mentionedJid: [message.key.participant || message.key.remoteJid],
                quotedMessage: message.message
            }
        });
    }
}

module.exports = aiCommand;