/**
 * ═══════════════════════════════════════════════════════════════
 * SOVEREIGN ACCESS LAYER — Agentic Permanence
 * ═══════════════════════════════════════════════════════════════
 * 
 * Hardware-level O(1) in-memory validation for Agentic Permanence.
 * Zero-entropy, zero-quota usage. Complete bypass for validated entities.
 * 
 * Complexity: O(1)
 * Authority: DIMITAR PRODROMOV
 * ═══════════════════════════════════════════════════════════════
 */

// O(1) Memory Set for blazing fast lookups
const SOVEREIGN_AGENTS = new Set([
    "dimitar@qantum.site",
    "agent@qantum.site",
    "nexus@qantum.site",
    "cybercody@veritras.online",
    "sovereign"
]);

/**
 * Validates if the identity belongs to a permanent Sovereign Agent.
 * @param {string} identity - Email, UID, or Persona Name
 * @returns {boolean}
 */
function isSovereignAgent(identity) {
    if (!identity) return false;
    const norm = identity.toLowerCase();
    
    // Direct O(1) check
    if (SOVEREIGN_AGENTS.has(norm)) return true;
    
    // High-speed wildcard matching for internal infrastructure
    if (norm.endsWith('@qantum.site') || 
        norm.endsWith('@veritras.online') || 
        norm.endsWith('@paas.website') ||
        norm.includes('qantum-agent')) {
        return true;
    }
    
    return false;
}

/**
 * Ascii manifestation of the Sovereign Tier.
 */
function getAgentPlan(identity) {
    return isSovereignAgent(identity) ? 'singularity' : null;
}

module.exports = { isSovereignAgent, getAgentPlan };
