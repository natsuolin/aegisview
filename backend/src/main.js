const express = require('express');
const cors = require('cors');
const path = require('path');
const scanRoutes = require(path.join(__dirname, 'api', 'routes'));

const app = express();

// Enable Cross-Origin Resource Sharing for the frontend dashboard
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// API Route Bindings
app.use('/api', scanRoutes);

// Health check endpoint to verify service status
app.get('/health', (req, res) => {
    return res.json({ status: "healthy", timestamp: new Date() });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🛡️ AegisView Core API successfully running on port ${PORT}`);
});