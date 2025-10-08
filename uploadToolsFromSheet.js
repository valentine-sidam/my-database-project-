/**
 * uploadToolsFromSheet.js
 * อัปโหลดข้อมูลเครื่องมือจาก Google Sheet เข้า Firebase Firestore
 */

const { fetch } = require('undici');
const sheetConfig = require('./sheetConfig');

// ⚙️ ฟังก์ชันดึง CSV แล้วแปลงเป็น JSON
async function fetchToolsFromSheet() {
  const url = sheetConfig.getCsvUrl(sheetConfig.gids.toolsMaster);
  console.log(`🔗 กำลังดึงข้อมูลจาก: ${url}`);
  
  try {
    const response = await fetch(url);
    const csv = await response.text();

    const [headerLine, ...lines] = csv.split(/\r?\n/).filter(Boolean);
    const headers = headerLine.split(",").map(h => h.trim().replace(/"/g, ''));
    
    console.log(`📊 Headers ที่พบ: ${headers.join(", ")}`);
    
    const tools = lines.map((line, index) => {
      const values = line.split(",").map(v => v.trim().replace(/"/g, ''));
      const tool = {};
      
      headers.forEach((header, i) => {
        tool[header] = values[i] || "";
      });
      
      // สร้าง object ที่เหมาะสมสำหรับ Firestore
      return {
        id: (tool["Serial No."] || `tool_${index + 1}`).replace(/[^a-zA-Z0-9\-_.]/g, '_'),
        tool_name: tool["Tools"] || "",
        serial_no: tool["Serial No."] || "",
        old_code: tool["Old Code"] || "",
        unit: tool["Unit"] || "",
        status: tool["Status"] || "",
        location: tool["Location"] || "",
        latest_update_date: tool["Latest Update date"] || "",
        note: tool["Note"] || "",
        current_responsible: tool["ผู้รับผิดชอบปัจจุบัน"] || ""
      };
    });
    
    return tools;
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดในการดึงข้อมูล:`, error.message);
    return [];
  }
}

// 🔍 ฟังก์ชันแสดงตัวอย่างข้อมูล
async function previewTools() {
  console.log("🔄 กำลังดึงข้อมูลเครื่องมือจาก Google Sheet...\n");
  
  const tools = await fetchToolsFromSheet();
  
  if (tools.length === 0) {
    console.log("❌ ไม่พบข้อมูลเครื่องมือ");
    return;
  }
  
  console.log(`✅ พบข้อมูลเครื่องมือทั้งหมด: ${tools.length} รายการ\n`);
  
  // แสดงตัวอย่าง 3 รายการแรก
  console.log("📝 ตัวอย่างข้อมูล 3 รายการแรก:");
  tools.slice(0, 3).forEach((tool, index) => {
    console.log(`\n--- รายการที่ ${index + 1} ---`);
    console.log(`🔧 ชื่อเครื่องมือ: ${tool.tool_name}`);
    console.log(`🏷️  Serial No.: ${tool.serial_no}`);
    console.log(`📍 สถานที่: ${tool.location}`);
    console.log(`📊 สถานะ: ${tool.status}`);
  });
  
  // สถิติข้อมูล
  const statusCounts = {};
  const locationCounts = {};
  
  tools.forEach(tool => {
    statusCounts[tool.status] = (statusCounts[tool.status] || 0) + 1;
    locationCounts[tool.location] = (locationCounts[tool.location] || 0) + 1;
  });
  
  console.log("\n📊 สถิติสถานะเครื่องมือ:");
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`   ${status}: ${count} รายการ`);
  });
  
  console.log("\n📍 สถิติสถานที่:");
  Object.entries(locationCounts).slice(0, 5).forEach(([location, count]) => {
    console.log(`   ${location}: ${count} รายการ`);
  });
  
  return tools;
}

// 🚀 รันตัวอย่าง
if (require.main === module) {
  previewTools().then(() => {
    console.log("\n🎉 การแสดงตัวอย่างเสร็จสิ้น!");
  });
}

module.exports = { fetchToolsFromSheet, previewTools };