/**
 * uploadDataFromCSV_Fixed.js
 * อัปโหลดข้อมูลจากไฟล์ CSV ทั้งหมดเข้า Firebase Firestore (เวอร์ชันแก้ไข)
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

// 🔍 ฟังก์ชันอ่านไฟล์ CSV
function readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

// 🔧 ฟังก์ชันอัปโหลดข้อมูลเครื่องมือ (แก้ไข)
async function uploadToolsFixed() {
    console.log('\n🔧 กำลังอัปโหลดข้อมูลเครื่องมือ (เวอร์ชันแก้ไข)...');
    
    try {
        const tools = await readCSVFile('./web-app/ToolBase System - Summary.csv');
        console.log(`📈 พบข้อมูลเครื่องมือ: ${tools.length} รายการ`);
        
        if (!db) {
            console.log('⚠️  ไม่มี Firebase connection - แสดงข้อมูลตัวอย่างเท่านั้น');
            console.log('📝 ตัวอย่างข้อมูลที่จะอัปโหลด:');
            console.log(transformTool(tools[0]));
            return;
        }
        
        let count = 0;
        const batchSize = 500;
        
        for (let i = 0; i < tools.length; i += batchSize) {
            const batch = db.batch(); // สร้าง batch ใหม่ทุกครั้ง
            const slice = tools.slice(i, i + batchSize);
            
            for (const tool of slice) {
                const toolData = transformTool(tool);
                if (toolData.id) {
                    const docRef = db.collection('tools').doc(toolData.id);
                    batch.set(docRef, toolData);
                    count++;
                }
            }
            
            await batch.commit();
            console.log(`✅ อัปโหลดแล้ว ${count} รายการ`);
        }
        
        console.log(`✅ อัปโหลดเครื่องมือเสร็จสิ้น: ${count} รายการ`);
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการอัปโหลดเครื่องมือ:', error.message);
    }
}

// 🔄 ฟังก์ชันแปลงข้อมูลเครื่องมือ
function transformTool(tool) {
    // Clean old_code field (มี \n ใน header)
    const oldCodeField = Object.keys(tool).find(key => key.includes('Old_Code'));
    const oldCode = oldCodeField ? tool[oldCodeField] : '';
    
    const serialNo = tool['Serial No.'] || '';
    const toolId = serialNo.replace(/[^a-zA-Z0-9\-_.]/g, '_') || `tool_${Date.now()}`;
    
    return {
        id: toolId,
        tool_name: tool['ชื่อเครื่องมือ'] || '',
        serial_no: serialNo,
        old_code: oldCode,
        unit: 'เครื่อง', // Fixed value
        status: tool['Status'] || '',
        location: tool['Project/Location'] || '',
        latest_update_date: tool['วันที่เครื่องมือถูกเบิก'] || '',
        note: '', // Empty as in original data
        current_responsible: tool['User'] || ''
    };
}

// 💰 ฟังก์ชันสร้างข้อมูล Transactions แบบปลอดภัย
async function createTransactionsSafe() {
    console.log('\n💰 กำลังสร้างข้อมูล Transactions...');
    
    try {
        const tools = await readCSVFile('./web-app/ToolBase System - Summary.csv');
        const employees = await readCSVFile('./ToolBase System - Employees.csv');
        
        // สร้าง Map ของพนักงานทั้งรหัสและชื่อ
        const employeeMap = {};
        const employeeByCode = {};
        
        employees.forEach(emp => {
            const fullName = `${emp['ชื่อไทย']} ${emp['นามสกุลไทย']}`.trim();
            const empCode = emp['รหัสพนักงาน'];
            employeeMap[fullName] = emp;
            employeeByCode[empCode] = emp;
        });
        
        // หาเครื่องมือที่มีผู้ใช้งาน
        const toolsInUse = tools.filter(tool => tool['User'] && tool['User'].trim());
        console.log(`📈 พบเครื่องมือที่ใช้งานอยู่: ${toolsInUse.length} รายการ`);
        
        // วิเคราะห์ผู้ใช้ที่ไม่พบในระบบ
        const missingUsers = new Set();
        const validTransactions = [];
        
        for (const tool of toolsInUse) {
            const userName = tool['User'];
            let employee = employeeMap[userName];
            
            // ลองค้นหาจากรหัสพนักงาน
            if (!employee) {
                const userCode = userName.split(' ')[0]; // ดึงรหัสพนักงานจากชื่อ
                employee = employeeByCode[userCode];
            }
            
            if (!employee) {
                missingUsers.add(userName);
            } else {
                const transactionData = transformTransactionSafe(tool, employee);
                if (transactionData) {
                    validTransactions.push(transactionData);
                }
            }
        }
        
        console.log(`⚠️  ผู้ใช้ที่ไม่พบในระบบ (${missingUsers.size} คน):`, [...missingUsers]);
        console.log(`✅ Transactions ที่สร้างได้: ${validTransactions.length} รายการ`);
        
        if (!db) {
            console.log('⚠️  ไม่มี Firebase connection - แสดงข้อมูลตัวอย่างเท่านั้น');
            if (validTransactions.length > 0) {
                console.log('📝 ตัวอย่างข้อมูล Transaction:');
                console.log(validTransactions[0]);
            }
            return;
        }
        
        // อัปโหลด Transactions
        let count = 0;
        const batchSize = 500;
        
        for (let i = 0; i < validTransactions.length; i += batchSize) {
            const batch = db.batch();
            const slice = validTransactions.slice(i, i + batchSize);
            
            for (const transactionData of slice) {
                const docRef = db.collection('transactions').doc(`TRANS_${Date.now()}_${count}`);
                batch.set(docRef, transactionData);
                count++;
            }
            
            await batch.commit();
            console.log(`✅ สร้าง Transaction แล้ว ${count} รายการ`);
        }
        
        console.log(`✅ สร้าง Transactions เสร็จสิ้น: ${count} รายการ`);
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการสร้าง Transactions:', error.message);
    }
}

// 🔄 ฟังก์ชันแปลงข้อมูล Transaction (ปลอดภัย)
function transformTransactionSafe(tool, employee) {
    const userName = tool['User'];
    
    // Clean old_code field
    const oldCodeField = Object.keys(tool).find(key => key.includes('Old_Code'));
    const oldCode = oldCodeField ? tool[oldCodeField] : '';
    
    return {
        transaction_id: `auto_generated`,
        timestamp: new Date().toISOString(),
        employee: {
            id: employee['รหัสพนักงาน'],
            name: `${employee['ชื่อไทย']} ${employee['นามสกุลไทย']}`.trim()
        },
        project: tool['Project/Location'] || '',
        status: 'เบิกเครื่องมือ',
        action_reason: 'รายเดือน',
        return_date: tool['วันครบกำหนดส่งคืน'] || '',
        tools: [
            {
                tool_name: tool['ชื่อเครื่องมือ'] || '',
                serial_no: tool['Serial No.'] || '',
                old_code: oldCode,
                amount: 1,
                unit: 'เครื่อง',
                note: `ใช้งานโครงการ ${tool['Project/Location'] || ''}`
            }
        ],
        additional_notes: `จำนวนวันที่เบิกไปแล้ว: ${tool['จำนวนวันที่เบิกไปแล้ว'] || ''} | ผู้ใช้ในระบบ: ${userName}`
    };
}

// 📊 ฟังก์ชันสร้างสรุปรายงาน
async function generateReport() {
    console.log('\n📊 สร้างสรุปรายงานการอัปโหลดข้อมูล...');
    
    try {
        const employees = await readCSVFile('./ToolBase System - Employees.csv');
        const tools = await readCSVFile('./web-app/ToolBase System - Summary.csv');
        
        console.log('\n=== สรุปข้อมูลที่อัปโหลด ===');
        console.log(`👥 พนักงานทั้งหมด: ${employees.length} คน`);
        console.log(`🔧 เครื่องมือทั้งหมด: ${tools.length} รายการ`);
        
        // วิเคราะห์สถานะเครื่องมือ
        const statusCount = {};
        tools.forEach(tool => {
            const status = tool['Status'] || 'ไม่ระบุ';
            statusCount[status] = (statusCount[status] || 0) + 1;
        });
        
        console.log('\n📊 สถานะเครื่องมือ:');
        Object.entries(statusCount).forEach(([status, count]) => {
            console.log(`   ${status}: ${count} รายการ`);
        });
        
        // วิเคราะห์หน่วยงาน
        const deptCount = {};
        employees.forEach(emp => {
            const dept = emp['ชื่อหน่วย'] || 'ไม่ระบุ';
            deptCount[dept] = (deptCount[dept] || 0) + 1;
        });
        
        console.log('\n🏢 พนักงานแยกตามหน่วยงาน:');
        Object.entries(deptCount).forEach(([dept, count]) => {
            console.log(`   ${dept}: ${count} คน`);
        });
        
        console.log('\n✅ การสร้างรายงานเสร็จสิ้น!');
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการสร้างรายงาน:', error.message);
    }
}

// 🚀 MAIN - ฟังก์ชันหลัก
async function main() {
    console.log('🚀 เริ่มการอัปโหลดข้อมูลจากไฟล์ CSV (เวอร์ชันแก้ไข)...');
    console.log('📅 วันที่:', new Date().toLocaleDateString('th-TH'));
    
    try {
        // 1. อัปโหลดเครื่องมือ (แก้ไขแล้ว)
        await uploadToolsFixed();
        
        // 2. สร้าง Transactions (ปลอดภัย)
        await createTransactionsSafe();
        
        // 3. สร้างรายงาน
        await generateReport();
        
        console.log('\n🎉 การอัปโหลดข้อมูลเสร็จสิ้น!');
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
    }
    
    process.exit(0);
}

// เรียกใช้ฟังก์ชันหลัก
main();