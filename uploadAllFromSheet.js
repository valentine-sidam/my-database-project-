/**
 * uploadAllFromSheet.js
 * ดึงข้อมูลจาก Google Sheet: Toolbase System
 * แล้วอัปโหลดเข้า Firestore (employees, tools, transactions)
 */

const fetch = require("node-fetch");
const admin = require("firebase-admin");
const sheetConfig = require("./sheetConfig");

// ✅ แก้ชื่อไฟล์คีย์ Firebase ให้ตรงกับของคุณ
const serviceAccount = require("./my-database-project-firebase-adminsdk.json");

// ✅ ตั้งค่า Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// ✅ ตั้งค่า Sheet ID และ GID ของแต่ละแท็บ (ดูจาก URL)
const { sheetId, gids } = sheetConfig;

// ⚙️ ฟังก์ชันดึง CSV แล้วแปลงเป็น JSON
async function fetchSheet(gid) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const res = await fetch(url);
  const csv = await res.text();

  const [headerLine, ...lines] = csv.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(",").map(h => h.trim());
  return lines.map(line => {
    const values = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i] || "");
    return obj;
  });
}

// 🧠 Mapper: employees
function mapEmployee(row) {
  return {
    id: row["รหัสพนักงาน"] || row["employee_id"],
    first_name: row["ชื่อไทย"],
    last_name: row["นามสกุลไทย"],
    department: row["ชื่อฝ่าย"],
    division: row["ชื่อหน่วย"],
    position: row["ชื่อหน่วยงานย่อย"]
  };
}

// 🧱 Mapper: tools
function mapTool(row) {
  return {
    id: row["Serial No."] || row["serial_no"],
    tool_name: row["Tools"] || row["ชื่อเครื่องมือ"],
    old_code: row["Old Code"] || "",
    unit: row["Unit"] || "",
    status: row["Status"] || "",
    location: row["Location"] || row["Project/Location"] || "",
    latest_update: row["Latest Update date"] || ""
  };
}

// 🔄 Mapper: transactions
function mapTransaction(row) {
  return {
    transaction_id: row["Transaction ID"] || "",
    date: row["Date"] || "",
    serial_no: row["Serial No."] || "",
    employee_id: row["Employee ID"] || row["รหัสพนักงาน"] || "",
    status: row["Status"] || "",
    project: row["Project"] || "",
    note: row["Note"] || "",
    amount: row["Amount"] || "",
    unit: row["Unit"] || "",
    return_due: row["Return Due"] || "",
    actual_return_date: row["Actual Return Date"] || ""
  };
}

// 📤 Uploaders
async function uploadEmployees(rows) {
  let count = 0;
  for (const r of rows) {
    const e = mapEmployee(r);
    if (!e.id) continue;
    await db.collection("employees").doc(e.id).set(e, { merge: true });
    count++;
  }
  console.log(`✅ Uploaded ${count} employees`);
}

async function uploadTools(rows) {
  let count = 0;
  for (const r of rows) {
    const t = mapTool(r);
    if (!t.id) continue;
    await db.collection("tools").doc(t.id).set(t, { merge: true });
    count++;
  }
  console.log(`✅ Uploaded ${count} tools`);
}

async function uploadTransactions(rows) {
  let count = 0;
  for (const r of rows) {
    const t = mapTransaction(r);
    if (!t.serial_no) continue;

    const toolRef = db.collection("tools").doc(t.serial_no);
    await toolRef.collection("transactions").add(t);
    count++;
  }
  console.log(`✅ Uploaded ${count} transactions`);
}

// 🚀 MAIN
(async () => {
  console.log("🔄 ดึงข้อมูลจาก Google Sheet ...");

  const employees = await fetchSheet(gids.employees);
  const tools = await fetchSheet(gids.toolsMaster);
  const transactions = await fetchSheet(gids.transactions);

  console.log("📤 เริ่มอัปโหลดข้อมูลเข้าสู่ Firestore ...");

  await uploadEmployees(employees);
  await uploadTools(tools);
  await uploadTransactions(transactions);

  console.log("🎉 สำเร็จ: ข้อมูลทั้งหมดถูกอัปโหลดเข้าสู่ Firestore แล้ว!");
  process.exit(0);
})();

