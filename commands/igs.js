const { igdl } = require('ruhend-scraper');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');
const settings = require('../settings');
const { stickercropFromBuffer } = require('./stickercrop');

async function convertBufferToStickerWebp(inputBuffer, isAnimated, cropSquare) {
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const tempInputBase = path.join(tmpDir, `truva_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    const tempInput = isAnimated ? `${tempInputBase}.mp4` : `${tempInputBase}.jpg`;
    const tempOutput = path.join(tmpDir, `truva_out_${Date.now()}_${Math.random().toString(36).slice(2)}.webp`);

    fs.writeFileSync(tempInput, inputBuffer);

    const filesToDelete = [];
    const scheduleDelete = (p) => {
        if (!p) return;
        filesToDelete.push(p);
        setTimeout(() => {
            try { fs.unlinkSync(p); } catch {}
        }, 5000);
    };

    const vfCropSquareImg = "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512";
    const vfPadSquareImg = "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000";

    let ffmpegCommand;
    if (isAnimated) {
        const isLargeVideo = inputBuffer.length > (5 * 1024 * 1024);
        const maxDuration = isLargeVideo ? 2 : 3;
        if (cropSquare) {
            ffmpegCommand = `ffmpeg -y -i "${tempInput}" -t ${maxDuration} -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 45 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput}"`;
        } else {
            ffmpegCommand = `ffmpeg -y -i "${tempInput}" -t ${maxDuration} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 45 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput}"`;
        }
    } else {
        const vf = `${cropSquare ? vfCropSquareImg : vfPadSquareImg},format=rgba`;
        ffmpegCommand = `ffmpeg -y -i "${tempInput}" -vf "${vf}" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;
    }

    await new Promise((resolve, reject) => {
        exec(ffmpegCommand, (error) => {
            if (error) return reject(error);
            resolve();
        });
    });

    let webpBuffer = fs.readFileSync(tempOutput);
    scheduleDelete(tempOutput);

    const img = new webp.Image();
    await img.load(webpBuffer);

    const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': settings.packname || 'TruvaGPT Stickers ✨',
        'emojis': ['📸']
    };
    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    img.exif = exif;

    const finalBuffer = await img.save(null);
    scheduleDelete(tempInput);
    return finalBuffer;
}

async function fetchBufferFromUrl(url) {
    try {
        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'TruvaGPT-Bot/1.0' },
            timeout: 30000
        });
        return Buffer.from(res.data);
    } catch (e) {
        console.error('Failed to fetch media:', e);
        throw e;
    }
}

async function igsCommand(sock, chatId, message, crop = false) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const urlMatch = text.match(/https?:\/\/\S+/);
        if (!urlMatch) {
            await sock.sendMessage(chatId, {
                text: "📸 *Instagram Sticker Downloader*\n\nUsage:\n`/igs <url>` — Normal sticker\n`/igsc <url>` — Cropped version ✂️\n\nExample:\n`/igs https://www.instagram.com/reel/...`\n\n— Powered by *TruvaGPT*"
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        const downloadData = await igdl(urlMatch[0]).catch(() => null);
        if (!downloadData || !downloadData.data) {
            await sock.sendMessage(chatId, { text: "⚠️ Failed to fetch media from Instagram link. Please check the URL and try again." }, { quoted: message });
            return;
        }

        const items = (downloadData.data || []).filter(m => m && m.url);
        if (items.length === 0) {
            await sock.sendMessage(chatId, { text: "❌ No downloadable media found at that link." }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, { text: "🚀 *Processing your media...*\nPlease wait while TruvaGPT prepares your sticker 🔧" }, { quoted: message });

        const seenHashes = new Set();
        for (let i = 0; i < Math.min(items.length, 5); i++) {
            try {
                const media = items[i];
                const buffer = await fetchBufferFromUrl(media.url);
                const hash = crypto.createHash('sha1').update(buffer).digest('hex');
                if (seenHashes.has(hash)) continue;
                seenHashes.add(hash);

                const stickerBuffer = crop
                    ? await stickercropFromBuffer(buffer, media.type === 'video')
                    : await convertBufferToStickerWebp(buffer, media.type === 'video', false);

                await sock.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: message });

                if (i < items.length - 1) await new Promise(r => setTimeout(r, 800));
            } catch (err) {
                console.error('Error processing item:', err);
            }
        }

        await sock.sendMessage(chatId, { text: "✅ Done! Your stickers are ready 😎\n\n— *TruvaGPT Bot 🤖*" }, { quoted: message });

    } catch (err) {
        console.error('IGS Error:', err);
        await sock.sendMessage(chatId, { text: "⚠️ Something went wrong while fetching the sticker.\nPlease try again later." }, { quoted: message });
    }
}

module.exports = { igsCommand };