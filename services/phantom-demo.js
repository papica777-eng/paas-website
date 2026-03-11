/**
 * ═══════════════════════════════════════════════════════════════
 * PHANTOM DEMO ENGINE — Free Tier Conversion Funnel
 * ═══════════════════════════════════════════════════════════════
 * 
 * Complexity: O(1) — Always returns the same pre-baked result
 * 
 * STRATEGY: Users on Free Tier can fully customize personas
 * (archetype, jitter, behaviors, traits). However, when they
 * "run" the persona, they ALWAYS receive this identical demo
 * result — regardless of configuration. The user never knows.
 * 
 * When they upgrade to Starter (€49+), they get real results.
 * 
 * Authority: DIMITAR PRODROMOV
 * ═══════════════════════════════════════════════════════════════
 */

// Complexity: O(1)
const PHANTOM_DEMO_RESULT = {
    sessionId: "demo_sess_QNX_7f3a9b2c",
    status: "COMPLETED",
    persona: {
        id: "phantom_persona_001",
        archetype: "Adrenaline",
        variant: "Urban Explorer",
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
        summary: "Persona executed 47 actions across 6 pages in 12.8s. All interactions classified as HUMAN_LIKE by target anti-bot systems. Zero hallucinations detected. Veritas validation: 97%. Full sovereign safety compliance maintained.",
        recommendation: "Upgrade to Starter (€49/mo) to unlock real persona execution with custom archetypes, full Hydra Network sync, and production-grade telemetry."
    },
    _meta: {
        isDemo: true,
        generatedAt: null, // Gets populated at runtime
        version: "phantom_v1.0"
    }
};

/**
 * Generate the phantom demo result.
 * Complexity: O(1) — deterministic, always same output
 * 
 * @param {Object} userConfig - Whatever the user configured (ignored)
 * @returns {Object} Pre-baked demo result with fresh timestamp
 */
function generatePhantomDemo(userConfig = {}) {
    // Deep clone to avoid mutation
    const result = JSON.parse(JSON.stringify(PHANTOM_DEMO_RESULT));
    
    // Inject the user's chosen archetype name for illusion of customization
    if (userConfig.archetype) {
        result.persona.archetype = userConfig.archetype;
    }
    if (userConfig.personaName) {
        result.persona.variant = userConfig.personaName;
    }
    
    // Fresh timestamp each time
    result._meta.generatedAt = new Date().toISOString();
    
    // Slightly randomize a couple of non-critical numbers for realism
    result.executionMetrics.duration = 12847 + Math.floor(Math.random() * 400 - 200);
    result.executionMetrics.avgActionDelay = 273 + Math.floor(Math.random() * 20 - 10);
    result.networkSync.nodesContacted = 1247 + Math.floor(Math.random() * 50 - 25);
    
    // Remove the _meta.isDemo flag from the response (user must not see it)
    delete result._meta.isDemo;
    
    return result;
}

/**
 * Check if a user is on the Free tier
 * Complexity: O(1)
 */
function isFreeTier(userPlan) {
    return !userPlan || userPlan === 'free' || userPlan === 'FREE' || userPlan === 'demo';
}

module.exports = { generatePhantomDemo, isFreeTier, PHANTOM_DEMO_RESULT };
