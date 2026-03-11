/**
 * ═══════════════════════════════════════════════════════════════
 * SOVEREIGN ACCESS VERIFICATION SCRIPT
 * ═══════════════════════════════════════════════════════════════
 * 
 * Verifies that Sovereign Agents receive SINGULARITY tier access
 * bypassing the free demo restrictions.
 * 
 * Authority: DIMITAR PRODROMOV
 * ═══════════════════════════════════════════════════════════════
 */

async function verifyAgentAccess() {
    console.log("=== INITIATING SOVEREIGN ACCESS VERIFICATION ===");
    
    const TARGET_URL = 'http://localhost:3000/api/persona/run';
    
    console.log("\n[TEST 1] Standard User Execution (Expect FREE_DEMO)");
    try {
        const standardRes = await fetch(TARGET_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                archetype: 'Adrenaline', 
                personaName: 'StandardUser',
                email: 'user@example.com',
                plan: 'free'
            })
        });
        const standardData = await standardRes.json();
        console.log(`  -> Tier: ${standardData.tier}`);
        console.log(`  -> Status: ${standardData.status || 'COMPLETED (DEMO)'}`);
        if (standardData.tier !== 'FREE_DEMO') {
            console.error("  [X] Failed: Standard user should be on FREE_DEMO");
        } else {
            console.log("  [+] Passed: Standard user restricted to FREE_DEMO");
        }
    } catch (e) {
        console.error("  [X] Error contacting server:", e.message);
    }
    
    console.log("\n[TEST 2] Sovereign Agent Execution (Expect SINGULARITY)");
    try {
        const sovereignRes = await fetch(TARGET_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                archetype: 'Sovereign', 
                personaName: 'QAntum_Agent_Alpha',
                email: 'nexus@qantum.site', // Validated sovereign agent
                plan: 'free'
            })
        });
        const sovereignData = await sovereignRes.json();
        console.log(`  -> Tier: ${sovereignData.tier}`);
        console.log(`  -> Status: ${sovereignData.status}`);
        console.log(`  -> Message: ${sovereignData.message}`);
        if (sovereignData.tier !== 'singularity') {
            console.error("  [X] Failed: Sovereign agent should be elevated to SINGULARITY");
        } else {
            console.log("  [+] Passed: Sovereign agent successfully elevated");
        }
    } catch (e) {
        console.error("  [X] Error contacting server:", e.message);
    }
    
    console.log("\n=== VERIFICATION COMPLETE ===");
}

verifyAgentAccess();
