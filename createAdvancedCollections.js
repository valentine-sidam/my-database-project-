const admin = require('firebase-admin');
const serviceAccount = require('./my-database-project-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createCollections() {
    try {
        console.log('🏗️ สร้าง Collections ใหม่ใน Firebase...\n');

        // 1. Tool Requests Collection
        console.log('📝 สร้าง collection: tool_requests');
        await db.collection('tool_requests').doc('sample').set({
            request_id: 'REQ_20241008_001',
            employee_id: '100007',
            employee_name: 'กมลลาศ วิชัยโย',
            department: 'โครงการ',
            project_name: 'โครงการทดสอบ',
            tools: [
                {
                    tool_id: 'E.MJ.CON.010.031.011.0005',
                    tool_name: 'รอกสลิงไฟฟ้า ขนาด 1',
                    quantity: 1,
                    note: 'ใช้งานโครงการ'
                }
            ],
            status: 'pending', // pending, approved, rejected, returned
            request_date: new Date(),
            approved_by: null,
            approved_date: null,
            return_date: null,
            remarks: ''
        });

        // 2. Tool Status Collection  
        console.log('🔧 สร้าง collection: tool_status');
        await db.collection('tool_status').doc('sample').set({
            tool_id: 'E.MJ.CON.010.031.011.0005',
            tool_name: 'รอกสลิงไฟฟ้า ขนาด 1',
            status: 'available', // available, borrowed, maintenance, damaged
            location: 'คลังเครื่องมือหลัก',
            last_updated: new Date(),
            borrowed_by: null,
            borrowed_date: null,
            expected_return: null
        });

        // 3. Approval History Collection
        console.log('📋 สร้าง collection: approval_history');
        await db.collection('approval_history').doc('sample').set({
            request_id: 'REQ_20241008_001',
            action: 'approved', // approved, rejected
            approved_by: 'ADMIN001',
            approver_name: 'ผู้จัดการคลัง',
            action_date: new Date(),
            remarks: 'อนุมัติใช้งานโครงการ'
        });

        // 4. Borrow History Collection
        console.log('📚 สร้าง collection: borrow_history');
        await db.collection('borrow_history').doc('sample').set({
            history_id: 'HIST_20241008_001',
            request_id: 'REQ_20241008_001',
            employee_id: '100007',
            employee_name: 'กมลลาศ วิชัยโย',
            tool_id: 'E.MJ.CON.010.031.011.0005',
            tool_name: 'รอกสลิงไฟฟ้า ขนาด 1',
            quantity: 1,
            borrow_date: new Date(),
            expected_return: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            actual_return: null,
            status: 'borrowed', // borrowed, returned, overdue
            condition_out: 'ดี',
            condition_in: null,
            remarks: 'ใช้งานโครงการ'
        });

        // 5. Settings Collection
        console.log('⚙️ สร้าง collection: settings');
        await db.collection('settings').doc('system').set({
            max_borrow_days: 30,
            approval_required: true,
            notification_before_due: 3, // days
            admin_emails: ['admin@company.com'],
            system_name: 'Tools Track System',
            version: '1.0.0'
        });

        console.log('\n✅ สร้าง Collections เสร็จสิ้น!');
        console.log('\n📊 Collections ที่สร้าง:');
        console.log('   • tool_requests - คำขอยืมเครื่องมือ');
        console.log('   • tool_status - สถานะเครื่องมือ');
        console.log('   • approval_history - ประวัติการอนุมัติ');
        console.log('   • borrow_history - ประวัติการยืม-คืน');
        console.log('   • settings - การตั้งค่าระบบ');

    } catch (error) {
        console.error('❌ Error creating collections:', error);
    }
    
    process.exit(0);
}

createCollections();