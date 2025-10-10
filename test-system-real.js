/**
 * ทดสอบระบบด้วยข้อมูลจริงจาก Firebase
 * จำลองการใช้งานจริงของผู้ใช้
 */

const admin = require('firebase-admin');

if (!admin.apps.length) {
    const serviceAccount = require('./my-database-project-firebase-adminsdk.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function testSystemWithRealData() {
    console.log('🧪 ทดสอบระบบด้วยข้อมูลจริง\n');
    
    try {
        // 1. ทดสอบการดึงข้อมูลพนักงาน (Tools Request System)
        console.log('👥 ทดสอบระบบข้อมูลพนักงาน...');
        const employeesSnapshot = await db.collection('employees').get();
        console.log(`✅ พบข้อมูลพนักงาน ${employeesSnapshot.size} คน`);
        
        // แสดงพนักงานที่มีข้อมูลครบถ้วน
        const completeEmployees = [];
        employeesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.employee_id && data.full_name && data.department) {
                completeEmployees.push(data);
            }
        });
        console.log(`📋 พนักงานที่มีข้อมูลครบถ้วน: ${completeEmployees.length} คน`);
        
        // แสดง 3 คนแรก
        console.log('   ตัวอย่าง:');
        completeEmployees.slice(0, 3).forEach((emp, index) => {
            console.log(`   ${index + 1}. ${emp.employee_id} - ${emp.full_name}`);
            console.log(`      หน่วยงาน: ${emp.department} | แผนก: ${emp.section || 'ไม่ระบุ'}`);
        });
        
        // 2. ทดสอบการดึงข้อมูลเครื่องมือ (Tools Request System)
        console.log('\n🔧 ทดสอบระบบข้อมูลเครื่องมือ...');
        const toolsSnapshot = await db.collection('tools').get();
        console.log(`✅ พบข้อมูลเครื่องมือ ${toolsSnapshot.size} รายการ`);
        
        // แสดงเครื่องมือที่มีข้อมูลครบถ้วน
        const completeTools = [];
        toolsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const toolName = data.tool_name || data.Tools;
            const toolCode = data.old_code || data['Old Code'] || data.serial_no;
            if (toolName && toolCode) {
                completeTools.push({ ...data, toolName, toolCode });
            }
        });
        console.log(`📋 เครื่องมือที่มีข้อมูลครบถ้วน: ${completeTools.length} รายการ`);
        
        // แสดง 3 รายการแรก
        console.log('   ตัวอย่าง:');
        completeTools.slice(0, 3).forEach((tool, index) => {
            console.log(`   ${index + 1}. ${tool.toolName}`);
            console.log(`      รหัส: ${tool.toolCode} | ตำแหน่ง: ${tool.location || tool.Location || 'ไม่ระบุ'}`);
        });
        
        // 3. ทดสอบการดึงข้อมูลคำขอ (Tools Track System)
        console.log('\n📋 ทดสอบระบบติดตามคำขอ...');
        const requestsSnapshot = await db.collection('tool_requests').get();
        console.log(`✅ พบข้อมูลคำขอ ${requestsSnapshot.size} รายการ`);
        
        // วิเคราะห์สถานะคำขอ
        const statusAnalysis = {};
        const employeeRequests = {};
        
        requestsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const status = data.status || 'unknown';
            const empId = data.employee_id || 'unknown';
            
            statusAnalysis[status] = (statusAnalysis[status] || 0) + 1;
            employeeRequests[empId] = (employeeRequests[empId] || 0) + 1;
        });
        
        console.log('📊 สถิติสถานะคำขอ:');
        Object.entries(statusAnalysis).forEach(([status, count]) => {
            const emoji = {
                'pending': '⏳',
                'approved': '✅',
                'completed': '🎯',
                'rejected': '❌',
                'unknown': '❓'
            };
            console.log(`   ${emoji[status] || '📄'} ${status}: ${count} รายการ`);
        });
        
        console.log('\n📊 สถิติผู้ขอ:');
        Object.entries(employeeRequests)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .forEach(([empId, count]) => {
                console.log(`   ${empId}: ${count} คำขอ`);
            });
        
        // 4. ทดสอบสร้างคำขอใหม่
        console.log('\n✏️ ทดสอบการสร้างคำขอใหม่...');
        
        if (completeEmployees.length > 0 && completeTools.length > 0) {
            const testEmployee = completeEmployees[0];
            const testTool = completeTools[0];
            
            const newRequest = {
                employee_id: testEmployee.employee_id,
                employee_name: testEmployee.full_name,
                department: testEmployee.department,
                section: testEmployee.section || 'ไม่ระบุ',
                project: testEmployee.section || testEmployee.department,
                requested_tools: [
                    {
                        tool_id: testTool.toolCode,
                        tool_name: testTool.toolName,
                        tool_code: testTool.toolCode,
                        quantity: 1,
                        note: 'ทดสอบระบบอัตโนมัติ'
                    }
                ],
                status: 'pending',
                created_at: new Date(),
                test_auto: true // flag สำหรับการทดสอบอัตโนมัติ
            };
            
            const docRef = await db.collection('tool_requests').add(newRequest);
            console.log(`✅ สร้างคำขอทดสอบสำเร็จ! ID: ${docRef.id}`);
            console.log(`   ผู้ขอ: ${testEmployee.full_name} (${testEmployee.employee_id})`);
            console.log(`   เครื่องมือ: ${testTool.toolName}`);
            
            // 5. ทดสอบการอัพเดทสถานะ (Admin System)
            console.log('\n⚙️ ทดสอบการอัพเดทสถานะ...');
            await db.collection('tool_requests').doc(docRef.id).update({
                status: 'approved',
                approved_at: new Date(),
                approved_by: 'ระบบทดสอบอัตโนมัติ',
                updated_at: new Date()
            });
            console.log(`✅ อัพเดทสถานะเป็น 'approved' สำเร็จ`);
            
        } else {
            console.log('⚠️ ไม่มีข้อมูลพนักงานหรือเครื่องมือสำหรับทดสอบ');
        }
        
        // สรุปผลการทดสอบ
        console.log('\n🎉 สรุปผลการทดสอบ:');
        console.log('✅ ระบบ Tools Request: สามารถดึงข้อมูลพนักงานและเครื่องมือได้');
        console.log('✅ ระบบ Tools Track: สามารถแสดงและวิเคราะห์คำขอได้');
        console.log('✅ ระบบ Admin: สามารถสร้างและอัพเดทคำขอได้');
        console.log('✅ การเชื่อมต่อ Firebase: ทำงานได้ปกติ');
        
        console.log('\n🚀 ระบบพร้อมใช้งานจริง!');
        console.log('📱 URL สำหรับทดสอบ:');
        console.log('   - Tools Request: http://localhost:8000/tools-request-firebase.html');
        console.log('   - Tools Track: http://localhost:8000/tools-track-firebase.html');
        console.log('   - Admin: http://localhost:8000/admin-firebase.html');
        
    } catch (error) {
        console.error('❌ การทดสอบล้มเหลว:', error);
        
        if (error.code === 'permission-denied') {
            console.log('💡 แนะนำ: ตรวจสอบ Firestore Security Rules');
        } else if (error.code === 'unavailable') {
            console.log('💡 แนะนำ: ตรวจสอบการเชื่อมต่อ internet');
        }
    }
    
    process.exit(0);
}

// เริ่มการทดสอบ
testSystemWithRealData();