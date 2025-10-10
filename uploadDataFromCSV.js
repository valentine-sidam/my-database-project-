/**
 * uploadDataFromCSV.js
 * อัปโหลดข้อมูลจากไฟล์ CSV ทั้งหมดเข้า Firebase Firestore
 * ตามโครงสร้างที่วิเคราะห์แล้ว
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

// 📊 ฟังก์ชันอัปโหลดข้อมูลพนักงาน
async function uploadEmployees() {
    console.log('\n👥 กำลังอัปโหลดข้อมูลพนักงาน...');
    
    try {
        const employees = await readCSVFile('./ToolBase System - Employees.csv');
        console.log(`📈 พบข้อมูลพนักงาน: ${employees.length} คน`);
        
        if (!db) {
            console.log('⚠️  ไม่มี Firebase connection - แสดงข้อมูลตัวอย่างเท่านั้น');
            console.log('📝 ตัวอย่างข้อมูลที่จะอัปโหลด:');
            console.log(transformEmployee(employees[0]));
            return;
        }
        
        const batch = db.batch();
        let count = 0;
        
        for (const emp of employees) {
            const employeeData = transformEmployee(emp);
            const docRef = db.collection('employees').doc(employeeData.employee_id);
            batch.set(docRef, employeeData);
            count++;
            
            // Upload in batches of 500
            if (count % 500 === 0) {
                await batch.commit();
                console.log(`✅ อัปโหลดแล้ว ${count} คน`);
            }
        }
        
        // Upload remaining
        if (count % 500 !== 0) {
            await batch.commit();
        }
        
        console.log(`✅ อัปโหลดพนักงานเสร็จสิ้น: ${count} คน`);
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการอัปโหลดพนักงาน:', error.message);
    }
}

// 🔄 ฟังก์ชันแปลงข้อมูลพนักงาน
function transformEmployee(emp) {
    return {
        employee_id: emp['รหัสพนักงาน'] || '',
        first_name: emp['ชื่อไทย'] || '',
        last_name: emp['นามสกุลไทย'] || '',
        full_name: `${emp['ชื่อไทย'] || ''} ${emp['นามสกุลไทย'] || ''}`.trim(),
        section: emp['ชื่อส่วน'] || '', // ใช้สำหรับ Project auto-fill
        group: emp['ชื่อกลุ่ม'] || '',
        department: emp['ชื่อหน่วย'] || '',
        position: emp['ชื่อตำแหน่ง'] || ''
    };
}

// 🔧 ฟังก์ชันอัปโหลดข้อมูลเครื่องมือ
async function uploadTools() {
    console.log('\n🔧 กำลังอัปโหลดข้อมูลเครื่องมือ...');
    
    try {
        const tools = await readCSVFile('./web-app/ToolBase System - Summary.csv');
        console.log(`📈 พบข้อมูลเครื่องมือ: ${tools.length} รายการ`);
        
        if (!db) {
            console.log('⚠️  ไม่มี Firebase connection - แสดงข้อมูลตัวอย่างเท่านั้น');
            console.log('📝 ตัวอย่างข้อมูลที่จะอัปโหลด:');
            console.log(transformTool(tools[0]));
            return;
        }
        
        const batch = db.batch();
        let count = 0;
        
        for (const tool of tools) {
            const toolData = transformTool(tool);
            if (toolData.id) {
                const docRef = db.collection('tools').doc(toolData.id);
                batch.set(docRef, toolData);
                count++;
                
                // Upload in batches of 500
                if (count % 500 === 0) {
                    await batch.commit();
                    console.log(`✅ อัปโหลดแล้ว ${count} รายการ`);
                }
            }
        }
        
        // Upload remaining
        if (count % 500 !== 0) {
            await batch.commit();
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

// 💰 ฟังก์ชันสร้างข้อมูล Transactions จากเครื่องมือที่ใช้งานอยู่
async function createTransactions() {
    console.log('\n💰 กำลังสร้างข้อมูล Transactions...');
    
    try {
        const tools = await readCSVFile('./web-app/ToolBase System - Summary.csv');
        const employees = await readCSVFile('./ToolBase System - Employees.csv');
        
        // สร้าง Map ของพนักงานเพื่อความเร็ว
        const employeeMap = {};
        employees.forEach(emp => {
            const fullName = `${emp['ชื่อไทย']} ${emp['นามสกุลไทย']}`.trim();
            employeeMap[fullName] = emp;
        });
        
        // หาเครื่องมือที่มีผู้ใช้งาน
        const toolsInUse = tools.filter(tool => tool['User'] && tool['User'].trim());
        console.log(`📈 พบเครื่องมือที่ใช้งานอยู่: ${toolsInUse.length} รายการ`);
        
        if (!db) {
            console.log('⚠️  ไม่มี Firebase connection - แสดงข้อมูลตัวอย่างเท่านั้น');
            if (toolsInUse.length > 0) {
                console.log('📝 ตัวอย่างข้อมูล Transaction:');
                console.log(transformTransaction(toolsInUse[0], employeeMap));
            }
            return;
        }
        
        const batch = db.batch();
        let count = 0;
        
        for (const tool of toolsInUse) {
            const transactionData = transformTransaction(tool, employeeMap);
            if (transactionData) {
                const docRef = db.collection('transactions').doc(`TRANS_${Date.now()}_${count}`);
                batch.set(docRef, transactionData);
                count++;
                
                // Upload in batches of 500
                if (count % 500 === 0) {
                    await batch.commit();
                    console.log(`✅ สร้าง Transaction แล้ว ${count} รายการ`);
                }
            }
        }
        
        // Upload remaining
        if (count % 500 !== 0) {
            await batch.commit();
        }
        
        console.log(`✅ สร้าง Transactions เสร็จสิ้น: ${count} รายการ`);
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการสร้าง Transactions:', error.message);
    }
}

// 🔄 ฟังก์ชันแปลงข้อมูล Transaction
function transformTransaction(tool, employeeMap) {
    const userName = tool['User'];
    const employee = employeeMap[userName];
    
    if (!employee) {
        console.warn(`⚠️  ไม่พบพนักงาน: ${userName}`);
        return null;
    }
    
    // Clean old_code field
    const oldCodeField = Object.keys(tool).find(key => key.includes('Old_Code'));
    const oldCode = oldCodeField ? tool[oldCodeField] : '';
    
    return {
        transaction_id: `auto_generated`,
        timestamp: new Date().toISOString(),
        employee: {
            id: employee['รหัสพนักงาน'],
            name: userName
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
        additional_notes: `จำนวนวันที่เบิกไปแล้ว: ${tool['จำนวนวันที่เบิกไปแล้ว'] || ''}`
    };
}

// 🚀 MAIN - ฟังก์ชันหลัก
async function main() {
    console.log('🚀 เริ่มการอัปโหลดข้อมูลจากไฟล์ CSV...');
    console.log('📅 วันที่:', new Date().toLocaleDateString('th-TH'));
    
    try {
        // 1. อัปโหลดพนักงาน
        await uploadEmployees();
        
        // 2. อัปโหลดเครื่องมือ
        await uploadTools();
        
        // 3. สร้าง Transactions
        await createTransactions();
        
        console.log('\n🎉 การอัปโหลดข้อมูลเสร็จสิ้น!');
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
    }
    
    process.exit(0);
}

// เรียกใช้ฟังก์ชันหลัก
main();