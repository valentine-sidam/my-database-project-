/**
 * testSheetConnection.js
 * ทดสอบการดึงข้อมูลจาก Google Sheet โดยไม่ต้องอัปโหลดเข้า Firebase
 */

// ใช้ built-in fetch ใน Node.js 18+
const { fetch } = require('undici');
const sheetConfig = require("./sheetConfig");

// ⚙️ ฟังก์ชันดึง CSV แล้วแปลงเป็น JSON
async function fetchSheet(gid) {
  const url = sheetConfig.getCsvUrl(gid);
  console.log(`🔗 กำลังดึงข้อมูลจาก: ${url}`);
  
  try {
    const res = await fetch(url);
    const csv = await res.text();

    const [headerLine, ...lines] = csv.split(/\r?\n/).filter(Boolean);
    const headers = headerLine.split(",").map(h => h.trim().replace(/"/g, ''));
    
    const data = lines.map(line => {
      const values = line.split(",").map(v => v.trim().replace(/"/g, ''));
      const obj = {};
      headers.forEach((h, i) => obj[h] = values[i] || "");
      return obj;
    });
    
    return { headers, data };
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดในการดึงข้อมูล GID ${gid}:`, error.message);
    return { headers: [], data: [] };
  }
}

// 🚀 MAIN - ทดสอบการดึงข้อมูล
(async () => {
  console.log("🔄 ทดสอบการดึงข้อมูลจาก Google Sheet...\n");

  // ทดสอบ Employees
  console.log("👥 ทดสอบ Sheet: Employees");
  const employeesResult = await fetchSheet(sheetConfig.gids.employees);
  console.log(`📊 Headers: ${employeesResult.headers.join(", ")}`);
  console.log(`📈 จำนวนแถว: ${employeesResult.data.length}`);
  if (employeesResult.data.length > 0) {
    console.log(`📝 ตัวอย่างข้อมูลแถวแรก:`, employeesResult.data[0]);
  }
  console.log("");

  // ทดสอบ Tools Master
  console.log("🔧 ทดสอบ Sheet: Tools Master");
  const toolsResult = await fetchSheet(sheetConfig.gids.toolsMaster);
  console.log(`📊 Headers: ${toolsResult.headers.join(", ")}`);
  console.log(`📈 จำนวนแถว: ${toolsResult.data.length}`);
  if (toolsResult.data.length > 0) {
    console.log(`📝 ตัวอย่างข้อมูลแถวแรก:`, toolsResult.data[0]);
  }
  console.log("");

  // ทดสอบ Transactions
  console.log("📋 ทดสอบ Sheet: Transactions Log");
  const transactionsResult = await fetchSheet(sheetConfig.gids.transactions);
  console.log(`📊 Headers: ${transactionsResult.headers.join(", ")}`);
  console.log(`📈 จำนวนแถว: ${transactionsResult.data.length}`);
  if (transactionsResult.data.length > 0) {
    console.log(`📝 ตัวอย่างข้อมูลแถวแรก:`, transactionsResult.data[0]);
  }

  console.log("\n🎉 การทดสอบเสร็จสิ้น!");
})();