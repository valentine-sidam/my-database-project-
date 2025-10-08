/**
 * preview.js
 * แสดงตัวอย่างข้อมูลที่จะอัปโหลดทั้งหมด
 */

const { fetchToolsFromSheet } = require('./uploadToolsFromSheet');
const { readEmployeesFromCSV } = require('./uploadEmployeesFromCSV');

async function previewAllData() {
  console.log("📊 ตัวอย่างข้อมูลที่จะอัปโหลดเข้า Firebase\n");
  
  // 1. ข้อมูลเครื่องมือจาก Google Sheet
  console.log("🔧 กำลังดึงข้อมูลเครื่องมือจาก Google Sheet...");
  const tools = await fetchToolsFromSheet();
  
  if (tools.length > 0) {
    console.log(`✅ พบเครื่องมือ: ${tools.length} รายการ`);
    console.log("📝 ตัวอย่าง 3 รายการแรก:");
    tools.slice(0, 3).forEach((tool, i) => {
      console.log(`\n--- เครื่องมือที่ ${i + 1} ---`);
      console.log(`🔧 ชื่อ: ${tool.tool_name}`);
      console.log(`🏷️  Serial: ${tool.serial_no}`);
      console.log(`📍 สถานที่: ${tool.location}`);
      console.log(`📊 สถานะ: ${tool.status}`);
    });
  } else {
    console.log("❌ ไม่พบข้อมูลเครื่องมือ");
  }
  
  console.log("\n" + "=".repeat(50) + "\n");
  
  // 2. ข้อมูลพนักงานจาก CSV
  console.log("👥 กำลังอ่านข้อมูลพนักงานจาก CSV...");
  const employees = await readEmployeesFromCSV('ToolBase System - Employees.csv');
  
  if (employees.length > 0) {
    console.log(`✅ พบพนักงาน: ${employees.length} คน`);
    console.log("📝 ตัวอย่าง 3 คนแรก:");
    employees.slice(0, 3).forEach((emp, i) => {
      console.log(`\n--- พนักงานคนที่ ${i + 1} ---`);
      console.log(`🆔 รหัส: ${emp.employee_id}`);
      console.log(`👤 ชื่อ: ${emp.full_name}`);
      console.log(`🏢 หน่วย: ${emp.department}`);
      console.log(`💼 ตำแหน่ง: ${emp.position}`);
    });
  } else {
    console.log("❌ ไม่พบข้อมูลพนักงาน");
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("📊 สรุปข้อมูลที่จะอัปโหลด:");
  console.log(`🔧 เครื่องมือ: ${tools.length} รายการ`);
  console.log(`👥 พนักงาน: ${employees.length} คน`);
  console.log(`📦 รวมทั้งหมด: ${tools.length + employees.length} records`);
  
  console.log("\n🚀 พร้อมอัปโหลดเข้า Firebase แล้ว!");
  console.log("📝 ขั้นตอนต่อไป:");
  console.log("   1. ดาวน์โหลด Firebase Admin SDK key");
  console.log("   2. บันทึกเป็น 'my-database-project-firebase-adminsdk.json'");
  console.log("   3. รันคำสั่ง: node uploadAllData.js");
}

// รัน
previewAllData().catch(console.error);