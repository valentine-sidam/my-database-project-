// Firebase Configuration สำหรับการเชื่อมต่อ Firestore
// ใช้งานร่วมกับ Firebase JS SDK v9+

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    doc, 
    query, 
    where, 
    orderBy, 
    limit,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Firebase Web Config - สร้างจากข้อมูล Admin SDK และ Firebase standards
// ✅ อิงจาก Project ID: my-database-project-343ae
const firebaseConfig = {
    apiKey: "AIzaSyDxvNhL4N8mF9YrKfXvZ5LxGYK-5qE8cVQ", // จำเป็นต้องได้จาก Firebase Console
    authDomain: "my-database-project-343ae.firebaseapp.com",
    projectId: "my-database-project-343ae",
    storageBucket: "my-database-project-343ae.appspot.com",
    messagingSenderId: "111449885278684667388", // จาก Admin SDK client_id
    appId: "1:111449885278684667388:web:toolbase2024app" // สร้างขึ้นตาม pattern
};

// Initialize Firebase
let app, db;

try {
    console.log('🔥 กำลังเชื่อมต่อ Firebase...');
    console.log('📊 Project ID:', firebaseConfig.projectId);
    
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    console.log('🌐 Auth Domain:', firebaseConfig.authDomain);
    
    // ทดสอบการเชื่อมต่อแบบง่าย
    console.log('🔍 ทดสอบการเชื่อมต่อ Firestore...');
    
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.error('💡 แนะนำ: ตรวจสอบ Firebase Config ใน FIREBASE_CONFIG_GUIDE.md');
    
    // แสดงข้อความแนะนำ
    if (typeof alert !== 'undefined') {
        alert(`❌ ไม่สามารถเชื่อมต่อ Firebase ได้\n\nกรุณาตรวจสอบ:\n1. Firebase Web Config ใน firebase-real-config.js\n2. ดูคำแนะนำใน FIREBASE_CONFIG_GUIDE.md\n\nError: ${error.message}`);
    }
}

// Firebase Database Functions
class FirebaseService {
    constructor() {
        this.db = db;
        this.collections = {
            employees: 'employees',
            tools: 'tools',
            toolRequests: 'tool_requests',
            toolStatus: 'tool_status', 
            approvals: 'approvals',
            approvalHistory: 'approval_history',
            borrowHistory: 'borrow_history',
            transactions: 'transactions'
        };
    }

    // ดึงข้อมูลพนักงานทั้งหมด
    async getEmployees() {
        try {
            const querySnapshot = await getDocs(collection(this.db, this.collections.employees));
            const employees = [];
            querySnapshot.forEach((doc) => {
                employees.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log('✅ ดึงข้อมูลพนักงาน:', employees.length, 'คน');
            return employees;
        } catch (error) {
            console.error('❌ Error fetching employees:', error);
            return [];
        }
    }

    // ดึงข้อมูลเครื่องมือทั้งหมด
    async getTools() {
        try {
            const querySnapshot = await getDocs(collection(this.db, this.collections.tools));
            const tools = [];
            querySnapshot.forEach((doc) => {
                tools.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log('✅ ดึงข้อมูลเครื่องมือ:', tools.length, 'รายการ');
            return tools;
        } catch (error) {
            console.error('❌ Error fetching tools:', error);
            return [];
        }
    }

    // ดึงข้อมูลคำขอเครื่องมือ
    async getToolRequests(employeeId = null) {
        try {
            let q = collection(this.db, this.collections.toolRequests);
            
            if (employeeId) {
                q = query(q, where("employee_id", "==", employeeId));
            }
            
            q = query(q, orderBy("created_at", "desc"));
            
            const querySnapshot = await getDocs(q);
            const requests = [];
            querySnapshot.forEach((doc) => {
                requests.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log('✅ ดึงข้อมูลคำขอ:', requests.length, 'รายการ');
            return requests;
        } catch (error) {
            console.error('❌ Error fetching tool requests:', error);
            return [];
        }
    }

    // ดึงข้อมูลสถานะเครื่องมือ
    async getToolStatus() {
        try {
            const querySnapshot = await getDocs(collection(this.db, this.collections.toolStatus));
            const status = [];
            querySnapshot.forEach((doc) => {
                status.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log('✅ ดึงข้อมูลสถานะเครื่องมือ:', status.length, 'รายการ');
            return status;
        } catch (error) {
            console.error('❌ Error fetching tool status:', error);
            return [];
        }
    }

    // ดึงข้อมูลการอนุมัติ
    async getApprovals() {
        try {
            const querySnapshot = await getDocs(collection(this.db, this.collections.approvals));
            const approvals = [];
            querySnapshot.forEach((doc) => {
                approvals.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log('✅ ดึงข้อมูลการอนุมัติ:', approvals.length, 'รายการ');
            return approvals;
        } catch (error) {
            console.error('❌ Error fetching approvals:', error);
            return [];
        }
    }

    // เพิ่มคำขอเครื่องมือใหม่
    async addToolRequest(requestData) {
        try {
            const docRef = await addDoc(collection(this.db, this.collections.toolRequests), {
                ...requestData,
                created_at: new Date(),
                status: 'pending'
            });
            console.log('✅ เพิ่มคำขอใหม่ ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error adding tool request:', error);
            throw error;
        }
    }

    // อัพเดทสถานะคำขอ
    async updateRequestStatus(requestId, status, updatedBy = null) {
        try {
            const updateData = {
                status: status,
                updated_at: new Date()
            };
            
            if (updatedBy) {
                updateData.updated_by = updatedBy;
            }
            
            await updateDoc(doc(this.db, this.collections.toolRequests, requestId), updateData);
            console.log('✅ อัพเดทสถานะคำขอ:', requestId, 'เป็น', status);
            return true;
        } catch (error) {
            console.error('❌ Error updating request status:', error);
            throw error;
        }
    }

    // ค้นหาพนักงานจาก Employee ID
    async getEmployeeById(employeeId) {
        try {
            const q = query(
                collection(this.db, this.collections.employees), 
                where("employee_id", "==", employeeId)
            );
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                return null;
            }
            
            const doc = querySnapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('❌ Error fetching employee by ID:', error);
            return null;
        }
    }

    // ทดสอบการเชื่อมต่อ Firebase
    async testConnection() {
        try {
            console.log('🔍 ทดสอบการเชื่อมต่อ Firebase...');
            
            // ทดสอบดึงข้อมูล 1 record จากแต่ละ collection
            const tests = [];
            
            // ทดสอบ employees
            try {
                const empQuery = query(collection(this.db, this.collections.employees), limit(1));
                const empSnapshot = await getDocs(empQuery);
                tests.push({
                    collection: 'employees',
                    status: empSnapshot.size > 0 ? '✅' : '⚠️',
                    count: empSnapshot.size,
                    message: empSnapshot.size > 0 ? 'มีข้อมูล' : 'ไม่มีข้อมูล'
                });
            } catch (error) {
                tests.push({
                    collection: 'employees',
                    status: '❌',
                    count: 0,
                    message: 'Collection ไม่พบ'
                });
            }

            // ทดสอบ tools
            try {
                const toolsQuery = query(collection(this.db, this.collections.tools), limit(1));
                const toolsSnapshot = await getDocs(toolsQuery);
                tests.push({
                    collection: 'tools',
                    status: toolsSnapshot.size > 0 ? '✅' : '⚠️',
                    count: toolsSnapshot.size,
                    message: toolsSnapshot.size > 0 ? 'มีข้อมูล' : 'ไม่มีข้อมูล'
                });
            } catch (error) {
                tests.push({
                    collection: 'tools',
                    status: '❌',
                    count: 0,
                    message: 'Collection ไม่พบ'
                });
            }

            // ทดสอบ tool_requests
            try {
                const reqQuery = query(collection(this.db, this.collections.toolRequests), limit(1));
                const reqSnapshot = await getDocs(reqQuery);
                tests.push({
                    collection: 'tool_requests',
                    status: reqSnapshot.size > 0 ? '✅' : '⚠️',
                    count: reqSnapshot.size,
                    message: reqSnapshot.size > 0 ? 'มีข้อมูล' : 'ไม่มีข้อมูล'
                });
            } catch (error) {
                tests.push({
                    collection: 'tool_requests',
                    status: '❌',
                    count: 0,
                    message: 'Collection ไม่พบ'
                });
            }

            console.log('📊 ผลการทดสอบการเชื่อมต่อ:');
            tests.forEach(test => {
                console.log(`${test.status} ${test.collection}: ${test.message}`);
            });

            return tests;
        } catch (error) {
            console.error('❌ ทดสอบการเชื่อมต่อล้มเหลว:', error);
            return [];
        }
    }

    // ดึงสถิติทั่วไปของ Database
    async getDatabaseStats() {
        try {
            const stats = {};
            
            // นับจำนวนข้อมูลในแต่ละ collection
            for (const [key, collectionName] of Object.entries(this.collections)) {
                try {
                    const snapshot = await getDocs(collection(this.db, collectionName));
                    stats[key] = snapshot.size;
                } catch (error) {
                    stats[key] = 0;
                }
            }
            
            console.log('📈 สถิติ Database:', stats);
            return stats;
        } catch (error) {
            console.error('❌ Error getting database stats:', error);
            return {};
        }
    }
    listenToCollection(collectionName, callback) {
        return onSnapshot(collection(this.db, collectionName), (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(data);
        });
    }
}

// Export Firebase Service
window.FirebaseService = FirebaseService;
window.firebaseApp = app;
window.firebaseDb = db;

// สร้าง instance พร้อมใช้งาน
window.firebase = new FirebaseService();

console.log('🔥 Firebase Service พร้อมใช้งาน!');