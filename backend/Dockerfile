FROM node:18-slim

# Install low-level network recon tools, dns resolvers, curl and anonymity system daemons
RUN apt-get update && apt-get install -y \
    nmap \
    tor \
    proxychains4 \
    dnsutils \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Hardcode Proxychains configuration routing to map directly into the native Tor SOCKS5 listener
RUN echo "strict_chain" > /etc/proxychains4.conf && \
    echo "proxy_dns" >> /etc/proxychains4.conf && \
    echo "[ProxyList]" >> /etc/proxychains4.conf && \
    echo "socks5 127.0.0.1 9050" >> /etc/proxychains4.conf

# Unlocks Tor internal ControlPort for dynamic identity/circuit switching parameters (NEWNYM signal)
RUN echo "ControlPort 9051" >> /etc/tor/torrc && \
    echo "CookieAuthentication 0" >> /etc/tor/torrc

WORKDIR /app

# Optimize layering cache mechanism for Node.js production dependencies
COPY package*.json ./
RUN npm install --only=production

# Replicate backend repository code inside the container
COPY . .

# Expose API port standard
EXPOSE 8000

# Operational entrypoint hook: Spawns Tor service, strictly tests the SOCKS5 proxy internet connectivity via curl, then triggers Node engine
CMD service tor start && \
    echo "⏳ Waiting for Tor circuit to establish dynamic routes..." && \
    until curl --socks5-hostname 127.0.0.1:9050 -s https://check.torproject.org | grep -q "Congratulations" 2>/dev/null; do \
        echo "🔄 Circuit building in progress, retrying connection test in 5s..."; \
        sleep 5; \
    done && \
    echo "🛡️ Tor Network is fully operational with active exit nodes!" && \
    node src/main.js