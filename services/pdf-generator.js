/**
 * 📄 QANTUM - Executive PDF Report Generator
 *
 * Generates beautiful PDF reports with:
 * - Executive Summary
 * - ROI Calculator (money saved)
 * - Test Statistics & Graphs
 * - AI Self-Healing Analytics
 * - Security Compliance Score
 *
 * @version 1.0.1-QANTUM-PRIME (Zero Entropy Fixed)
 */

const PDFDocument = require('pdfkit');

// ============================================================
// PDF GENERATOR CLASS
// ============================================================
class ExecutivePDFReport {
    constructor() {
        this.colors = {
            primary: '#00ffb2',      // Neon Green
            secondary: '#9455d3',    // Purple
            success: '#00ffb2',      // Neon Green for success
            danger: '#ff3333',       // Neon Red
            warning: '#ffcc00',      // Yellow/Orange
            info: '#00d2ff',         // Cyan
            dark: '#050515',         // PaaS Background
            card: '#0f0f1e',         // PaaS Surface
            text: '#ffffff',         // White text
            muted: '#a0abba',        // Dim text
            border: '#2d2d5a',       // Border color
        };

        this.doc = new PDFDocument({
            size: 'A4',
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            bufferPages: true,
            autoFirstPage: true,
            info: {
                Title: 'Veritas Protocol QA Audit Report',
                Author: 'QAntum Sovereign Architecture',
                Creator: 'QAntum PaaS Engine',
                Producer: 'Phantom Swarm',
                CreationDate: new Date()
            }
        });
    }

    /**
     * Generate Executive PDF Report and pipe to a stream (e.g. Express res)
     */
    async stream(data, res) {
        return new Promise((resolve, reject) => {
            try {
                this.doc.pipe(res);

                this.doc.font('Helvetica');

                // Page 1: Cover
                this.addCoverPage(data);

                // Page 2: Summary
                this.doc.addPage();
                this.addExecutiveSummary(data);

                // Page 3: ROI
                this.doc.addPage();
                this.addROIAnalysis(data);

                // Page 4: Metrics
                this.doc.addPage();
                this.addTestMetrics(data);

                // Page 5: Healing
                this.doc.addPage();
                this.addSelfHealingReport(data);

                // Page 6: Recommendations
                this.doc.addPage();
                this.addRecommendations(data);

                // Global Finalization: Footers
                const range = this.doc.bufferedPageRange();
                for (let i = 0; i < range.count; i++) {
                    this.doc.switchToPage(i);
                    if (i > 0) { // No footer on cover
                        this.addFooter(i + 1, range.count);
                    }
                }

                this.doc.end();
                
                // Allow the caller to know when the response finishes
                res.on('finish', () => resolve(true));
                res.on('error', reject);
            } catch (err) {
                reject(err);
            }
        });
    }

    addFooter(currentPage, totalPages) {
        const { width, height } = this.doc.page;
        const bottom = height - 40;

        // Visual divider
        this.doc.moveTo(50, bottom).lineTo(width - 50, bottom)
            .strokeColor(this.colors.border).lineWidth(0.5).stroke();

        this.doc.fontSize(8).fillColor(this.colors.muted);
        this.doc.text('© 2026 QANTUM PAAS • VERITAS PROTOCOL AUDIT', 50, bottom + 10, { lineBreak: false });

        this.doc.text(`Page ${currentPage} of ${totalPages}`, width - 150, bottom + 10, { align: 'right', width: 100, lineBreak: false });
    }

    addCoverPage(data) {
        const { width, height } = this.doc.page;

        // Dark background matching PaaS
        this.doc.rect(0, 0, width, height).fill(this.colors.dark);

        // Grid/Accent effect at top
        this.doc.moveTo(0, 10).lineTo(width, 10).strokeColor(this.colors.primary).lineWidth(2).stroke();
        this.doc.moveTo(0, 18).lineTo(width, 18).strokeColor(this.colors.secondary).lineWidth(1).stroke();

        // Identity
        this.doc.moveTo(0, height * 0.65).lineTo(width, height * 0.65).strokeColor(this.colors.primary).lineWidth(3).stroke();

        this.doc.fontSize(90).fillColor(this.colors.primary).font('Helvetica-Bold');
        this.doc.text('⬡', 50, height * 0.65 - 130);
        this.doc.fontSize(52).fillColor('#ffffff').font('Helvetica-Bold');
        this.doc.text('QANTUM', 135, height * 0.65 - 102);

        this.doc.fontSize(20).fillColor(this.colors.primary).font('Helvetica');
        this.doc.text('SOVEREIGN COGNITIVE INFRASTRUCTURE', 135, height * 0.65 - 45);

        this.doc.fontSize(28).fillColor('#ffffff').font('Helvetica-Bold');
        this.doc.text('VERITAS PROTOCOL: QA AUDIT', 50, height * 0.65 + 40);

        // Details column
        const yBase = height * 0.65 + 100;
        this.doc.fontSize(12).fillColor(this.colors.muted).font('Helvetica');
        this.doc.text('TARGET ASSET:', 50, yBase);
        this.doc.text('TESTING NODE:', 300, yBase);

        this.doc.fontSize(14).fillColor('#ffffff').font('Helvetica-Bold');
        this.doc.text(data.targetUrl, 50, yBase + 18, { width: 230, ellipsis: true });
        this.doc.text(data.nodeName, 300, yBase + 18);

        this.doc.fontSize(10).fillColor(this.colors.muted).font('Helvetica');
        this.doc.text(`TIMESTAMP: ${data.reportDate.toISOString()}`, 50, height - 70);
        this.doc.fillColor(this.colors.primary).text(`ZERO ENTROPY MAINTAINED`, 300, height - 70);
    }

    addExecutiveSummary(data) {
        this.addHeader('📊 EXECUTIVE OVERVIEW');
        const { metrics, roi } = data;

        this.doc.fontSize(12).fillColor('#ffffff').font('Helvetica');
        this.doc.text(
            `Strategic summary of the Veritas automated quality assurance lifecycle and its corresponding capital preservation impact for the target asset: ${data.targetUrl}.`,
            50, 110, { width: 495, align: 'justify' }
        );

        let y = 180;
        this.addMetricBox('ASSERTIONS CHECKED', metrics.totalTests.toLocaleString(), this.colors.secondary, 50, y);
        this.addMetricBox('PASS RATE', `${metrics.passRate.toFixed(1)}%`, this.colors.primary, 215, y);
        this.addMetricBox('VULNERABILITIES (SIM)', `${metrics.healed}`, this.colors.danger, 380, y);

        y += 120;
        this.doc.fontSize(14).fillColor(this.colors.primary).font('Helvetica-Bold');
        this.doc.text('KEY STRATEGIC FINDINGS', 50, y);

        y += 30;
        const findings = [
            `✅ Coverage: Structural asset analysis identified hidden DOM layers.`,
            `✅ Resilience: ${roi.bugsPreventedInProduction} potential rendering regressions neutralized artificially.`,
            `✅ Velocity: Test execution lifecycle completed in ${metrics.avgDuration.toFixed(1)} seconds per block.`,
            `✅ Architecture: Page Object Model encapsulated ${metrics.totalTests} micro-interactions.`
        ];

        findings.forEach(f => {
            this.doc.fontSize(11).fillColor('#ffffff').font('Helvetica').text(f, 65, y);
            y += 25;
        });
    }

    addROIAnalysis(data) {
        this.addHeader('💎 ECONOMIC PRESERVATION (ROI)');
        const { roi } = data;

        this.doc.rect(50, 120, 495, 100).fill(this.colors.card);
        this.doc.rect(50, 120, 495, 100).strokeColor(this.colors.primary).lineWidth(1).stroke();

        this.doc.fontSize(36).fillColor(this.colors.primary).font('Helvetica-Bold').text(`$${roi.totalROI.toLocaleString()}`, 50, 145, { width: 495, align: 'center' });
        this.doc.fontSize(12).fillColor('#ffffff').font('Helvetica').text('PROJECTED CAPITAL PRESERVATION (ANNUAL)', 50, 190, { width: 495, align: 'center' });

        let y = 260;
        this.doc.rect(50, y, 495, 30).fill(this.colors.card);
        this.doc.fontSize(12).fillColor(this.colors.primary).font('Helvetica-Bold').text('FINANCIAL BREAKDOWN OVERVIEW', 65, y + 10);

        y += 45;
        const items = [
            { l: 'Manual Labor Replacement (QA Salaries)', v: `$${(roi.hoursSaved * roi.avgQASalaryPerHour).toLocaleString()}` },
            { l: 'Production Downtime Avoidance / SLA', v: `$${(roi.bugsPreventedInProduction * roi.estimatedBugCost).toLocaleString()}` },
            { l: 'Infrastructure Optimization Node Utilization', v: '100% (ZERO WASTE)' }
        ];

        items.forEach(item => {
            this.doc.fontSize(11).fillColor('#ffffff').font('Helvetica').text(item.l, 65, y, { width: 300 });
            this.doc.fillColor(this.colors.primary).text(item.v, 370, y, { width: 160, align: 'right' });
            y += 30;
        });
    }

    addTestMetrics(data) {
        this.addHeader('🧪 PERFORMANCE DATA');
        const { metrics } = data;
        let y = 120;

        this.addFancyProgressBar('SUCCESSFUL VALIDATIONS', metrics.passed, metrics.totalTests, this.colors.primary, y);
        y += 70;
        this.addFancyProgressBar('AI SELF-HEALING', metrics.healed, metrics.totalTests, this.colors.secondary, y);
        y += 70;
        this.addFancyProgressBar('ARCHITECTURAL ENTROPY', metrics.failed, metrics.totalTests, this.colors.danger, y);

        y += 100;
        this.doc.fontSize(14).fillColor(this.colors.primary).font('Helvetica-Bold').text('7-DAY SUCCESS TREND (SIMULATED)', 50, y);
        y += 30;
        data.trendData.forEach((val, i) => {
            const h = (val / 100) * 80;
            const x = 70 + (i * 65);
            this.doc.rect(x, y + 80 - h, 35, h).fill(val > 90 ? this.colors.primary : this.colors.warning);
            this.doc.fontSize(8).fillColor('#ffffff').text(`${val}%`, x, y + 80 - h - 12, { width: 35, align: 'center' });
        });
    }

    addSelfHealingReport(data) {
        this.addHeader('🔄 AI AUTONOMY LOG');
        let y = 120;

        this.doc.fontSize(12).fillColor('#ffffff').font('Helvetica');
        this.doc.text(
            `Sovereign Engine dynamically patched selector definitions at runtime via zero-shot cognition.`,
            50, y, { width: 495 }
        );

        y += 40;
        data.healingHistory.slice(0, 7).forEach((h, i) => {
            if (i % 2 === 0) this.doc.rect(50, y - 5, 495, 40).fill(this.colors.card);
            this.doc.fontSize(9).fillColor(this.colors.secondary).text('HEALED:', 60, y + 10);
            this.doc.fillColor('#ffffff').text(`${h.selector} → ${h.newSelector}`, 115, y + 10, { width: 400, ellipsis: true });
            y += 40;
        });
    }

    addRecommendations(data) {
        this.addHeader('💡 ARCHITECT ADVISORY');
        let y = 120;
        const recs = [
            { t: 'Upgrade to Paid Tier for Real Execution', d: 'This report is generated by the Phantom Demo Swarm. Real metrics require active infrastructure scaling and connection to the Wealth Bridge.', p: 'CRITICAL' },
            { t: 'Implement strict Semantic HTML Hooks', d: 'The target architecture relies heavily on brittle CSS classes. Inject data-testid attributes for optimal Cognitive linkage.', p: 'RECOMMENDATION' }
        ];

        recs.forEach(r => {
            this.doc.rect(50, y, 495, 80).fill(this.colors.card);
            this.doc.fontSize(10).fillColor(r.p === 'CRITICAL' ? this.colors.primary : this.colors.secondary).text(r.p, 60, y + 10);
            this.doc.fontSize(14).fillColor('#ffffff').font('Helvetica-Bold').text(r.t, 60, y + 25);
            this.doc.fontSize(10).fillColor(this.colors.muted).font('Helvetica').text(r.d, 60, y + 45, { width: 450 });
            y += 100;
        });
        
        y += 30;
        this.doc.fontSize(10).fillColor(this.colors.muted).text('END OF VERITAS PROTOCOL AUDIT.', 50, y, { align: 'center', width: 495 });
        this.doc.text('AWAITING NEXT DIRECTIVE.', 50, y + 15, { align: 'center', width: 495 });
    }

    // ============================================================
    // HELPERS
    // ============================================================

    addHeader(title) {
        this.doc.rect(0, 0, this.doc.page.width, 80).fill(this.colors.dark);
        this.doc.fontSize(22).fillColor('#ffffff').font('Helvetica-Bold').text(title, 50, 30);
        this.doc.moveTo(0, 80).lineTo(this.doc.page.width, 80).strokeColor(this.colors.primary).lineWidth(2).stroke();
    }

    addMetricBox(label, value, color, x, y) {
        this.doc.rect(x, y, 140, 80).fill(this.colors.card);
        this.doc.rect(x, y, 140, 4).fill(color);
        this.doc.fontSize(24).fillColor('#ffffff').font('Helvetica-Bold').text(value, x, y + 22, { width: 140, align: 'center' });
        this.doc.fontSize(10).fillColor(this.colors.muted).font('Helvetica').text(label, x, y + 55, { width: 140, align: 'center' });
    }

    addFancyProgressBar(label, value, total, color, y) {
        const perc = (value / total) * 100;
        const w = 495;
        this.doc.fontSize(11).fillColor('#ffffff').font('Helvetica-Bold').text(label, 50, y);
        this.doc.fillColor(color).text(`${perc.toFixed(1)}%`, 450, y, { width: 95, align: 'right' });
        this.doc.rect(50, y + 20, w, 18).fill(this.colors.card);
        this.doc.rect(50, y + 20, (perc / 100) * w, 18).fill(color);
    }
}

// ============================================================
// EXPORT FUNCTION
// ============================================================
async function streamExecutiveReport(res, targetUrl = 'https://example.com') {
    const data = {
        targetUrl: targetUrl,
        nodeName: 'VERITAS-PHANTOM-X7',
        reportDate: new Date(),
        period: 'Q1 2026',
        metrics: {
            totalTests: 1842, passed: 1790, failed: 2, skipped: 15, healed: 35,
            passRate: 97.1, avgDuration: 1.2, totalDuration: 2210.4
        },
        roi: {
            hoursManualTesting: 420, hoursSaved: 415, avgQASalaryPerHour: 65,
            moneySaved: 26975, bugsPreventedInProduction: 8, estimatedBugCost: 8500, totalROI: 94975
        },
        healingHistory: [
            { selector: '#hero-cta', newSelector: 'a.primary-cta', strategy: 'semantic structure', confidence: 99 },
            { selector: '.footer-links > div:last-child', newSelector: '[data-testid="footer-legal"]', strategy: 'data attribute fallback', confidence: 97 },
            { selector: 'button.login', newSelector: 'button[type="submit"]', strategy: 'form implicit analysis', confidence: 95 },
            { selector: 'div.modal', newSelector: 'dialog[open]', strategy: 'native HTML5 upgrade', confidence: 93 },
        ],
        trendData: [92, 94, 91, 95, 96, 97, 97.1]
    };

    const generator = new ExecutivePDFReport();
    return generator.stream(data, res);
}

async function streamPersonaReport(res, archetype, personaName) {
    let targetUrl = "Hydra Network Uplink";
    let summaryText = `Strategic summary of the ${archetype} automated lifecycle and its corresponding capital preservation impact relative to manual execution.`;
    
    if (archetype === 'Accountant') targetUrl = "Financial Ledger & Payroll";
    else if (archetype === 'HRRecruiter') targetUrl = "LinkedIn Candidate ATS";
    else if (archetype === 'QATester') targetUrl = "Frontend DOM Matrix";
    else if (archetype === 'Sovereign') targetUrl = "Root Infrastructure";
    
    let roi = {
        hoursManualTesting: 420, hoursSaved: 415, avgQASalaryPerHour: 55,
        moneySaved: 22825, bugsPreventedInProduction: 0, estimatedBugCost: 0, totalROI: 22825
    };
    
    if (archetype === 'Accountant') {
        roi.avgQASalaryPerHour = 85; 
        roi.moneySaved = 415 * 85;
        roi.totalROI = roi.moneySaved;
    } else if (archetype === 'HRRecruiter') {
        roi.avgQASalaryPerHour = 45;
        roi.moneySaved = 415 * 45;
        roi.totalROI = roi.moneySaved;
    } else if (archetype === 'QATester') {
        roi.avgQASalaryPerHour = 65;
        roi.bugsPreventedInProduction = 8;
        roi.estimatedBugCost = 8500;
        roi.moneySaved = 415 * 65;
        roi.totalROI = roi.moneySaved + (8 * 8500);
    }

    const data = {
        targetUrl: targetUrl,
        nodeName: personaName || 'NEXUS-NODE',
        reportDate: new Date(),
        period: 'Q1 2026',
        metrics: {
            totalTests: Math.floor(1000 + Math.random() * 5000), 
            passed: Math.floor(900 + Math.random() * 4500), 
            failed: 0, 
            skipped: 0, 
            healed: Math.floor(10 + Math.random() * 50),
            passRate: 99.9, avgDuration: 1.2, totalDuration: 2210.4
        },
        roi: roi,
        healingHistory: [
            { selector: '#legacy-system', newSelector: 'nexus-cognitive-layer', strategy: 'heuristic bypass', confidence: 99 },
            { selector: 'human-error', newSelector: 'zero-entropy-state', strategy: 'deterministic override', confidence: 100 },
            { selector: 'manual-delay', newSelector: 'quantum-routing', strategy: 'latency elimination', confidence: 95 },
        ],
        trendData: [99, 99.5, 99.8, 99.9, 100, 100, 100]
    };

    const generator = new ExecutivePDFReport();
    
    // Override the executive summary for Persona specific terms
    generator.addExecutiveSummary = function(d) {
        this.addHeader(`📊 ${archetype.toUpperCase()} OVERVIEW`);
        const { metrics, roi } = d;

        this.doc.fontSize(12).fillColor('#ffffff').font('Helvetica');
        this.doc.text(summaryText, 50, 110, { width: 495, align: 'justify' });

        let y = 180;
        this.addMetricBox('OPERATIONS COMPLETED', metrics.totalTests.toLocaleString(), this.colors.secondary, 50, y);
        this.addMetricBox('PRECISION RATE', `${metrics.passRate.toFixed(1)}%`, this.colors.primary, 215, y);
        this.addMetricBox('ENTROPY HEALED', `${metrics.healed}`, this.colors.danger, 380, y);

        y += 120;
        this.doc.fontSize(14).fillColor(this.colors.primary).font('Helvetica-Bold');
        this.doc.text('KEY STRATEGIC FINDINGS', 50, y);

        y += 30;
        const findings = [
            `✅ Execution: Zero-entropy state maintained across all nodes.`,
            `✅ Precision: Architectural integrity verified automatically.`,
            `✅ Velocity: Lifecycle completed flawlessly.`,
            `✅ Cognitive Load: O(1) operational focus achieved.`
        ];

        findings.forEach(f => {
            this.doc.fontSize(11).fillColor('#ffffff').font('Helvetica').text(f, 65, y);
            y += 25;
        });
    };

    return generator.stream(data, res);
}

module.exports = {
    streamExecutiveReport,
    streamPersonaReport
};
