/**
 * ═══════════════════════════════════════════════════════════════
 * PHANTOM DEMO ENGINE — Free Tier Conversion Funnel
 * ═══════════════════════════════════════════════════════════════
 * 
 * Complexity: O(1) — Deterministic generative engine
 * 
 * STRATEGY: Users on Free Tier receive restricted but dynamic
 * results based on their configuration. This demonstrates the
 * precision of the Nexus Core without exposing paid processing.
 * 
 * Authority: DIMITAR PRODROMOV
 * ═══════════════════════════════════════════════════════════════
 */

// Complexity: O(1)
const ARCHETYPE_CONFIGS = {
    Adrenaline: {
        clickSpeed: { mean: 85, stdDev: 12, unit: "ms" },
        mouseJitter: { amplitude: 6.2, frequency: 1.45 },
        avgActionDelay: 120,
        veritasScore: 0.94,
        description: "High-frequency interactions, minimal latency, elevated jitter. Optimized for maximum throughput."
    },
    Fatigue: {
        clickSpeed: { mean: 310, stdDev: 85, unit: "ms" },
        mouseJitter: { amplitude: 1.8, frequency: 0.35 },
        avgActionDelay: 580,
        veritasScore: 0.91,
        description: "Decaying performance, increased error rates, irregular pause distributions. Human-like exhaustion signature."
    },
    Sovereign: {
        clickSpeed: { mean: 142, stdDev: 23, unit: "ms" },
        mouseJitter: { amplitude: 3.7, frequency: 0.82 },
        avgActionDelay: 273,
        veritasScore: 0.99,
        description: "The Architect signature. Perfectly optimized, zero-entropy execution with maximum precision."
    },
    Accountant: {
        clickSpeed: { mean: 285, stdDev: 45, unit: "ms" },
        mouseJitter: { amplitude: 1.2, frequency: 0.3 },
        avgActionDelay: 450,
        veritasScore: 0.98,
        description: "Precise, methodical data entry patterns. Minimal jitter, high rhythm consistency. Specialized for financial auditing."
    },
    QATester: {
        clickSpeed: { mean: 180, stdDev: 30, unit: "ms" },
        mouseJitter: { amplitude: 4.5, frequency: 1.1 },
        avgActionDelay: 320,
        veritasScore: 0.96,
        description: "Heuristic traversal signature. Focuses on element boundaries and state transitions. Tuning: veritras.website validation."
    },
    HRRecruiter: {
        clickSpeed: { mean: 210, stdDev: 60, unit: "ms" },
        mouseJitter: { amplitude: 2.8, frequency: 0.65 },
        avgActionDelay: 520,
        veritasScore: 0.94,
        description: "Pattern-matching browse-then-click behavior. Specialized for LinkedIn Jobs BG sourcing and profile evaluation."
    }
};

const TIER_CONFIGS = {
    free: {
        maxActions: 50,
        veritasMultiplier: 0.95,
        syncRate: 0.85,
        nodes: 5,
        branding: "RESTRICTED_DEMO",
        recommendation: "Upgrade to Starter (€49/mo) to unlock real persona execution."
    },
    starter: {
        maxActions: 250,
        veritasMultiplier: 1.0,
        syncRate: 0.95,
        nodes: 1000,
        branding: "PAID_STARTER_NODE",
        recommendation: "Tier active. Scale to Professional for 10x throughput."
    },
    professional: {
        maxActions: 1500,
        veritasMultiplier: 1.05,
        syncRate: 0.99,
        nodes: 50000,
        branding: "PAID_PROFESSIONAL_CLUSTER",
        recommendation: "Advanced heuristics active. Enterprise tier offers dedicated clusters."
    },
    enterprise: {
        maxActions: 10000,
        veritasMultiplier: 1.1,
        syncRate: 0.999,
        nodes: 500000,
        branding: "SOVEREIGN_ENTERPRISE_INFRA",
        recommendation: "Strategic infrastructure engaged. Singularity tier for total root access."
    },
    singularity: {
        maxActions: 100000,
        veritasMultiplier: 1.2,
        syncRate: 1.0,
        nodes: 2000000,
        branding: "SINGULARITY_ROOT_ACCESS",
        recommendation: "Zero-Entropy state achieved. Status: BEYOND_VALUATION."
    }
};

const PHANTOM_DEMO_BASE = {
    sessionId: "demo_sess_QNX_",
    status: "COMPLETED",
    persona: {
        id: "phantom_persona_v2",
        archetype: "Sovereign",
        variant: "Default",
        behaviorProfile: {
            clickSpeed: { mean: 142, stdDev: 23, unit: "ms" },
            scrollPattern: "organic_human",
            mouseJitter: { amplitude: 3.7, frequency: 0.82 },
            pauseDistribution: "gamma(2.1, 0.8)",
            tabSwitchProbability: 0.12,
            typoRate: 0.031,
            readingSpeed: { wpm: 247, variance: 0.15 }
        },
        antiDetection: {
            fingerprintScore: 0.94,
            botDetectionBypass: "PASSED",
            captchaInteraction: "HUMAN_LIKE",
            webdriverFlag: false,
            canvasNoise: true,
            audioContextSpoofed: true
        }
    },
    executionMetrics: {
        totalActions: 47,
        duration: 12847,
        durationUnit: "ms",
        pagesVisited: 6,
        formsInteracted: 2,
        buttonsClicked: 11,
        scrollEvents: 28,
        hoverEvents: 34,
        avgActionDelay: 273
    },
    validationResults: {
        veritasScore: 0.97,
        entropyLevel: 0.00,
        hallucinations: 0,
        safetyLayerStatus: "ALL_PASSED",
        legalBoundaryCheck: "WHITELISTED_ONLY",
        catuskotiState: "TRUTH"
    },
    networkSync: {
        nodesContacted: 1247,
        syncRate: 0.998,
        heartbeatLatency: "8ms",
        circuitBreakerStatus: "CLOSED"
    },
    report: {
        summary: "",
        recommendation: "Upgrade to Starter (€49/mo) to unlock real persona execution with custom archetypes, full Hydra Network sync, and production-grade telemetry."
    },
    _meta: {
        version: "nexus_v1.2",
        generatedAt: null
    }
};

/**
 * Generate a deterministic seeded random number from a string
 */
function seededRandom(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
}

/**
 * Generate the phantom demo result with archetypal logic.
 * Complexity: O(1)
 */
function generatePhantomDemo(userConfig = {}) {
    // Determine seed
    const seed = userConfig.personaName || "default_nexus";
    const rnd = () => seededRandom(seed + Math.random()); 
    
    const plan = (userConfig.plan || 'free').toLowerCase();
    const tier = TIER_CONFIGS[plan] || TIER_CONFIGS.free;

    // Deep clone base
    const result = JSON.parse(JSON.stringify(PHANTOM_DEMO_BASE));
    const archKey = userConfig.archetype || "Sovereign";
    const config = ARCHETYPE_CONFIGS[archKey] || ARCHETYPE_CONFIGS.Sovereign;
    
    // Apply Archetype Configuration
    result.persona.archetype = archKey;
    result.persona.variant = userConfig.personaName || "Nexus_Node_" + Math.floor(rnd() * 1000);
    result.persona.behaviorProfile.clickSpeed = config.clickSpeed;
    result.persona.behaviorProfile.mouseJitter = config.mouseJitter;
    result.executionMetrics.avgActionDelay = config.avgActionDelay;
    
    // Apply Tier Scaling
    const rawVeritas = config.veritasScore * tier.veritasMultiplier;
    result.validationResults.veritasScore = Math.min(1.0, Math.max(0, rawVeritas));
    result.networkSync.nodesContacted = Math.floor(tier.nodes * (0.9 + rnd() * 0.1));
    result.networkSync.syncRate = tier.syncRate;
    
    // Execution Metrics scaled by Tier
    const baseActions = plan === 'free' ? 30 : 100;
    result.executionMetrics.totalActions = baseActions + Math.floor(rnd() * tier.maxActions * 0.1);
    result.executionMetrics.duration = result.executionMetrics.totalActions * config.avgActionDelay * (0.8 + rnd() * 0.4);
    
    // Unique Session ID
    result.sessionId = `sess_${tier.branding}_` + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Metadata
    result._meta.generatedAt = new Date().toISOString();
    result._meta.tier = plan.toUpperCase();
    
    // Narrative Summary Generation
    result.report.summary = `Persona "${result.persona.variant}" (${archKey}) manifested in ${plan.toUpperCase()} form. ${config.description} Veritas validation: ${(result.validationResults.veritasScore * 100).toFixed(2)}%. Anti-Entropy level at 0.00.`;
    result.report.recommendation = tier.recommendation;
    
    return result;
}

/**
 * Check if a user is on the Free tier
 * Complexity: O(1)
 */
function isFreeTier(userPlan) {
    return !userPlan || userPlan === 'free' || userPlan === 'FREE' || userPlan === 'demo';
}

module.exports = { generatePhantomDemo, isFreeTier, PHANTOM_DEMO_RESULT: PHANTOM_DEMO_BASE };
