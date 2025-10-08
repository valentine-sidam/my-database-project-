const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from web-app directory
app.use(express.static(path.join(__dirname, 'web-app')));

// Root route - แสดง Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-app', 'dashboard.html'));
});

// Serve tools request page
app.get('/tools-request', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-app', 'tools-request.html'));
});

// Serve tools track page (สำหรับธุรการสโตว์)
app.get('/tools-track', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-app', 'tools-track.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-app', 'admin.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server กำลังทำงานที่ http://localhost:${PORT}`);
    console.log(`📱 เปิด Tools Track App ได้แล้ว!`);
});