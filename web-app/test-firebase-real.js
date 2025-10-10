// ทดสอบการเชื่อมต่อ Firebase จากฝั่ง Client-side
// ใช้ข้อมูลที่เรามีใน Firebase จริง

// Import Firebase แบบ ES6 modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc,
    query,
    where,
    orderBy,
    limit
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Firebase Config ที่ปรับปรุงแล้ว
const firebaseConfig = {
    apiKey: "AIzaSyDxvNhL4N8mF9YrKfXvZ5LxGYK-5qE8cVQ",
    authDomain: "my-database-project-343ae.firebaseapp.com", 
    projectId: "my-database-project-343ae",
    storageBucket: "my-database-project-343ae.appspot.com",
    messagingSenderId: "111449885278684667388",
    appId: "1:111449885278684667388:web:toolbase2024app"
};

console.log('🔥 กำลังทดสอบ Firebase Connection...');

let app, db;

try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase App initialized successfully');
    console.log('📊 Project ID:', firebaseConfig.projectId);
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
}

// ฟังก์ชันทดสอบการอ่านข้อมูล
async function testFirebaseConnection() {
    console.log('\n🔍 ทดสอบการอ่านข้อมูลจาก Firestore...');
    
    try {
        // ทดสอบอ่านข้อมูลพนักงาน
        console.log('👥 ทดสอบ employees collection...');
        const employeesRef = collection(db, 'employees');
        const employeesSnapshot = await getDocs(employeesRef);
        console.log(`✅ พบข้อมูลพนักงาน ${employeesSnapshot.size} รายการ`);
        
        // แสดงตัวอย่างข้อมูล
        employeesSnapshot.docs.slice(0, 3).forEach((doc, index) => {
            const data = doc.data();
            console.log(`  ${index + 1}. ${data.employee_id} - ${data.full_name}`);
        });
        
        // ทดสอบอ่านข้อมูลเครื่องมือ
        console.log('\n🔧 ทดสอบ tools collection...');
        const toolsRef = collection(db, 'tools');
        const toolsSnapshot = await getDocs(toolsRef);
        console.log(`✅ พบข้อมูลเครื่องมือ ${toolsSnapshot.size} รายการ`);
        
        // แสดงตัวอย่างข้อมูล
        toolsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
            const data = doc.data();
            console.log(`  ${index + 1}. ${data.tool_name || data.Tools} (${data.old_code || data['Old Code'] || 'ไม่ระบุรหัส'})`);
        });
        
        // ทดสอบอ่านข้อมูลคำขอ
        console.log('\n📋 ทดสอบ tool_requests collection...');
        const requestsRef = collection(db, 'tool_requests');
        const requestsSnapshot = await getDocs(requestsRef);
        console.log(`✅ พบข้อมูลคำขอ ${requestsSnapshot.size} รายการ`);
        
        if (requestsSnapshot.size > 0) {
            requestsSnapshot.docs.forEach((doc, index) => {
                const data = doc.data();
                console.log(`  ${index + 1}. ${doc.id} - ผู้ขอ: ${data.employee_name} (สถานะ: ${data.status})`);
            });
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ ทดสอบการอ่านข้อมูลล้มเหลว:', error);
        
        // วิเคราะห์ error
        if (error.code === 'permission-denied') {
            console.error('🔒 Permission Denied: ตรวจสอบ Firestore Rules');
        } else if (error.code === 'unavailable') {
            console.error('🌐 Network Error: ตรวจสอบการเชื่อมต่อ internet');
        } else if (error.code === 'invalid-argument') {
            console.error('⚙️ Config Error: ตรวจสอบ Firebase Config');
        }
        
        return false;
    }
}

// ฟังก์ชันทดสอบการเขียนข้อมูล
async function testWriteData() {
    console.log('\n✏️ ทดสอบการเขียนข้อมูล...');
    
    try {
        const testRequest = {
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
                    note: 'ทดสอบระบบ'
                }
            ],
            status: 'pending',
            created_at: new Date(),
            test: true // flag สำหรับระบุว่าเป็น test data
        };
        
        const docRef = await addDoc(collection(db, 'tool_requests'), testRequest);
        console.log('✅ สร้าง test request สำเร็จ! Document ID:', docRef.id);
        
        return docRef.id;
        
    } catch (error) {
        console.error('❌ ทดสอบการเขียนข้อมูลล้มเหลว:', error);
        return null;
    }
}

// ฟังก์ชันหลักในการทดสอบ
async function runTests() {
    console.log('🚀 เริ่มการทดสอบระบบ Firebase\n');
    
    // ทดสอบการอ่านข้อมูล
    const readSuccess = await testFirebaseConnection();
    
    if (readSuccess) {
        console.log('\n✅ การทดสอบการอ่านข้อมูลสำเร็จ!');
        
        // ทดสอบการเขียนข้อมูล
        const writeResult = await testWriteData();
        
        if (writeResult) {
            console.log('\n🎉 ระบบ Firebase ทำงานได้ปกติ!');
            console.log('✅ สามารถอ่านและเขียนข้อมูลได้');
            console.log('🔗 สามารถใช้งานระบบทั้ง 3 ตัวได้แล้ว');
        } else {
            console.log('\n⚠️ ระบบสามารถอ่านข้อมูลได้ แต่ไม่สามารถเขียนข้อมูลได้');
            console.log('💡 แนะนำ: ตรวจสอบ Firestore Security Rules');
        }
    } else {
        console.log('\n❌ การทดสอบการอ่านข้อมูลล้มเหลว');
        console.log('💡 แนะนำ: ตรวจสอบ Firebase Config และ Network');
    }
}

// Export สำหรับการใช้งาน
window.testFirebase = {
    testConnection: testFirebaseConnection,
    testWrite: testWriteData,
    runAll: runTests,
    db: db,
    app: app
};

// รันทดสอบเมื่อโหลดเสร็จ
document.addEventListener('DOMContentLoaded', runTests);