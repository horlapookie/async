// This module exports WhatsApp channel context information for newsletter forwarding
module.exports = {
  channelInfo: {
    contextInfo: {
      // Forwarding score (1000 = high priority/forwarded message)
      forwardingScore: 1000,
      
      // Indicates this message was not forwarded
      isForwarded: false,
      
      // Newsletter-specific forwarding information
      forwardedNewsletterMessageInfo: {
        // Complete newsletter JID (WhatsApp identifier)
        newsletterJid: "120363401657714060@newsletter",
        
        // Display name for the newsletter
        newsletterName: "TruvaGPT",
        
        // Server-assigned message ID (-1 indicates test value)
        serverMessageId: -1
      }
    }
  }
};
