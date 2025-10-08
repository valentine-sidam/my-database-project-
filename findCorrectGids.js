/**
 * findCorrectGids.js
 * ค้นหา GID ที่ถูกต้องของแต่ละ Sheet
 */

const { fetch } = require('undici');

async function testGid(gid, name) {
  const sheetId = "1LFkaZSMJDC548v5GyNxp_hJxaog6NOocwPbwMFEveDg";
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    if (text.includes("<!DOCTYPE html>")) {
      console.log(`❌ ${name} (GID: ${gid}) - ไม่สามารถเข้าถึงได้`);
      return false;
    } else {
      const lines = text.split('\n').filter(line => line.trim());
      const firstLine = lines[0] || '';
      console.log(`✅ ${name} (GID: ${gid}) - พบข้อมูล ${lines.length} แถว`);
      console.log(`   📊 Header: ${firstLine.substring(0, 100)}...`);
      return true;
    }
  } catch (error) {
    console.log(`❌ ${name} (GID: ${gid}) - Error: ${error.message}`);
    return false;
  }
}

async function findGids() {
  console.log("🔍 ค้นหา GID ที่ถูกต้องของแต่ละ Sheet...\n");
  
  // ทดสอบ GID ต่างๆ รวมถึงเลขใหญ่ที่เป็นไปได้
  const testGids = [
    { gid: "0", name: "Sheet แรก (Tools Master)" },
    { gid: "1", name: "Sheet ที่ 2" },
    { gid: "2", name: "Sheet ที่ 3" }, 
    { gid: "3", name: "Sheet ที่ 4" },
    { gid: "4", name: "Sheet ที่ 5" },
    { gid: "1530691604", name: "Possible Employees" },
    { gid: "1909077600", name: "Possible Summary" },
    { gid: "374834688", name: "Possible Transactions" },
    { gid: "606091431", name: "Original Employees GID" },
    { gid: "893019832", name: "Original Tools GID" },
    { gid: "2027222961", name: "Original Transactions GID" },
  ];
  
  for (const test of testGids) {
    await testGid(test.gid, test.name);
    console.log("");
  }
}

findGids();