// 🔧 TruvaGPT Auto-Update System
// Description: Handles both Git- and ZIP-based updates for the TruvaGPT WhatsApp Bot

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const settings = require('../settings');

/**
 * Run a terminal command safely
 */
function run(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
            if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
            resolve((stdout || '').toString());
        });
    });
}

/**
 * Check if the project is a Git repository
 */
async function hasGitRepo() {
    const gitDir = path.join(process.cwd(), '.git');
    if (!fs.existsSync(gitDir)) return false;
    try {
        await run('git --version');
        return true;
    } catch {
        return false;
    }
}

/**
 * Update project via Git pull
 */
async function updateViaGit() {
    const oldRev = (await run('git rev-parse HEAD').catch(() => 'unknown')).trim();
    await run('git fetch --all --prune');
    const newRev = (await run('git rev-parse origin/main')).trim();
    const alreadyUpToDate = oldRev === newRev;

    if (!alreadyUpToDate) {
        await run(`git reset --hard ${newRev}`);
        await run('git clean -fd');
    }

    return { oldRev, newRev, alreadyUpToDate };
}

/**
 * Download file (handles redirects)
 */
function downloadFile(url, dest, visited = new Set()) {
    return new Promise((resolve, reject) => {
        if (visited.has(url) || visited.size > 5) return reject(new Error('Too many redirects'));
        visited.add(url);

        const client = url.startsWith('https://') ? require('https') : require('http');
        const req = client.get(url, {
            headers: { 'User-Agent': 'TruvaGPT-Updater/1.0', 'Accept': '*/*' }
        }, res => {
            if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                const nextUrl = new URL(res.headers.location, url).toString();
                res.resume();
                return downloadFile(nextUrl, dest, visited).then(resolve).catch(reject);
            }

            if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));

            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
            file.on('error', err => {
                try { file.close(); } catch {}
                fs.unlink(dest, () => reject(err));
            });
        });

        req.on('error', err => fs.unlink(dest, () => reject(err)));
    });
}

/**
 * Extract ZIP file using system tools
 */
async function extractZip(zipPath, outDir) {
    if (process.platform === 'win32') {
        await run(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\/g, '/')}' -Force"`);
        return;
    }
    for (const cmd of ['unzip', '7z', 'busybox unzip']) {
        try {
            await run(`command -v ${cmd.split(' ')[0]}`);
            await run(`${cmd} -o '${zipPath}' -d '${outDir}'`);
            return;
        } catch {}
    }
    throw new Error("No unzip tool found. Git mode is recommended for TruvaGPT updates.");
}

/**
 * Copy files recursively (ignore runtime dirs)
 */
function copyRecursive(src, dest, ignore = [], relative = '', outList = []) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
        if (ignore.includes(entry)) continue;
        const s = path.join(src, entry);
        const d = path.join(dest, entry);
        const stat = fs.lstatSync(s);
        if (stat.isDirectory()) copyRecursive(s, d, ignore, path.join(relative, entry), outList);
        else {
            fs.copyFileSync(s, d);
            outList.push(path.join(relative, entry).replace(/\\/g, '/'));
        }
    }
}

/**
 * Update project via ZIP package
 */
async function updateViaZip(bot, jid, msg, zipOverride) {
    const zipUrl = (zipOverride || settings.updateZipUrl || process.env.UPDATE_ZIP_URL || '').trim();
    if (!zipUrl) throw new Error('No ZIP URL configured for TruvaGPT.');

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const zipPath = path.join(tmpDir, 'update.zip');
    await downloadFile(zipUrl, zipPath);

    const extractTo = path.join(tmpDir, 'update_extract');
    if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
    await extractZip(zipPath, extractTo);

    const entries = fs.readdirSync(extractTo).filter(f => !f.startsWith('.'));
    const root = entries.length ? path.join(extractTo, entries[0]) : extractTo;
    const srcRoot = fs.existsSync(root) && fs.lstatSync(root).isDirectory() ? root : extractTo;

    const ignore = ['node_modules', '.git', 'session', 'tmp', 'temp', 'data', 'baileys_store.json'];
    copyRecursive(srcRoot, process.cwd(), ignore, '', []);

    // Preserve important config
    try {
        const currentSettings = require('../settings');
        const settingsPath = path.join(process.cwd(), 'settings.js');
        if (fs.existsSync(settingsPath)) {
            let text = fs.readFileSync(settingsPath, 'utf8');
            text = text.replace(/ownerNumber:\s*'[^']*'/, `ownerNumber: '${currentSettings.ownerNumber}'`);
            fs.writeFileSync(settingsPath, text);
        }
    } catch {}

    fs.rmSync(extractTo, { recursive: true, force: true });
    fs.rmSync(zipPath, { force: true });
}

/**
 * Restart the bot process
 */
async function restartProcess(bot, jid, msg) {
    try {
        await bot.sendMessage(jid, { text: '✅ Update complete! Restarting TruvaGPT…' }, { quoted: msg });
    } catch {}

    try {
        await run('pm2 restart all');
    } catch {
        console.log("Restarting... If it doesn't auto-restart, run: node index.js");
        setTimeout(() => process.exit(0), 500);
    }
}

/**
 * Main update command handler
 */
async function updateCommand(bot, jid, msg, isOwner, zipOverride) {
    if (!msg.key.fromMe && !isOwner) {
        return bot.sendMessage(jid, { text: 'Only the bot owner can use /update' }, { quoted: msg });
    }

    await bot.sendMessage(jid, { text: '🔄 Updating TruvaGPT... Please wait.' }, { quoted: msg });

    try {
        if (await hasGitRepo()) {
            const { alreadyUpToDate, newRev } = await updateViaGit();
            const status = alreadyUpToDate ? `✅ Already up to date (${newRev})` : `✅ Updated successfully to ${newRev}`;
            await run('npm install --no-audit --no-fund');
            await bot.sendMessage(jid, { text: `${status}\nRestarting...` }, { quoted: msg });
        } else {
            await updateViaZip(bot, jid, msg, zipOverride);
            await bot.sendMessage(jid, { text: '✅ ZIP update completed. Restarting TruvaGPT...' }, { quoted: msg });
        }

        await restartProcess(bot, jid, msg);
    } catch (err) {
        console.error('Update failed:', err);
        await bot.sendMessage(jid, { text: `❌ Update failed:\n${String(err.message || err)}` }, { quoted: msg });
    }
}

module.exports = updateCommand;