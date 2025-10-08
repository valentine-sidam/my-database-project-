// uploadEmployees.js
const fs = require('fs');
const csv = require('csv-parser');
const admin = require('firebase-admin');

// ✅ แก้ชื่อไฟล์ JSON key ให้ตรงกับของคุณ
const serviceAccount = require('./my-database-project-firebase-adminsdk.json');

// ✅ เริ่มต้น Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ✅ อ่านข้อมูลจากไฟล์ CSV
const results = [];
fs.createReadStream('ToolBase System - Employees.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    console.log(`📄 พบข้อมูลทั้งหมด ${results.length} แถว`);
    for (const emp of results) {
      const empId = emp['รหัสพนักงาน'] || emp['employee_id'];
      await db.collection('employees').doc(empId).set({
        first_name: emp['ชื่อไทย'],
        last_name: emp['นามสกุลไทย'],
        department: emp['ชื่อฝ่าย'],
        division: emp['ชื่อหน่วย'],
        position: emp['ชื่อหน่วยงานย่อย']
      });
      console.log(`✅ เพิ่มข้อมูลพนักงาน: ${empId}`);
    }
    console.log('🎉 อัปโหลดข้อมูลพนักงานทั้งหมดเสร็จสมบูรณ์!');
  });
