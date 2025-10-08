/**
 * uploadEmployeesFromCSV.js
 * อัปโหลดข้อมูลพนักงานจากไฟล์ CSV เข้า Firebase Firestore
 */

const fs = require('fs');
const csv = require('csv-parser');

// ตรวจสอบว่ามีไฟล์ Firebase Admin SDK หรือไม่
let admin, db;
try {
  admin = require('firebase-admin');
  const serviceAccount = require('./my-database-project-firebase-adminsdk.json');
  
  // เริ่มต้น Firebase (ตรวจสอบว่าเริ่มต้นแล้วหรือยัง)
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  db = admin.firestore();
  console.log("✅ Firebase Admin SDK เชื่อมต่อสำเร็จ");
} catch (error) {
  console.log("⚠️  ไม่พบไฟล์ Firebase Admin SDK key");
  console.log("📝 กรุณาสร้างไฟล์ 'my-database-project-firebase-adminsdk.json'");
  console.log("   จาก Firebase Console > Project Settings > Service Accounts");
  db = null;
}

// 📖 ฟังก์ชันอ่านข้อมูลจากไฟล์ CSV
function readEmployeesFromCSV(filename) {
  return new Promise((resolve, reject) => {
    const employees = [];
    
    fs.createReadStream(filename)
      .pipe(csv())
      .on('data', (row) => {
        // แปลงข้อมูลให้เหมาะสมกับ Firestore
        const employee = {
          employee_id: row['รหัสพนักงาน'] || '',
          first_name: row['ชื่อไทย'] || '',
          last_name: row['นามสกุลไทย'] || '',
          section: row['ชื่อส่วน'] || '',
          group: row['ชื่อกลุ่ม'] || '',
          department: row['ชื่อหน่วย'] || '',
          position: row['ชื่อตำแหน่ง'] || '',
          full_name: `${row['ชื่อไทย'] || ''} ${row['นามสกุลไทย'] || ''}`.trim()
        };
        
        // เพิ่มเฉพาะที่มี employee_id
        if (employee.employee_id) {
          employees.push(employee);
        }
      })
      .on('end', () => {
        console.log(`📄 อ่านข้อมูลพนักงานได้ทั้งหมด ${employees.length} คน`);
        resolve(employees);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// 📤 ฟังก์ชันอัปโหลดพนักงานเข้า Firestore
async function uploadEmployeesToFirestore(employees) {
  if (!db) {
    console.log("❌ ไม่สามารถเชื่อมต่อ Firebase ได้");
    return false;
  }
  
  console.log(`🚀 เริ่มอัปโหลดข้อมูลพนักงาน ${employees.length} คน...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i];
    
    try {
      // อัปโหลดเข้า collection 'employees' โดยใช้ employee_id เป็น document ID
      await db.collection('employees').doc(employee.employee_id).set(employee, { merge: true });
      successCount++;
      
      if (successCount % 50 === 0) {
        console.log(`⏳ อัปโหลดแล้ว ${successCount} คน...`);
      }
    } catch (error) {
      console.error(`❌ เกิดข้อผิดพลาดคนที่ ${i + 1} (${employee.employee_id}): ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n🎉 อัปโหลดเสร็จสิ้น!`);
  console.log(`✅ สำเร็จ: ${successCount} คน`);
  console.log(`❌ ผิดพลาด: ${errorCount} คน`);
  
  return true;
}

// 🔍 ฟังก์ชันอัปโหลดแบบ Batch สำหรับข้อมูลจำนวนมาก
async function uploadEmployeesBatch(employees, batchSize = 500) {
  if (!db) {
    console.log("❌ ไม่สามารถเชื่อมต่อ Firebase ได้");
    return false;
  }
  
  console.log(`🚀 เริ่มอัปโหลดข้อมูลแบบ Batch (${batchSize} คนต่อ batch)`);
  
  let totalSuccess = 0;
  let totalError = 0;
  
  for (let i = 0; i < employees.length; i += batchSize) {
    const batch = db.batch();
    const batchEmployees = employees.slice(i, i + batchSize);
    
    batchEmployees.forEach(employee => {
      if (employee.employee_id) {
        const docRef = db.collection('employees').doc(employee.employee_id);
        batch.set(docRef, employee, { merge: true });
      }
    });
    
    try {
      await batch.commit();
      totalSuccess += batchEmployees.length;
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: อัปโหลด ${batchEmployees.length} คน`);
    } catch (error) {
      console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} ผิดพลาด: ${error.message}`);
      totalError += batchEmployees.length;
    }
  }
  
  console.log(`\n🎉 อัปโหลดทั้งหมดเสร็จสิ้น!`);
  console.log(`✅ สำเร็จ: ${totalSuccess} คน`);
  console.log(`❌ ผิดพลาด: ${totalError} คน`);
  
  return true;
}

// 🔍 ฟังก์ชันแสดงตัวอย่างข้อมูล
async function previewEmployees(filename) {
  console.log("🔄 กำลังอ่านข้อมูลพนักงานจากไฟล์ CSV...\n");
  
  try {
    const employees = await readEmployeesFromCSV(filename);
    
    if (employees.length === 0) {
      console.log("❌ ไม่พบข้อมูลพนักงาน");
      return [];
    }
    
    console.log(`✅ พบข้อมูลพนักงานทั้งหมด: ${employees.length} คน\n`);
    
    // แสดงตัวอย่าง 5 คนแรก
    console.log("📝 ตัวอย่างข้อมูล 5 คนแรก:");
    employees.slice(0, 5).forEach((emp, index) => {
      console.log(`\n--- คนที่ ${index + 1} ---`);
      console.log(`🆔 รหัส: ${emp.employee_id}`);
      console.log(`👤 ชื่อ: ${emp.full_name}`);
      console.log(`🏢 หน่วย: ${emp.department}`);
      console.log(`💼 ตำแหน่ง: ${emp.position}`);
    });
    
    // สถิติข้อมูล
    const departmentCounts = {};
    const positionCounts = {};
    
    employees.forEach(emp => {
      departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
      positionCounts[emp.position] = (positionCounts[emp.position] || 0) + 1;
    });
    
    console.log("\n📊 สถิติตามหน่วยงาน:");
    Object.entries(departmentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([dept, count]) => {
        console.log(`   ${dept}: ${count} คน`);
      });
    
    console.log("\n💼 สถิติตามตำแหน่ง (Top 5):");
    Object.entries(positionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([pos, count]) => {
        console.log(`   ${pos}: ${count} คน`);
      });
    
    return employees;
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการอ่านไฟล์:", error.message);
    return [];
  }
}

// 🚀 MAIN
async function main() {
  const filename = 'ToolBase System - Employees.csv';
  
  console.log("🔄 เริ่มกระบวนการอัปโหลดข้อมูลพนักงาน...\n");
  
  // 1. แสดงตัวอย่างข้อมูล
  const employees = await previewEmployees(filename);
  
  if (employees.length === 0) {
    console.log("❌ ไม่พบข้อมูลพนักงานให้อัปโหลด");
    return;
  }
  
  console.log(`\n📦 พร้อมอัปโหลด ${employees.length} คน\n`);
  
  // 2. อัปโหลดเข้า Firebase
  if (db) {
    // ใช้ batch upload เนื่องจากข้อมูลไม่มาก
    await uploadEmployeesBatch(employees, 100);
  } else {
    console.log("💡 หากต้องการอัปโหลดจริง กรุณาตั้งค่า Firebase Admin SDK key");
    console.log("📝 วิธีการ:");
    console.log("   1. ไปที่ Firebase Console");
    console.log("   2. เลือก Project Settings > Service Accounts");
    console.log("   3. คลิก 'Generate new private key'");
    console.log("   4. บันทึกไฟล์เป็น 'my-database-project-firebase-adminsdk.json'");
  }
}

// รันเมื่อเรียกไฟล์โดยตรง
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { 
  readEmployeesFromCSV, 
  uploadEmployeesToFirestore, 
  uploadEmployeesBatch, 
  previewEmployees 
};