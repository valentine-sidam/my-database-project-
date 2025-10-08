/**
 * checkSheetAccess.js
 * ตรวจสอบการเข้าถึง Google Sheet แบบ Public
 */

const { fetch } = require('undici');

async function checkPublicAccess() {
  const sheetId = "1LFkaZSMJDC548v5GyNxp_hJxaog6NOocwPbwMFEveDg";
  
  // ทดสอบ URL แบบ Public CSV export
  const testUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
  
  console.log("🔍 ตรวจสอบการเข้าถึง Google Sheet...");
  console.log(`🔗 URL: ${testUrl}`);
  
  try {
    const response = await fetch(testUrl);
    const text = await response.text();
    
    if (text.includes("<!DOCTYPE html>")) {
      console.log("❌ Sheet ไม่สามารถเข้าถึงได้แบบ Public");
      console.log("📝 วิธีแก้ไข:");
      console.log("1. เปิด Google Sheet: https://docs.google.com/spreadsheets/d/1LFkaZSMJDC548v5GyNxp_hJxaog6NOocwPbwMFEveDg/edit");
      console.log("2. คลิก 'Share' ที่มุมขวาบน");
      console.log("3. เปลี่ยนเป็น 'Anyone with the link' > 'Viewer'");
      console.log("4. คลิก 'Copy link' และ 'Done'");
      return false;
    } else {
      console.log("✅ Sheet สามารถเข้าถึงได้แบบ Public!");
      console.log(`📄 ตัวอย่างข้อมูล:\n${text.substring(0, 200)}...`);
      return true;
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error.message);
    return false;
  }
}

// รัน
checkPublicAccess();