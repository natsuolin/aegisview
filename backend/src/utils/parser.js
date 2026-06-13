/**
 * Processes and extracts structured intelligence from raw Nmap terminal data.
 * @param {string} rawOutput - Raw stdout text string from the terminal.
 * @returns {Object} - Formatted JSON data blueprint for data visualization.
 */
const parseNmapOutput = (rawOutput) => {
    const report = {
        summary: {
            status: "Unknown/Filtered",
            scanned_ports: 0,
            open_ports_count: 0,
            scan_duration: "N/A"
        },
        ports: []
    };

    // Regex to match: PORT/PROTOCOL STATUS SERVICE VERSION
    // Example capture match: "80/tcp open http nginx 1.18.0"
    const portLineRegex = /^(\d+)\/(tcp|udp)\s+(open|filtered|closed)\s+([^\s]+)\s*(.*)$/;
    const durationRegex = /Nmap done: .* elapsed (\d+\.\d+) seconds/i;

    // Remove Windows carriage returns (\r) to guarantee pristine line-by-line parsing inside Linux
    const lines = rawOutput.replace(/\r/g, '').split('\n');

    lines.forEach(line => {
        const cleanLine = line.trim();

        // Hard barrier to drop any residual Proxychains S-chain debug strings that bypass quiet mode
        if (cleanLine.startsWith('|S-chain|')) return;

        // 1. Evaluate if the line contains asset port indicators
        const portMatch = cleanLine.match(portLineRegex);
        if (portMatch) {
            const [_, port, protocol, status, service, version] = portMatch;
            
            report.ports.push({
                port: parseInt(port, 10),
                protocol,
                status,
                service,
                version: version ? version.trim() : "Unknown Version"
            });

            if (status === 'open') {
                report.summary.open_ports_count++;
            }
        }

        // 2. Extrapolate runtime metrics and host accessibility status
        if (cleanLine.includes('Host is up') || cleanLine.includes('Nmap scan report')) {
            report.summary.status = "Online";
        } else if (cleanLine.toLowerCase().includes('nmap done')) {
            const durationMatch = cleanLine.match(durationRegex);
            if (durationMatch) {
                report.summary.scan_duration = `${durationMatch[1]}s`;
            } else {
                report.summary.scan_duration = "Completed";
            }
        }
    });

    // Compute metrics tally
    report.summary.scanned_ports = report.ports.length;

    // Fallback sync logic for state verification
    if (report.summary.open_ports_count > 0) {
        report.summary.status = "Online";
    }

    return report;
};

module.exports = { parseNmapOutput };