/**
 * ═══════════════════════════════════════════════════════════════
 * QANTUM CABLE SYSTEM — Central Neural Bus
 * ═══════════════════════════════════════════════════════════════
 * 
 * Acting as the Absolute Determinism event bus.
 * All anomalies, state changes, and zero-entropy signals travel here.
 * 
 * Authority: DIMITAR PRODROMOV
 * ═══════════════════════════════════════════════════════════════
 */

const EventEmitter = require('events');
const telegram = require('./telegram');

class QAntumCable extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50);
        console.log(`\x1b[35m🔌 [CABLE] NEURAL BUS INITIALIZED. ZERO-ENTROPY ROUTING ACTIVE.\x1b[0m`);
        
        // Universal Anomaly Interception
        this.on('SYSTEM_ANOMALY', async (payload) => {
            console.error(`\x1b[31m⚠️ [CABLE ANOMALY] ${payload.message}\x1b[0m`);
            if (telegram && telegram.bot) {
                const text = `
🚨 <b>SYSTEM ANOMALY DETECTED</b>
━━━━━━━━━━━━━━━━━━━━━━━━
<b>Type:</b> ${payload.type}
<b>Message:</b> ${payload.message}
<b>Severity:</b> ${payload.severity}

<i>Triggering Watchdog Self-Healing Protocol...</i>
`;
                try {
                    await telegram.bot.sendMessage(telegram.chatId, text, { parse_mode: 'HTML' });
                } catch (e) { /* silent fail if telegram not connected */ }
            }
        });
        
        this.on('HEALING_REQUIRED', (payload) => {
            console.log(`\x1b[33m⚕️ [CABLE SELF-HEAL] Request routed for: ${payload.reason}\x1b[0m`);
        });
    }

    broadcast(event, payload) {
        this.emit(event, payload);
    }
}

const cable = new QAntumCable();
module.exports = cable;
