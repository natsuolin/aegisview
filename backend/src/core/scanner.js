const { spawn } = require('child_process');
const shlex = require('shlex');

/**
 * Spawns an Nmap process and streams live output telemetry with evasion parameters.
 * @param {string} target - The destination audit target.
 * @param {boolean} useTor - Network routing layer toggle.
 * @param {Function} onDataCallback - Stream handler hook for live chunks.
 * @returns {Promise<string>} - Resolves with full raw output string upon closure.
 */
const runScanLive = (target, useTor = true, onDataCallback) => {
    return new Promise((resolve, reject) => {
        const cleanTarget = shlex.split(target)[0]; // Fast sanitization for shell execution
        
        let cmd = '';
        let args = [];

        if (useTor) {
            cmd = 'proxychains4';
            /**
             * Advanced Evasion profile for high latency Tor Routing:
             * - -sT: Mandatory TCP Connect scan for SOCKS5 proxies.
             * - -sV: Version detection enabled with adjusted thresholds.
             * - -Pn / -n: Disables host discovery ping and reverse DNS to bypass drops.
             * - -T3: Balanced polite timing template to avoid triggering severe rate-limiting.
             * - --scan-delay 500ms: Forces a tactical delay between probe packets to trick WAFs.
             * - --max-retries 2: Accommodates bottleneck node packet drops without killing the query.
             * - --min-rtt-timeout 2000ms: Forces patience on initial handshake responses.
             * - --stats-every 2s: Feeds the live terminal and progress bar engine.
             */
            args = [
                'nmap', '-sT', '-sV', '-Pn', '-n', 
                '-T3', 
                '--scan-delay', '500ms', 
                '--max-retries', '2', 
                '--min-rtt-timeout', '2000ms', 
                '--initial-rtt-timeout', '10800ms', 
                '--max-rtt-timeout', '12000ms', 
                '--stats-every', '2s', 
                '--top-ports', '100', 
                cleanTarget
            ];
        } else {
            cmd = 'nmap';
            // Native direct scan optimized with OS and Version detection
            args = ['-sV', '-O', '--stats-every', '2s', '--top-ports', '100', cleanTarget];
        }

        const processEnv = {
            ...process.env,
            PROXYCHAINS_QUIET_MODE: "1" // Drops proxy log pollution from hijacking the regex parser
        };

        const nmapChild = spawn(cmd, args, { env: processEnv });
        let fullOutput = '';

        nmapChild.stdout.on('data', (data) => {
            const chunk = data.toString();
            fullOutput += chunk;
            if (onDataCallback) {
                onDataCallback(chunk); // Feeds live stdout data directly to the SSE route response
            }
        });

        nmapChild.stderr.on('data', (data) => {
            fullOutput += data.toString();
        });

        nmapChild.on('close', (code) => {
            resolve(fullOutput);
        });

        nmapChild.on('error', (err) => {
            reject(err);
        });
    });
};

module.exports = { runScanLive };