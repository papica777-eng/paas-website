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
const { generatePhantomDemo, isFreeTier } = require('../services/phantom-demo');
const { createCheckoutSession, constructWebhookEvent, getPlans } = require('../services/stripe');
const { getMetrics, createPayment, createRegistration, createAuditEntry } = require('../services/firestore');

const startTime = Date.now();

// ═══════════════════════════════════════════════════════════════
// GET /api/health — Service health check
// Complexity: O(1)
// ═══════════════════════════════════════════════════════════════
router.get('/health', (req, res) => {
    res.json({
        status: 'OPERATIONAL',
        engine: 'QANTUM_PAAS_V1',
        entropy: 0.00,
        uptime: Math.round((Date.now() - startTime) / 1000),
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
// Complexity: O(1)
// 
// This is the KEY conversion mechanic:
// - Free users get the same pre-baked demo result every time
// - Paid users get real persona execution (future implementation)
// ═══════════════════════════════════════════════════════════════
router.post('/persona/run', (req, res) => {
    const { archetype, personaName, config, plan } = req.body || {};
    
    if (isFreeTier(plan)) {
        // PHANTOM DEMO: Always return the same result
        const result = generatePhantomDemo({ archetype, personaName });
        
        // Simulated delay for realism (1-3 seconds)
        const delay = 1000 + Math.floor(Math.random() * 2000);
        setTimeout(() => {
            res.json({
                tier: 'FREE_DEMO',
                result,
            });
        }, delay);
        return;
    }
    
    // Paid tier — placeholder for real execution
    res.json({
        tier: plan,
        status: 'EXECUTING',
        message: 'Real persona execution initiated. Results streaming...',
        estimatedDuration: '~15s',
    });
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

module.exports = router;
