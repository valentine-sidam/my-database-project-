/**
 * analyzeAllData.js
 * วิเคราะห์ข้อมูลจากไฟล์ CSV ทั้งหมดและเปรียบเทียบกับ Firebase Collections
 */

const fs = require('fs');
const csv = require('csv-parser');

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

// 📊 ฟังก์ชันวิเคราะห์ข้อมูล
async function analyzeData() {
    try {
        console.log('🔍 กำลังวิเคราะห์ข้อมูลจากไฟล์ CSV ทั้งหมด...\n');

        // 1. อ่านข้อมูลพนักงาน
        console.log('👥 วิเคราะห์ข้อมูลพนักงาน (Employees)...');
        const employees = await readCSVFile('./ToolBase System - Employees.csv');
        console.log(`📈 จำนวนพนักงานทั้งหมด: ${employees.length} คน`);
        
        if (employees.length > 0) {
            console.log('📋 โครงสร้างข้อมูลพนักงาน:');
            console.log('   Fields:', Object.keys(employees[0]));
            console.log('📝 ตัวอย่างข้อมูล:', employees[0]);
            
            // วิเคราะห์หน่วยงาน
            const departments = [...new Set(employees.map(emp => emp['ชื่อหน่วย']))];
            console.log(`🏢 หน่วยงานทั้งหมด (${departments.length}):`, departments);
        }

        console.log('\n' + '='.repeat(60) + '\n');

        // 2. อ่านข้อมูล Summary (เป็นข้อมูลเครื่องมือแบบรายละเอียด)
        console.log('🔧 วิเคราะห์ข้อมูลสรุปเครื่องมือ (Summary)...');
        const summary = await readCSVFile('./web-app/ToolBase System - Summary.csv');
        console.log(`📈 จำนวนรายการเครื่องมือ: ${summary.length} รายการ`);
        
        if (summary.length > 0) {
            console.log('📋 โครงสร้างข้อมูลเครื่องมือ:');
            console.log('   Fields:', Object.keys(summary[0]));
            console.log('📝 ตัวอย่างข้อมูล:', summary[0]);
            
            // วิเคราะห์สถานะ
            const statuses = [...new Set(summary.map(item => item['Status']))];
            console.log(`📊 สถานะเครื่องมือทั้งหมด (${statuses.length}):`, statuses);
            
            // วิเคราะห์สถานที่
            const locations = [...new Set(summary.map(item => item['Project/Location']))].filter(loc => loc);
            console.log(`📍 สถานที่ทั้งหมด (${locations.length}):`, locations.slice(0, 10), '...');
            
            // วิเคราะห์เครื่องมือที่ใช้งานอยู่
            const inUse = summary.filter(item => item['User']);
            console.log(`🔄 เครื่องมือที่กำลังใช้งาน: ${inUse.length} รายการ`);
        }

        console.log('\n' + '='.repeat(60) + '\n');

        // 3. เปรียบเทียบกับ Firebase Collections
        console.log('🔥 เปรียบเทียบกับ Firebase Collections...\n');

        console.log('📊 การ Mapping ข้อมูล:');
        console.log('\n1. Collection: employees');
        console.log('   Source: ToolBase System - Employees.csv');
        console.log('   Fields Mapping:');
        console.log('   - รหัสพนักงาน → employee_id');
        console.log('   - ชื่อไทย → first_name');
        console.log('   - นามสกุลไทย → last_name');
        console.log('   - ชื่อส่วน → section (ใช้สำหรับ Project auto-fill)');
        console.log('   - ชื่อกลุ่ม → group');
        console.log('   - ชื่อหน่วย → department');
        console.log('   - ชื่อตำแหน่ง → position');
        console.log('   - [Generated] → full_name (ชื่อ + นามสกุล)');

        console.log('\n2. Collection: tools');
        console.log('   Source: ToolBase System - Summary.csv');
        console.log('   Fields Mapping:');
        console.log('   - ชื่อเครื่องมือ → tool_name');
        console.log('   - Serial No. → serial_no (also used as document ID)');
        console.log('   - Old_Code → old_code');
        console.log('   - Status → status');
        console.log('   - Project/Location → location');
        console.log('   - วันที่เครื่องมือถูกเบิก → latest_update_date');
        console.log('   - User → current_responsible');
        console.log('   - [Fixed] → unit (เครื่อง)');
        console.log('   - [Empty] → note');

        console.log('\n3. Collection: tool_requests (Generated from system usage)');
        console.log('   Source: User input through Tools Request System');
        console.log('   Fields:');
        console.log('   - request_id, employee_id, employee_name');
        console.log('   - department, project_name, tools[]');
        console.log('   - status, request_date, approved_by, etc.');

        console.log('\n4. Collection: transactions (Generated from approved requests)');
        console.log('   Source: Summary CSV + System-generated data');
        console.log('   Fields Mapping:');
        console.log('   - User → employee info');
        console.log('   - Project/Location → project');
        console.log('   - วันที่เครื่องมือถูกเบิก → transaction timestamp');
        console.log('   - วันครบกำหนดส่งคืน → return_date');
        console.log('   - สถานะการใช้งาน → status');

        console.log('\n' + '='.repeat(60) + '\n');

        // 4. สรุปสถิติ
        console.log('📈 สรุปสถิติข้อมูล:');
        console.log(`👥 พนักงานทั้งหมด: ${employees.length} คน`);
        console.log(`🔧 เครื่องมือทั้งหมด: ${summary.length} รายการ`);
        
        if (summary.length > 0) {
            const availableTools = summary.filter(item => item['Status'] === 'พร้อมใช้งาน').length;
            const inUseTools = summary.filter(item => item['User'] && item['User'].trim()).length;
            console.log(`✅ เครื่องมือพร้อมใช้งาน: ${availableTools} รายการ`);
            console.log(`🔄 เครื่องมือกำลังใช้งาน: ${inUseTools} รายการ`);
        }

        console.log('\n✅ การวิเคราะห์เสร็จสิ้น!');

    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
    }
}

// เรียกใช้ฟังก์ชัน
analyzeData();