/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📱 TELEGRAM UPLINK: MOBILE COMMAND CENTER (PaaS Edition)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Streams real-time agentic execution telemetry straight to the Sovereign Architect.
 */

const TelegramBot = require('node-telegram-bot-api');

class TelegramUplink {
    constructor() {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chat = process.env.TELEGRAM_CHAT_ID;

        if (token && chat) {
            this.bot = new TelegramBot(token, { polling: false });
            this.chatId = chat;
            console.log(`\x1b[32m📱 [TELEGRAM] UPLINK ESTABLISHED => ${chat}\x1b[0m`);
        } else {
            this.bot = null;
            this.chatId = null;
            console.warn(`\x1b[33m⚠️ [TELEGRAM] MISSING TOKEN OR CHAT_ID. ALERTS DISABLED.\x1b[0m`);
        }
    }

    /**
     * Sends a real-time progress update for an executing persona.
     */
    async sendPersonaUpdate(personaName, progress, status, eta) {
        if (!this.bot || !this.chatId) return;

        const pBar = this.getProgressBar(progress);
        const text = `
🤖 <b>QANTUM PERSONA EXECUTING</b>
━━━━━━━━━━━━━━━━━━━━━━━━
<b>Agent:</b> ${personaName}
<b>Status:</b> ${status}

<b>[${pBar}]</b> ${progress}%
<i>ETA: ${eta}</i>
━━━━━━━━━━━━━━━━━━━━━━━━
<i>Live Pipeline Telemetry</i>
`;
        try {
            await this.bot.sendMessage(this.chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            console.error(`❌ [TELEGRAM ERROR]:`, e.message);
        }
    }

    /**
     * Sends the final completion alert with download link (if applicable).
     */
    async sendPersonaComplete(personaName) {
        if (!this.bot || !this.chatId) return;

        const text = `
✅ <b>QANTUM PERSONA COMPLETE</b>
━━━━━━━━━━━━━━━━━━━━━━━━
<b>Agent:</b> ${personaName}
<b>Status:</b> TASK CONCLUDED SUCCESSFULLY

The generated PDF Report is being streamed to the client for download.
━━━━━━━━━━━━━━━━━━━━━━━━
<i>Execution Time: Computed. ZERO ENTROPY.</i>
`;
        try {
            await this.bot.sendMessage(this.chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            console.error(`❌ [TELEGRAM ERROR]:`, e.message);
        }
    }

    /**
     * Helper to draw a text-based progress bar.
     */
    getProgressBar(percentage) {
        const totalBlocks = 10;
        const filledBlocks = Math.round((percentage / 100) * totalBlocks);
        const emptyBlocks = totalBlocks - filledBlocks;
        return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
    }
}

// Export a singleton instance
const uplink = new TelegramUplink();
module.exports = uplink;
