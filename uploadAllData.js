/**
 * uploadAllData.js
 * อัปโหลดข้อมูลทั้งหมดเข้า Firebase:
 * - ข้อมูลเครื่องมือจาก Google Sheet (6,635 รายการ)
 * - ข้อมูลพนักงานจาก CSV (206 คน)
 */

const { fetchToolsFromSheet } = require('./uploadToolsFromSheet');
const { readEmployeesFromCSV } = require('./uploadEmployeesFromCSV');

// ตรวจสอบว่ามีไฟล์ Firebase Admin SDK หรือไม่
let admin, db;
try {
  admin = require('firebase-admin');
  const serviceAccount = require('./my-database-project-firebase-adminsdk.json');
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  db = admin.firestore();
  console.log("✅ Firebase Admin SDK เชื่อมต่อสำเร็จ");
} catch (error) {
  console.log("⚠️  ไม่พบไฟล์ Firebase Admin SDK key");
  console.log("📝 ดาวน์โหลดจาก: Firebase Console > Project Settings > Service Accounts");
  db = null;
}

// 📤 อัปโหลดเครื่องมือแบบ Batch
async function uploadToolsBatch(tools, batchSize = 500) {
  if (!db) return false;
  
  console.log(`🔧 กำลังอัปโหลดเครื่องมือ ${tools.length} รายการ...`);
  
  let totalSuccess = 0;
  
  for (let i = 0; i < tools.length; i += batchSize) {
    const batch = db.batch();
    const batchTools = tools.slice(i, i + batchSize);
    
    batchTools.forEach(tool => {
      if (tool.serial_no) {
        // ทำความสะอาด serial_no สำหรับใช้เป็น document ID
        const cleanSerialNo = tool.serial_no.replace(/[^a-zA-Z0-9\-_.]/g, '_');
        const docRef = db.collection('tools').doc(cleanSerialNo);
        batch.set(docRef, tool, { merge: true });
      }
    });
    
    try {
      await batch.commit();
      totalSuccess += batchTools.length;
      console.log(`✅ Tools Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(tools.length/batchSize)}: อัปโหลด ${batchTools.length} รายการ`);
    } catch (error) {
      console.error(`❌ Tools Batch ${Math.floor(i/batchSize) + 1} ผิดพลาด: ${error.message}`);
    }
  }
  
  return totalSuccess;
}

// 👥 อัปโหลดพนักงานแบบ Batch
async function uploadEmployeesBatch(employees, batchSize = 100) {
  if (!db) return false;
  
  console.log(`👥 กำลังอัปโหลดพนักงาน ${employees.length} คน...`);
  
  let totalSuccess = 0;
  
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
      console.log(`✅ Employees Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(employees.length/batchSize)}: อัปโหลด ${batchEmployees.length} คน`);
    } catch (error) {
      console.error(`❌ Employees Batch ${Math.floor(i/batchSize) + 1} ผิดพลาด: ${error.message}`);
    }
  }
  
  return totalSuccess;
}

// 🚀 MAIN
async function main() {
  console.log("🎯 เริ่มกระบวนการอัปโหลดข้อมูลทั้งหมดเข้า Firebase...\n");
  
  let totalSuccess = 0;
  
  try {
    // 1. อัปโหลดข้อมูลเครื่องมือจาก Google Sheet
    console.log("🔄 ดึงข้อมูลเครื่องมือจาก Google Sheet...");
    const tools = await fetchToolsFromSheet();
    
    if (tools.length > 0) {
      console.log(`📦 พบเครื่องมือ ${tools.length} รายการ`);
      if (db) {
        const toolsUploaded = await uploadToolsBatch(tools);
        totalSuccess += toolsUploaded;
        console.log(`✅ อัปโหลดเครื่องมือสำเร็จ: ${toolsUploaded} รายการ\n`);
      }
    } else {
      console.log("❌ ไม่พบข้อมูลเครื่องมือ\n");
    }
    
    // 2. อัปโหลดข้อมูลพนักงานจาก CSV
    console.log("🔄 อ่านข้อมูลพนักงานจากไฟล์ CSV...");
    const employees = await readEmployeesFromCSV('ToolBase System - Employees.csv');
    
    if (employees.length > 0) {
      console.log(`👥 พบพนักงาน ${employees.length} คน`);
      if (db) {
        const employeesUploaded = await uploadEmployeesBatch(employees);
        totalSuccess += employeesUploaded;
        console.log(`✅ อัปโหลดพนักงานสำเร็จ: ${employeesUploaded} คน\n`);
      }
    } else {
      console.log("❌ ไม่พบข้อมูลพนักงาน\n");
    }
    
    // 3. สรุปผล
    if (db) {
      console.log("🎉 สรุปการอัปโหลด:");
      console.log(`✅ รวมทั้งหมด: ${totalSuccess} รายการ`);
      console.log(`🔧 เครื่องมือ: ${tools.length} รายการ`);
      console.log(`👥 พนักงาน: ${employees.length} คน`);
      console.log("\n🔗 ตรวจสอบข้อมูลได้ที่:");
      console.log("   - Firebase Console > Firestore Database");
      console.log("   - Collection: 'tools' และ 'employees'");
    } else {
      console.log("💡 เพื่ออัปโหลดข้อมูลจริง:");
      console.log("   1. ดาวน์โหลด Firebase Admin SDK key");
      console.log("   2. บันทึกเป็น 'my-database-project-firebase-adminsdk.json'");
      console.log("   3. รันคำสั่งนี้อีกครั้ง");
    }
    
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error.message);
  }
}

// รันเมื่อเรียกไฟล์โดยตรง
if (require.main === module) {
  main().catch(console.error);
}