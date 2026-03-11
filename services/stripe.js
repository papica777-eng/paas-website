/**
 * ═══════════════════════════════════════════════════════════════
 * STRIPE SERVICE — Payment Integration
 * ═══════════════════════════════════════════════════════════════
 * 
 * Hybridized from:
 *   - MONEY-DASHBOARD/server.js (Express + Checkout Sessions)
 *   - src/routes/billing.ts (12 Stripe plans × 4 products)
 *   - src/routes/webhooks.ts (5 webhook event handlers)
 * 
 * Complexity: O(1) per operation
 * Currency: EUR (fixed-point, cents)
 * 
 * Authority: DIMITAR PRODROMOV
 * ═══════════════════════════════════════════════════════════════
 */

let stripe = null;

// Complexity: O(1)
function initStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        console.warn('[Stripe] DATA_GAP: STRIPE_SECRET_KEY not set. Payments disabled.');
        return null;
    }
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    return stripe;
}

// ═══════════════════════════════════════════════════════════════
// PaaS PRICING — 4 Tiers + Free (Phantom Demo)
// Currency: EUR (cents). Zero-float: all integers.
// ═══════════════════════════════════════════════════════════════
const PAAS_PLANS = {
    free: {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'eur',
        interval: null,
        nodes: 0,
        rateLimit: '0 req/sec',
        isPhantomDemo: true,
        features: [
            'Custom Persona Builder (visual UI)',
            'Full archetype configuration',
            'Demo execution results',
            'Community access',
        ],
        stripePriceId: null,
    },
    starter: {
        id: 'starter',
        name: 'Starter',
        price: 4900, // €49.00 in cents
        currency: 'eur',
        interval: 'month',
        nodes: 1000,
        rateLimit: '2 req/sec',
        isPhantomDemo: false,
        features: [
            'Up to 1,000 persona nodes',
            '2 req/sec rate limit',
            'Selenium + Playwright adapters',
            'Anti-Hallucination (Veritas)',
            'Email support',
            'Community access',
        ],
        stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || null,
    },
    professional: {
        id: 'professional',
        name: 'Professional',
        price: 29900, // €299.00 in cents
        currency: 'eur',
        interval: 'month',
        nodes: 50000,
        rateLimit: '10 req/sec',
        isPhantomDemo: false,
        features: [
            'Up to 50,000 persona nodes',
            '10 req/sec rate limit',
            'Full framework adapters',
            'Time Travel Scanner',
            'Priority support (24h SLA)',
            'Custom persona archetypes',
            'API key management',
        ],
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID || null,
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 249900, // €2,499.00 in cents
        currency: 'eur',
        interval: 'month',
        nodes: 500000,
        rateLimit: '50 req/sec',
        isPhantomDemo: false,
        features: [
            'Up to 500,000 persona nodes',
            '50 req/sec rate limit',
            'Dedicated Hydra cluster',
            'SovereignSafetyLayer full suite',
            'Dedicated support engineer',
            'Custom SLA (99.99%)',
            'SOC 2 compliance reports',
            'On-premise deployment option',
        ],
        stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || null,
    },
    singularity: {
        id: 'singularity',
        name: 'Singularity',
        price: 999900, // €9,999.00 in cents
        currency: 'eur',
        interval: 'month',
        nodes: -1, // Unlimited
        rateLimit: 'Unlimited',
        isPhantomDemo: false,
        features: [
            'Unlimited persona nodes',
            'Unlimited rate (no throttle)',
            'Private Hydra supercluster',
            'Full source code access',
            'White-label deployment',
            'Architect direct line',
            'Custom Veritas rules',
            'Perpetual license option',
        ],
        stripePriceId: process.env.STRIPE_SINGULARITY_PRICE_ID || null,
    }
};

/**
 * Create Stripe Checkout Session for a plan
 * Complexity: O(1) — single Stripe API call
 * 
 * @param {string} planId - Plan key from PAAS_PLANS
 * @param {string} customerEmail - Customer email
 * @param {string} origin - Request origin for success/cancel URLs
 * @returns {Object} { url, sessionId }
 */
async function createCheckoutSession(planId, customerEmail, origin) {
    if (!stripe) throw new Error('DATA_GAP: Stripe not initialized');
    
    const plan = PAAS_PLANS[planId];
    if (!plan) throw new Error(`Invalid plan: ${planId}`);
    if (plan.price === 0) throw new Error('Free tier does not require payment');

    const sessionConfig = {
        payment_method_types: ['card'],
        customer_email: customerEmail,
        mode: 'subscription',
        line_items: [{
            price_data: {
                currency: plan.currency,
                product_data: {
                    name: `QAntum PaaS — ${plan.name}`,
                    description: `${plan.nodes === -1 ? 'Unlimited' : plan.nodes.toLocaleString()} persona nodes/month`,
                },
                unit_amount: plan.price,
                recurring: { interval: plan.interval }
            },
            quantity: 1,
        }],
        success_url: `${origin || 'https://paas.website'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin || 'https://paas.website'}/#pricing`,
        metadata: {
            plan: planId,
            nodes: String(plan.nodes),
            product: 'QANTUM_PAAS'
        }
    };

    // Use existing Stripe Price ID if configured
    if (plan.stripePriceId) {
        sessionConfig.line_items = [{
            price: plan.stripePriceId,
            quantity: 1,
        }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    return { url: session.url, sessionId: session.id };
}

/**
 * Handle Stripe webhook event
 * Complexity: O(1) per event
 * 
 * @param {Buffer} rawBody - Raw request body
 * @param {string} signature - Stripe-Signature header
 * @returns {Object} Processed event data
 */
function constructWebhookEvent(rawBody, signature) {
    if (!stripe) throw new Error('DATA_GAP: Stripe not initialized');
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('DATA_GAP: STRIPE_WEBHOOK_SECRET not set');
    
    return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

/**
 * Get all plans for public display
 * Complexity: O(1)
 */
function getPlans() {
    return Object.values(PAAS_PLANS).map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price === 0 ? 'Free' : `€${(plan.price / 100).toLocaleString()}/mo`,
        priceRaw: plan.price,
        currency: plan.currency,
        nodes: plan.nodes === -1 ? 'Unlimited' : plan.nodes.toLocaleString(),
        rateLimit: plan.rateLimit,
        features: plan.features,
        isPhantomDemo: plan.isPhantomDemo,
    }));
}

module.exports = { 
    initStripe, 
    createCheckoutSession, 
    constructWebhookEvent, 
    getPlans, 
    PAAS_PLANS 
};
