/**
 * สร้างข้อมูลทดสอบเพิ่มเติมใน Firebase
 * เพื่อทดสอบระบบ Tools Request, Tools Track และ Admin
 */

const admin = require('firebase-admin');

// ตรวจสอบว่า Firebase Admin SDK เริ่มต้นแล้วหรือไม่
if (!admin.apps.length) {
    const serviceAccount = require('./my-database-project-firebase-adminsdk.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// ข้อมูลทดสอบเพิ่มเติม
const additionalTestData = {
    // คำขอทดสอบเพิ่มเติม
    toolRequests: [
        {
            id: 'test_request_001',
            employee_id: '100013',
            employee_name: 'อิทธิพล คำผงแดง',
            department: 'โครงการ',
            section: 'Sukhumvit 29 Hotel (HT-SKV29)',
            project: 'Sukhumvit 29 Hotel (HT-SKV29)',
            requested_tools: [
                {
                    tool_id: 'E.MJ.CON.010.031.011.0005',
                    tool_name: 'รอกสลิงไฟฟ้า ขนาด 1',
                    tool_code: 'E.MJ.CON.010.031.011.0005',
                    quantity: 1,
                    note: 'ใช้งานก่อสร้าง'
                }
            ],
            status: 'approved',
            created_at: new Date('2024-10-01'),
            approved_at: new Date('2024-10-02'),
            approved_by: 'ผู้จัดการโครงการ',
            test: true
        },
        {
            id: 'test_request_002',
            employee_id: '100007',
            employee_name: 'กมลลาศ วิชัยโย',
            department: 'โครงการ',
            section: 'PRANNOK-TADMAI (DH2)',
            project: 'PRANNOK-TADMAI (DH2)',
            requested_tools: [
                {
                    tool_id: 'E.MJ.CON.020.110.001.0001',
                    tool_name: 'เครื่องชั่งน้ำหนักดิจิตอลแบบแขวน',
                    tool_code: 'E.MJ.CON.020.110.001.0001',
                    quantity: 1,
                    note: 'ใช้วัดน้ำหนักวัสดุ'
                }
            ],
            status: 'completed',
            created_at: new Date('2024-09-25'),
            approved_at: new Date('2024-09-26'),
            completed_at: new Date('2024-09-30'),
            approved_by: 'ผู้จัดการโครงการ',
            test: true
        },
        {
            id: 'test_request_003',
            employee_id: '100015',
            employee_name: 'ปิยะ สุวรรณไตย',
            department: 'โครงการ',
            section: 'Image 49',
            project: 'Image 49',
            requested_tools: [
                {
                    tool_id: 'E.MJ.CON.010.031.011.0005',
                    tool_name: 'รอกสลิงไฟฟ้า ขนาด 1',
                    tool_code: 'E.MJ.CON.010.031.011.0005',
                    quantity: 2,
                    note: 'โครงการ Image 49'
                }
            ],
            status: 'rejected',
            created_at: new Date('2024-10-05'),
            rejected_at: new Date('2024-10-06'),
            rejected_by: 'ผู้จัดการโครงการ',
            rejected_reason: 'เครื่องมือไม่พร้อมใช้งาน ต้องซ่อมบำรุง',
            test: true
        }
    ]
};

async function createTestData() {
    console.log('🚀 สร้างข้อมูลทดสอบเพิ่มเติม...\n');
    
    try {
        // สร้างคำขอทดสอบ
        console.log('📋 สร้างคำขอทดสอบ...');
        const batch = db.batch();
        
        additionalTestData.toolRequests.forEach(request => {
            const docRef = db.collection('tool_requests').doc(request.id);
            batch.set(docRef, request, { merge: true });
        });
        
        await batch.commit();
        console.log(`✅ สร้างคำขอทดสอบ ${additionalTestData.toolRequests.length} รายการ`);
        
        // แสดงสรุป
        console.log('\n📊 สรุปข้อมูลทดสอบที่สร้าง:');
        additionalTestData.toolRequests.forEach((request, index) => {
            console.log(`${index + 1}. ${request.id}`);
            console.log(`   ผู้ขอ: ${request.employee_name}`);
            console.log(`   สถานะ: ${request.status}`);
            console.log(`   เครื่องมือ: ${request.requested_tools[0].tool_name}`);
            console.log('');
        });
        
        // ตรวจสอบข้อมูลทั้งหมดใน tool_requests
        const requestsRef = db.collection('tool_requests');
        const allRequests = await requestsRef.get();
        console.log(`📈 รวมคำขอทั้งหมดใน Firebase: ${allRequests.size} รายการ`);
        
        // แยกข้อมูลตามสถานะ
        const statusCount = {};
        allRequests.docs.forEach(doc => {
            const status = doc.data().status || 'unknown';
            statusCount[status] = (statusCount[status] || 0) + 1;
        });
        
        console.log('\n📊 จำนวนคำขอตามสถานะ:');
        Object.entries(statusCount).forEach(([status, count]) => {
            console.log(`   ${status}: ${count} รายการ`);
        });
        
        console.log('\n✅ สร้างข้อมูลทดสอบเสร็จสิ้น!');
        console.log('🎯 ตอนนี้สามารถทดสอบระบบทั้ง 3 ตัวได้แล้ว:');
        console.log('   - Tools Request System');
        console.log('   - Tools Track System');
        console.log('   - Admin Management System');
        
    } catch (error) {
        console.error('❌ Error creating test data:', error);
    }
    
    process.exit(0);
}

// เริ่มสร้างข้อมูลทดสอบ
createTestData();