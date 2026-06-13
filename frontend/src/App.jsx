import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Shield, ShieldAlert, Globe, Clock, Terminal, Search, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

// Register ChartJS elements for data visualization
ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [target, setTarget] = useState('');
  const [useTor, setUseTor] = useState(true);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('0');
  const [terminalLogs, setTerminalLogs] = useState([]);

  const handleScan = (e) => {
    e.preventDefault();
    if (!target) return;

    setLoading(true);
    setError(null);
    setScanResult(null);
    setProgress('0');
    setTerminalLogs(["[INIT] Establishing dynamic telemetry stream to backend core..."]);

    // Opens a native EventSource stream matching the new SSE layout on backend port 8000
    const eventSource = new EventSource(`http://localhost:8000/api/scan?target=${target}&useTor=${useTor}`);

    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      // 1. Live console text chunks stream
      if (payload.type === 'terminal') {
        setTerminalLogs((prev) => [...prev, payload.data]);
        if (payload.percentage) {
          setProgress(payload.percentage);
        }
      }

      // 2. Scan completed with full data payload return
      if (payload.type === 'final_result') {
        setScanResult(payload.data);
        setLoading(false);
        eventSource.close(); // Clean connection pipe closure
      }

      // 3. Subprocess lifecycle failure event capture
      if (payload.type === 'error') {
        setError(payload.error);
        setLoading(false);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      setError("Stream connection lost or backend subprocess aborted.");
      setLoading(false);
      eventSource.close();
    };
  };

  // Prepare data models for the Doughnut Chart layout
  const chartData = scanResult ? {
    labels: ['Open Ports', 'Filtered/Closed Ports'],
    datasets: [{
      data: [
        scanResult.summary.open_ports_count,
        scanResult.summary.scanned_ports - scanResult.summary.open_ports_count
      ],
      backgroundColor: ['#ef4444', '#1f2937'],
      borderColor: ['#b91c1c', '#374151'],
      borderWidth: 1,
    }]
  } : null;

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-gray-100 p-6">
      {/* Header Context Layout */}
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between border-b border-gray-800 pb-5">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-500 animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-white">AEGISVIEW</h1>
            <p className="text-xs text-gray-400 font-mono">External Attack Surface Intelligence v1.0.0</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-md font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-gray-300">CORE NODE ACTIVE</span>
        </div>
      </header>

      {/* Target Controller Inputs */}
      <main className="max-w-6xl mx-auto">
        <section className="bg-gray-950 border border-gray-800 rounded-xl p-6 mb-8 shadow-xl">
          <form onSubmit={handleScan} className="space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Enter Target Domain or Host IP Address (e.g., scanme.nmap.org)..."
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={loading}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
              />
            </div>
            
            <div className="flex items-center space-x-6 bg-gray-900 border border-gray-800 px-4 py-3 rounded-lg">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useTor}
                  onChange={(e) => setUseTor(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs font-semibold text-gray-300 font-mono tracking-wide">ROUTING VIA TOR NETWORK</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>EXECUTING AUDIT...</span>
                </>
              ) : (
                <span>RUN AUDIT</span>
              )}
            </button>
          </form>
        </section>

        {/* Dynamic Live Terminal & Progress Feedback */}
        {loading && (
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 mb-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <span className="text-sm font-mono text-blue-400 font-bold uppercase tracking-wider">Audit Subprocess Telemetry Input</span>
              </div>
              <span className="text-sm font-mono text-emerald-400 font-bold">{progress}% Complete</span>
            </div>

            {/* Real Progress Bar */}
            <div className="w-full bg-gray-900 rounded-full h-2 border border-gray-800 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Live Terminal Console Box */}
            <div className="bg-[#040711] border border-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs text-emerald-500/90 space-y-1 shadow-inner scrollbar-thin scrollbar-thumb-gray-800">
              {terminalLogs.map((log, i) => (
                <pre key={i} className="whitespace-pre-wrap break-all leading-relaxed text-left">
                  {log}
                </pre>
              ))}
            </div>
          </div>
        )}

        {/* Runtime Exception Notification Box */}
        {error && (
          <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-5 flex items-start space-x-3 text-red-400 mb-8">
            <ShieldAlert className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold tracking-wide">CRITICAL SUBPROCESS EXCEPTION</h3>
              <p className="text-xs font-mono mt-1 text-red-300/80">{error}</p>
            </div>
          </div>
        )}

        {/* Analytics Dashboard Panels (Visible upon successful scan return) */}
        {scanResult && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Stat Metrics Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 flex items-center space-x-4 shadow-md">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">TARGET HOST STATUS</p>
                  <p className="text-lg font-bold font-mono tracking-wide mt-0.5 text-white">
                    {scanResult.summary.status}
                  </p>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 flex items-center space-x-4 shadow-md">
                <div className={`p-3 rounded-lg ${scanResult.summary.open_ports_count > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">OPEN THREAT VECTORS</p>
                  <p className="text-lg font-bold font-mono tracking-wide mt-0.5 text-white">
                    {scanResult.summary.open_ports_count} Ports
                  </p>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 flex items-center space-x-4 shadow-md">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">TOTAL EVALUATED PORTS</p>
                  <p className="text-lg font-bold font-mono tracking-wide mt-0.5 text-white">
                    {scanResult.summary.scanned_ports}
                  </p>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 flex items-center space-x-4 shadow-md">
                <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">SCAN DURATION RUNTIME</p>
                  <p className="text-lg font-bold font-mono tracking-wide mt-0.5 text-white">
                    {scanResult.summary.scan_duration}
                  </p>
                </div>
              </div>
            </div>

            {/* Split layout: Chart Analysis vs Port Data Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Doughnut Chart Breakdown Widget */}
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-md flex flex-col items-center justify-center">
                <h3 className="text-xs font-bold tracking-wider text-gray-400 mb-6 self-start uppercase font-mono">
                  Threat Proportional Density
                </h3>
                <div className="w-48 h-48">
                  <Doughnut data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
                <div className="mt-6 flex space-x-6 text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-gray-400">Open ({scanResult.summary.open_ports_count})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-gray-800"></span>
                    <span className="text-gray-400">Filtered/Closed</span>
                  </div>
                </div>
              </div>

              {/* Data Table Widget Listing Port Targets */}
              <div className="lg:col-span-2 bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="text-xs font-bold tracking-wider text-gray-400 mb-4 uppercase font-mono">
                  Identified Infrastructure Endpoints
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-500">
                        <th className="pb-3 font-semibold">PORT</th>
                        <th className="pb-3 font-semibold">PROTOCOL</th>
                        <th className="pb-3 font-semibold">STATUS</th>
                        <th className="pb-3 font-semibold">SERVICE</th>
                        <th className="pb-3 font-semibold">VERSION PROFILE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                      {scanResult.ports.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-900/40 transition-colors text-gray-300">
                          <td className="py-3.5 font-bold text-white">{item.port}</td>
                          <td className="py-3.5 uppercase text-gray-400">{item.protocol}</td>
                          <td className="py-3.5">
                            <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'open' ? 'bg-red-950 text-red-400 border border-red-900/50' : 'bg-gray-900 text-gray-500 border border-gray-800'
                            }`}>
                              {item.status === 'open' ? (
                                <AlertTriangle className="w-3 h-3" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              <span className="uppercase">{item.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 text-blue-400 font-semibold">{item.service}</td>
                          <td className="py-3.5 text-gray-400 max-w-[200px] truncate">{item.version}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {scanResult.ports.length === 0 && (
                    <p className="text-center text-gray-500 text-xs py-10">
                      No detectable ports exposed on this target top-100 sector layout.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;