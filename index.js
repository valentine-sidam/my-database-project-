// โหลดตัวแปรจากไฟล์ .env
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// สร้างการเชื่อมต่อฐานข้อมูล
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL database!');
});

// Route ทดสอบ
app.get('/', (req, res) => {
  res.send('Hello from GitHub Codespace + MySQL!');
});

// เริ่มเซิร์ฟเวอร์
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
