# 🧠 AegisView — Network Reconnaissance Project

The **AegisView Network Reconnaissance Project** is a comprehensive, enterprise-grade tool designed to perform deep network reconnaissance and surface vulnerability scanning. 
It seamlessly utilizes the combined power of **Nmap** and **Tor** to provide an ultra-secure, completely anonymous scanning experience. The ecosystem consists of a high-performance backend streaming API built with 
**Express.js** and an interactive analytics frontend application powered by **React**.

---

## 🚀 Core Features

* **📡 Nmap Infrastructure Scanning:** Perform network reconnaissance using Nmap and retrieve detailed, structured information about target endpoints.
* **🕵️‍♂️ Tor Network Anonymity:** Utilize the Tor network overlay via Proxychains4 to anonymize scanning packets and thoroughly protect user infrastructure identity.
* **⚡ Real-time Telemetry Streams:** Receive instant scan progress, real-time percentages, and discovery updates through asynchronous Server-Sent Events (SSE).
* **📊 User-Friendly Dashboard Interface:** Interact with low-level network recon data through a gorgeous, reactive, React-based frontend filled with dynamic data charts.
* **🎛️ Customizable Evasion Profiles:** Configure scans with various runtime tactical options, including target network parameters and advanced firewall evasion techniques.

---

## 🛠️ Tech Stack & Architecture Matrix

### ⚙️ Backend Engine
* **🟢 Runtime:** Node.js
* **🚀 Framework:** Express.js
* **🛡️ Recon & Isolation:** Nmap | Tor Daemon | Proxychains4

### 🎨 Frontend UI Matrix
* **⚡ Environment:** Vite
* **⚛️ Library:** React
* **📈 Visuals:** ChartJS
* **✨ Iconography:** Lucide Icons

### 📦 Hard Core Dependencies
* **📂 Backend:** `express` | `cors` | `shlex` | `child_process`
* **💻 Frontend:** `react` | `chart.js` | `react-chartjs-2` | `lucide-react` | `vite`

---

## 📦 Installation & Setup

To install the project locally, follow these streamlined steps:

* **🐙 1. Clone the repository:**
  ```bash
  git clone [https://github.com/your-repo/aegisview-recon.git](https://github.com/your-repo/aegisview-recon.git)
📂 2. Set up the Backend Dependencies:

Bash
cd backend
npm install
💻 3. Set up the Frontend Application:

Bash
cd ../frontend
npm install
🏗️ 4. Compile the UI Build:

Bash
npm run build
💻 Usage & Execution Runtime
To spin up the ecosystem and start auditing, follow these deployment steps:

🐳 1. Build and Run the Core Subprocess Engine (Recommended):

Bash
cd backend
docker build -t aegisview-core .
docker run -d -p 8000:8000 --name aegisview-engine aegisview-core
⚡ 2. Start the Frontend Development Server:

Bash
cd ../frontend
npm run dev
🌐 3. Access the Live Control Console:
Open your browser and navigate straight to: http://localhost:5173

📂 Project Structure Mapping
Plaintext
aegisview-network-recon/
├── ⚙️ backend/
│   ├── 🐳 Dockerfile
│   ├── 📦 package.json
│   └── 📂 src/
│       ├── 🚀 main.js
│       ├── 🛣️ api/
│       │   └── 📄 routes.js
│       ├── 🛡️ core/
│       │   └── 📄 scanner.js
│       └── 🛠️ utils/
│           └── 📄 parser.js
└── 🎨 frontend/
    ├── 📦 package.json
    ├── ⚙️ vite.config.js
    └── 📂 src/
        ├── 🚀 main.jsx
        ├── 📄 App.jsx
        └── 🎨 index.css
        



🤝 Contributing Framework
To contribute to the project, please submit a pull request with your tactical changes. 
Ensure that your code is well-documented, maintains strict input sanitization to block command injections, and strictly follows the project's coding standards.

📝 Open-Source License
The AegisView Network Reconnaissance Project is licensed under the clean MIT License.

📬 Contact Hub
For any core architectural questions, infrastructure inquiries, or concerns, please contact the developer crew at: natsuolin@proton.me

💖 Acknowledgments & Community Thanks
We would like to extend our deepest thanks to all contributors, ethical hackers, and users of the AegisView Network Reconnaissance Project. 
This tool is made fully possible by the amazing open-source cybersecurity community and the ongoing support of our users.
