/**
 * uploadToFirebase.js
 * อัปโหลดข้อมูลเครื่องมือจาก Google Sheet เข้า Firebase Firestore
 */

const { fetchToolsFromSheet } = require('./uploadToolsFromSheet');

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

// 📤 ฟังก์ชันอัปโหลดเครื่องมือเข้า Firestore
async function uploadToolsToFirestore(tools) {
  if (!db) {
    console.log("❌ ไม่สามารถเชื่อมต่อ Firebase ได้");
    return false;
  }
  
  console.log(`🚀 เริ่มอัปโหลดข้อมูลเครื่องมือ ${tools.length} รายการ...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // อัปโหลดทีละรายการ (สำหรับข้อมูลจำนวนมาก ควรใช้ batch writes)
  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    
    if (!tool.serial_no) {
      console.log(`⚠️  ข้ามรายการที่ ${i + 1}: ไม่มี Serial No.`);
      continue;
    }
    
    try {
      // อัปโหลดเข้า collection 'tools' โดยใช้ serial_no ที่ clean แล้วเป็น document ID
      const cleanSerialNo = tool.serial_no.replace(/[^a-zA-Z0-9\-_.]/g, '_');
      await db.collection('tools').doc(cleanSerialNo).set(tool, { merge: true });
      successCount++;
      
      if (successCount % 100 === 0) {
        console.log(`⏳ อัปโหลดแล้ว ${successCount} รายการ...`);
      }
    } catch (error) {
      console.error(`❌ เกิดข้อผิดพลาดรายการที่ ${i + 1}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n🎉 อัปโหลดเสร็จสิ้น!`);
  console.log(`✅ สำเร็จ: ${successCount} รายการ`);
  console.log(`❌ ผิดพลาด: ${errorCount} รายการ`);
  
  return true;
}

// 🔍 ฟังก์ชันอัปโหลดแบบ Batch (สำหรับข้อมูลจำนวนมาก)
async function uploadToolsBatch(tools, batchSize = 500) {
  if (!db) {
    console.log("❌ ไม่สามารถเชื่อมต่อ Firebase ได้");
    return false;
  }
  
  console.log(`🚀 เริ่มอัปโหลดข้อมูลแบบ Batch (${batchSize} รายการต่อ batch)`);
  
  let totalSuccess = 0;
  let totalError = 0;
  
  for (let i = 0; i < tools.length; i += batchSize) {
    const batch = db.batch();
    const batchTools = tools.slice(i, i + batchSize);
    
    batchTools.forEach(tool => {
      if (tool.serial_no) {
        const docRef = db.collection('tools').doc(tool.serial_no);
        batch.set(docRef, tool, { merge: true });
      }
    });
    
    try {
      await batch.commit();
      totalSuccess += batchTools.length;
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: อัปโหลด ${batchTools.length} รายการ`);
    } catch (error) {
      console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} ผิดพลาด: ${error.message}`);
      totalError += batchTools.length;
    }
  }
  
  console.log(`\n🎉 อัปโหลดทั้งหมดเสร็จสิ้น!`);
  console.log(`✅ สำเร็จ: ${totalSuccess} รายการ`);
  console.log(`❌ ผิดพลาด: ${totalError} รายการ`);
  
  return true;
}

// 🚀 MAIN
async function main() {
  console.log("🔄 เริ่มกระบวนการอัปโหลดข้อมูลเครื่องมือ...\n");
  
  // 1. ดึงข้อมูลจาก Google Sheet
  const tools = await fetchToolsFromSheet();
  
  if (tools.length === 0) {
    console.log("❌ ไม่พบข้อมูลเครื่องมือให้อัปโหลด");
    return;
  }
  
  console.log(`📦 พร้อมอัปโหลด ${tools.length} รายการ\n`);
  
  // 2. อัปโหลดเข้า Firebase
  if (db) {
    // ใช้ batch upload สำหรับข้อมูลจำนวนมาก
    await uploadToolsBatch(tools);
  } else {
    console.log("💡 หากต้องการอัปโหลดจริง กรุณาตั้งค่า Firebase Admin SDK key");
  }
}

// รันเมื่อเรียกไฟล์โดยตรง
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { uploadToolsToFirestore, uploadToolsBatch };