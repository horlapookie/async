const fs = require('fs');
const path = require('path');

async function githubCommand(sock, chatId, message) {
  try {
    const txt = `*⚠️ Code Access Restricted ⚠️*\n\n` +
                `This bot's source code is currently *private* and is not available for public access on GitHub.\n\n` +
                `Thank you for your interest!`;

    // Use the local asset image (assuming the path is correct relative to main.js)
    const imgPath = path.join(__dirname, '../assets/bot_image.jpg');
    
    let imgBuffer;
    try {
        imgBuffer = fs.readFileSync(imgPath);
    } catch (readError) {
        console.error("Error reading bot_image.jpg:", readError.message);
        // Fallback to sending just the text if the image is missing
        await sock.sendMessage(chatId, { text: txt }, { quoted: message });
        return;
    }

    await sock.sendMessage(chatId, { image: imgBuffer, caption: txt }, { quoted: message });
  } catch (error) {
    // This catches errors during message sending or if the fallback failed
    console.error("Error sending private repo message:", error.message);
    await sock.sendMessage(chatId, { text: '❌ Unable to fetch repository information or send private message.' }, { quoted: message });
  }
}

module.exports = githubCommand;