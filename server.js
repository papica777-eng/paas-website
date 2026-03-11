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
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
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

const stripeReady = initStripe();
const firestoreReady = initFirestore();

// Export for Vercel serverless
module.exports = app;

// Local / Render: start HTTP server
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ⬡  Q A N T U M   P a a S   S E R V E R                    ║
║                                                               ║
║   🌐  http://localhost:${String(PORT).padEnd(5)}                              ║
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
