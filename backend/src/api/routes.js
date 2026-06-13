const express = require('express');
const router = express.Router();
const { runScanLive } = require('../core/scanner');
const { parseNmapOutput } = require('../utils/parser');

router.get('/scan', async (req, res) => {
    const { target, useTor } = req.query;
    const isTorEnabled = useTor === 'true';

    if (!target) {
        return res.status(400).json({ error: "Missing scan target parameter." });
    }

    // Configura os cabeçalhos do Server-Sent Events (SSE) para streaming em tempo real
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    console.log(`[LOG] Streaming live scan for target: ${target}`);

    try {
        const rawResult = await runScanLive(target, isTorEnabled, (textChunk) => {
            // Procura padrões de progresso do Nmap no texto (ex: Stats: 12.50% elapsed)
            const progressMatch = textChunk.match(/Stats:.*?(\d+\.\d+)%/i);
            const portMatch = textChunk.match(/(\d+)\/(tcp|udp)\s+open/i);

            let livePayload = { type: 'terminal', data: textChunk };

            if (progressMatch) {
                livePayload.percentage = progressMatch[1];
            }
            if (portMatch) {
                livePayload.foundPort = `Found open port: ${portMatch[1]}`;
            }

            // Envia o chunk em tempo real no formato SSE
            res.write(`data: ${JSON.stringify(livePayload)}\n\n`);
        });

        // Quando o processo terminar, roda o parser no relatório final completo
        const structuredData = parseNmapOutput(rawResult);
        
        // Envia o payload do Dashboard finalizador
        res.write(`data: ${JSON.stringify({ type: 'final_result', data: structuredData })}\n\n`);
        res.end();

    } catch (error) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
        res.end();
    }
});

module.exports = router;