const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function facebookCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const body = text.trim().toLowerCase();

        // Detect multiple triggers: /fb, /facebook, /fbdl
        const triggers = ['/fb', '/facebook', '/fbdl'];
        const usedTrigger = triggers.find(cmd => body.startsWith(cmd));

        if (!usedTrigger) return;

        const url = body.replace(usedTrigger, '').trim();

        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: "📽️ *Facebook Video Downloader*\n\nUsage:\n`/fb <facebook video link>`\n\nExample:\n`/fb https://www.facebook.com/...`"
            });
        }

        if (!url.includes('facebook.com')) {
            return await sock.sendMessage(chatId, { 
                text: "⚠️ That doesn’t look like a valid *Facebook* link."
            });
        }

        // Send loading emoji reaction
        await sock.sendMessage(chatId, {
            react: { text: '🔄', key: message.key }
        });

        // Fetch video from API
        const response = await axios.get(`https://api.dreaded.site/api/facebook?url=${url}`);
        const data = response.data;

        if (!data || data.status !== 200 || !data.facebook || !data.facebook.sdVideo) {
            return await sock.sendMessage(chatId, { 
                text: "😔 Sorry, the video couldn’t be fetched. Please try again later!"
            });
        }

        const fbvid = data.facebook.sdVideo;

        if (!fbvid) {
            return await sock.sendMessage(chatId, { 
                text: "🚫 The provided link didn’t return a valid video."
            });
        }

        // Create temporary directory
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const tempFile = path.join(tmpDir, `fb_${Date.now()}.mp4`);

        // Download video
        const videoResponse = await axios({
            method: 'GET',
            url: fbvid,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
                'Connection': 'keep-alive',
                'Referer': 'https://www.facebook.com/'
            }
        });

        const writer = fs.createWriteStream(tempFile);
        videoResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        if (!fs.existsSync(tempFile) || fs.statSync(tempFile).size === 0) {
            throw new Error('Failed to download video.');
        }

        // Send the video
        await sock.sendMessage(chatId, {
            video: { url: tempFile },
            mimetype: "video/mp4",
            caption: "🎬 *Facebook Video Downloader*
└─ _TruvaGPT processed this file_ 💫"
        }, { quoted: message });

        // Cleanup
        try {
            fs.unlinkSync(tempFile);
        } catch (err) {
            console.error('Error cleaning up temp file:', err);
        }

    } catch (error) {
        console.error('Error in Facebook command:', error);
        await sock.sendMessage(chatId, { 
            text: "❌ *Error:* The API might be down.\n> " + error.message
        });
    }
}

module.exports = facebookCommand;