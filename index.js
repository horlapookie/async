// index.js (fixed & ready for deployment)
// Keep this file at project root next to ./main.js and ./session folder

require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, sleep, reSize } = require('./lib/myfunc')

const { 
    default: makeWASocket,
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")

const NodeCache = require("node-cache")
const pino = require("pino")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")
const { PHONENUMBER_MCC } = require('@whiskeysockets/baileys/lib/Utils/generics')
const { rmSync, existsSync } = require('fs')
const { join } = require('path')

// =======================
// Simple in-memory store
// =======================
const store = {
    messages: {},
    contacts: {},
    chats: {},
    groupMetadata: async (jid) => { return {} },
    bind: function(ev) {
        ev.on('messages.upsert', ({ messages }) => {
            messages.forEach(msg => {
                if (msg.key && msg.key.remoteJid) {
                    this.messages[msg.key.remoteJid] = this.messages[msg.key.remoteJid] || {}
                    this.messages[msg.key.remoteJid][msg.key.id] = msg
                }
            })
        })

        ev.on('contacts.update', (contacts) => {
            contacts.forEach(contact => {
                if (contact.id) this.contacts[contact.id] = contact
            })
        })

        ev.on('chats.set', (chats) => {
            this.chats = chats
        })
    },
    loadMessage: async (jid, id) => {
        return this.messages[jid]?.[id] || null
    }
}

// =======================
// Globals & settings
// =======================
let phoneNumber = "2348029214393"
let owner = existsSync('./data/owner.json') ? JSON.parse(fs.readFileSync('./data/owner.json')) : phoneNumber
global.botname = "TruvaGPT"
global.themeemoji = "•"

const settings = require('./settings')
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => {
    if (rl) return new Promise((resolve) => rl.question(text, resolve))
    return Promise.resolve(settings.ownerNumber || phoneNumber)
}

async function starttruvagpt() {
    let { version, isLatest } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache()

    const truvagpt = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode,
        browser: ["TruvaGPT", "AI Web", "1.0.0"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            let jid = jidNormalizedUser(key.remoteJid)
            let msg = await store.loadMessage(jid, key.id)
            return msg?.message || ""
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
    })

    store.bind(truvagpt.ev)

    // ========== messages.upsert (main) ==========
    truvagpt.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0]
            if (!mek || !mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message

            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                await handleStatus(truvagpt, chatUpdate)
                return
            }

            await handleMessages(truvagpt, mek, store)

        } catch (err) {
            console.error('Error in messages.upsert:', err)
            if (chatUpdate.messages[0]?.key?.remoteJid) {
                try {
                    await truvagpt.sendMessage(chatUpdate.messages[0].key.remoteJid, {
                        text: '❌ An error occurred while processing your message.',
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: false,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401657714060@newsletter',
                                newsletterName: 'TruvaGPT',
                                serverMessageId: -1
                            }
                        }
                    })
                } catch(e) {
                    console.error('Failed to send error message:', e)
                }
            }
        }
    })

    // ========== helper methods ==========
    truvagpt.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return (decode.user && decode.server) ? (decode.user + '@' + decode.server) : jid
        } else return jid
    }

    truvagpt.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = truvagpt.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    truvagpt.getName = (jid, withoutContact = false) => {
        let id = truvagpt.decodeJid(jid)
        withoutContact = truvagpt.withoutContact || withoutContact
        let v
        
        if (id.endsWith("@g.us")) {
            return new Promise(async (resolve) => {
                try {
                    v = store.contacts[id] || {}
                    if (!(v.name || v.subject)) {
                        try { 
                            v = await truvagpt.groupMetadata(id) || {} 
                        } catch { 
                            v = {} 
                        }
                    }
                    
                    // Handle phone number formatting properly
                    const phoneNumberPart = id.replace('@s.whatsapp.net', '').replace('@g.us', '')
                    if (phoneNumberPart && !isNaN(phoneNumberPart)) {
                        try {
                            const pn = new PhoneNumber(phoneNumberPart, '')
                            resolve(v.name || v.subject || pn.getNumber('international'))
                        } catch {
                            resolve(v.name || v.subject || phoneNumberPart)
                        }
                    } else {
                        resolve(v.name || v.subject || 'Group')
                    }
                } catch (err) { 
                    console.error('Error in getName for group:', err)
                    resolve(id)
                }
            })
        } else {
            v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' } : 
                id === truvagpt.decodeJid(truvagpt.user?.id) ? truvagpt.user : 
                (store.contacts[id] || {})
            
            // Safer phone number handling
            const phoneNumberPart = jid.replace('@s.whatsapp.net', '')
            if (phoneNumberPart && !isNaN(phoneNumberPart)) {
                try {
                    const pn = new PhoneNumber(phoneNumberPart, '')
                    return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || pn.getNumber('international')
                } catch {
                    return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || phoneNumberPart
                }
            }
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || id
        }
    }

    truvagpt.public = true
    truvagpt.serializeM = (m) => smsg(truvagpt, m, store)

    // Pairing code - FIXED VERSION
    if (pairingCode && !truvagpt.authState?.creds?.registered) {
        if (useMobile) throw new Error('Cannot use pairing code with mobile api')

        let phoneNumberInput = global.phoneNumber || await question(
            chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 🤖\nFormat: 62xxxxxxxxxxx (without + or spaces) : `))
        )
        phoneNumberInput = phoneNumberInput.replace(/[^0-9]/g, '');
        
        // Safer phone number validation
        try {
            const pn = new PhoneNumber(phoneNumberInput, '')
            if (!pn.isValid()) {
                console.log(chalk.red('Invalid phone number.'))
                process.exit(1)
            }
        } catch (error) {
            console.log(chalk.red('Error validating phone number:', error.message))
            process.exit(1)
        }

        try {
            const pairingCodeResult = await truvagpt.requestPairingCode(phoneNumberInput)
            console.log(chalk.black(chalk.bgGreen(`Your WhatsApp Pairing Code:`)), chalk.white(pairingCodeResult))
        } catch (error) {
            console.error('❌ Failed to request pairing code:', error)
            process.exit(1)
        }
    }

    // connection.update
    truvagpt.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s

        async function createFakeMetaQuote(jid = "0@s.whatsapp.net") {
            try {
                let thumb
                try { const pfp = await truvagpt.profilePictureUrl(jid, "image"); const { data } = await axios.get(pfp, { responseType: "arraybuffer" }); thumb = Buffer.from(data, "binary") } catch { thumb = null }
                return {
                    key: { fromMe: false, remoteJid: "status@broadcast", participant: "0@s.whatsapp.net" },
                    message: { contactMessage: { displayName: "TruvaGPT Bot", vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:WhatsApp Meta\nORG:WhatsApp LLC;\nTEL;type=CELL:+1-000-000-0000\nEND:VCARD", jpegThumbnail: thumb } }
                }
            } catch (e) { console.error("Fake Meta Quote Error:", e); return null }
        }

        if (connection == "open") {
            console.log(chalk.yellow(`🌿 Connected to => ` + JSON.stringify(truvagpt.user, null, 2)))

            try {
                const botNumber = truvagpt.user.id.split(':')[0] + '@s.whatsapp.net'
                const fakeMeta = await createFakeMetaQuote(botNumber)
                await truvagpt.sendMessage(botNumber, { text: `🤖 TruvaGPT is now online!\n🕒 Current Time: ${new Date().toLocaleString()}\n✅ System Status: Active & Ready.\n🔗 Join our official channel for updates!`, contextInfo: { forwardingScore: 1, isForwarded: false, forwardedNewsletterMessageInfo: { newsletterJid: '120363401657714060@newsletter', newsletterName: 'TruvaGPT', serverMessageId: -1 } } }, { quoted: fakeMeta })
            } catch (e) { console.error('Failed to send startup notification:', e?.message || e) }

            await delay(1999)
            console.log(chalk.cyan(`< ================================================== >`))
            console.log(chalk.magenta(`\n${global.themeemoji || '•'} YT CHANNEL: DevAfeez`))
            console.log(chalk.magenta(`${global.themeemoji || '•'} GITHUB: Coded-bot-code`))
            console.log(chalk.magenta(`${global.themeemoji || '•'} WA NUMBER: ${owner}`))
            console.log(chalk.green(`${global.themeemoji || '•'} 🤖 TruvaGPT Connected Successfully! ✅`))
        }

        if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output?.statusCode != 401) {
            starttruvagpt()
        }
    })

    truvagpt.ev.on('creds.update', saveCreds)

    truvagpt.ev.on('group-participants.update', async (update) => {
        try { await handleGroupParticipantUpdate(truvagpt, update) } catch (e) { console.error('Error in group-participants.update handler:', e) }
    })

    truvagpt.ev.on('messages.upsert', async (m) => {
        if (m.messages[0].key && m.messages[0].key.remoteJid === 'status@broadcast') {
            try { await handleStatus(truvagpt, m) } catch (e) { console.error('handleStatus error:', e) }
        }
    })

    truvagpt.ev.on('status.update', async (status) => {
        try { await handleStatus(truvagpt, status) } catch (e) { console.error('handleStatus error:', e) }
    })

    truvagpt.ev.on('messages.reaction', async (status) => {
        try { await handleStatus(truvagpt, status) } catch (e) { console.error('handleStatus error:', e) }
    })

    return truvagpt
}

// Start bot
starttruvagpt().catch(error => { console.error('Fatal error:', error); process.exit(1) })
process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err) })
process.on('unhandledRejection', (err) => { console.error('Unhandled Rejection:', err) })

// Hot reload
let file = require.resolve(__filename)
fs.watchFile(file, () => { fs.unwatchFile(file); console.log(chalk.redBright(`Update ${__filename}`)); delete require.cache[file]; require(file) })