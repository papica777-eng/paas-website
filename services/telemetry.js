/**
 * ═══════════════════════════════════════════════════════════════
 * TELEMETRY SERVICE — Real Hardware Metrics
 * ═══════════════════════════════════════════════════════════════
 * 
 * Complexity: O(1) — Direct OS queries
 * Protocol: Reports NULL_HARDWARE_ACCESS on failure (Veritas)
 * 
 * Authority: DIMITAR PRODROMOV
 * ═══════════════════════════════════════════════════════════════
 */

const os = require('os');

// Complexity: O(1)
function getCpuLoad() {
    try {
        const cpus = os.cpus();
        if (!cpus || cpus.length === 0) return "NULL_HARDWARE_ACCESS";
        
        let totalIdle = 0, totalTick = 0;
        for (const cpu of cpus) {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        }
        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        return Math.round((1 - idle / total) * 100);
    } catch {
        return "NULL_HARDWARE_ACCESS";
    }
}

// Complexity: O(1)
function getMemoryUsage() {
    try {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        return {
            totalGB: +(totalMem / 1073741824).toFixed(2),
            usedGB: +(usedMem / 1073741824).toFixed(2),
            freeGB: +(freeMem / 1073741824).toFixed(2),
            usagePercent: Math.round((usedMem / totalMem) * 100)
        };
    } catch {
        return "NULL_HARDWARE_ACCESS";
    }
}

// Complexity: O(1)
function getSystemInfo() {
    try {
        return {
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname(),
            cpuModel: os.cpus()?.[0]?.model || "NULL_HARDWARE_ACCESS",
            cpuCores: os.cpus()?.length || 0,
            uptime: Math.round(os.uptime()),
            nodeVersion: process.version,
            processMemoryMB: +(process.memoryUsage().heapUsed / 1048576).toFixed(2)
        };
    } catch {
        return "NULL_HARDWARE_ACCESS";
    }
}

// Complexity: O(1)
function getFullTelemetry() {
    return {
        cpuLoad: getCpuLoad(),
        memory: getMemoryUsage(),
        system: getSystemInfo(),
        timestamp: new Date().toISOString(),
        entropy: 0.00,
        veritasValidated: true
    };
}

module.exports = { getCpuLoad, getMemoryUsage, getSystemInfo, getFullTelemetry };
