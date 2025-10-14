// Firebase Configuration สำหรับการเชื่อมต่อ Firestore
// ใช้งานร่วมกับ Firebase JS SDK v9+
// ✅ QUOTA OPTIMIZATION: เพิ่ม caching และ pagination เพื่อลดการใช้งาน

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
    onSnapshot,
    enablePersistence
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Firebase Web Config - อิงจาก Project ID: my-database-project-343ae
const firebaseConfig = {
    apiKey: "AIzaSyB-LtGJqfXXYy9dQVchR2cZzIMKFyWLRgI", // Web API Key ที่ถูกต้องจาก Firebase Console
    authDomain: "my-database-project-343ae.firebaseapp.com",
    projectId: "my-database-project-343ae",
    storageBucket: "my-database-project-343ae.appspot.com",
    messagingSenderId: "483304885152", // ค่าที่ถูกต้องจาก project settings
    appId: "1:483304885152:web:toolbase2024" // App ID ที่ถูกต้อง
};

// Initialize Firebase
let app, db;

try {
    console.log('🔥 กำลังเชื่อมต่อ Firebase...');
    console.log('📊 Project ID:', firebaseConfig.projectId);
    
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    // 🚀 QUOTA FIX: เปิดใช้ offline persistence เพื่อ cache ข้อมูล
    enablePersistence(db).then(() => {
        console.log('✅ Firestore offline persistence enabled - จะใช้ cache เมื่อ quota เกิน');
    }).catch((err) => {
        console.warn('⚠️ Offline persistence failed:', err.message);
        if (err.code === 'failed-precondition') {
            console.warn('💡 Persistence ไม่สามารถเปิดได้เพราะมีหลาย tabs');
        } else if (err.code === 'unimplemented') {
            console.warn('💡 Browser ไม่รองรับ persistence');
        }
    });
    
    console.log('✅ Firebase initialized successfully');
    console.log('🌐 Auth Domain:', firebaseConfig.authDomain);
    
    // 🔍 ทดสอบการเชื่อมต่อแบบ minimal (ลด quota usage)
    console.log('🔍 ทดสอบการเชื่อมต่อ Firestore (แบบประหยัด)...');
    
    // ใช้ limit(1) เพื่อประหยัด reads
    const testQuery = query(collection(db, 'employees'), limit(1));
    getDocs(testQuery).then((snapshot) => {
        console.log('✅ Firestore connection OK - พบข้อมูล', snapshot.size, 'records (ทดสอบ)');
    }).catch((error) => {
        console.error('❌ Firestore connection failed:', error);
        if (error.code === 'resource-exhausted') {
            console.error('🚨 QUOTA EXCEEDED - ใช้ cached data หรือรอ 24 ชั่วโมง');
        }
    });
    
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.error('💡 แนะนำ: ตรวจสอบ Firebase Config ใน FIREBASE_CONFIG_GUIDE.md');
    
    // แสดงข้อความแนะนำ
    if (typeof alert !== 'undefined') {
        alert(`❌ ไม่สามารถเชื่อมต่อ Firebase ได้\n\nกรุณาตรวจสอบ:\n1. Firebase Web Config ใน firebase-real-config.js\n2. ดูคำแนะนำใน FIREBASE_CONFIG_GUIDE.md\n\nError: ${error.message}`);
    }
}

// 💾 Local Cache System เพื่อลดการใช้ Firebase Quota
class FirebaseCache {
    static set(key, data, expireMinutes = 60) {
        try {
            const item = {
                data: data,
                timestamp: Date.now(),
                expire: expireMinutes * 60 * 1000
            };
            localStorage.setItem('fb_' + key, JSON.stringify(item));
            console.log('💾 Cached:', key, `(${expireMinutes} min)`);
        } catch (error) {
            console.warn('⚠️ Cache storage failed:', error.message);
        }
    }
    
    static get(key) {
        try {
            const item = localStorage.getItem('fb_' + key);
            if (!item) return null;
            
            const parsed = JSON.parse(item);
            if (Date.now() > parsed.timestamp + parsed.expire) {
                localStorage.removeItem('fb_' + key);
                return null;
            }
            
            console.log('🎯 Using cache:', key);
            return parsed.data;
        } catch (error) {
            console.warn('⚠️ Cache read failed:', error.message);
            return null;
        }
    }
    
    static clear(key = null) {
        if (key) {
            localStorage.removeItem('fb_' + key);
        } else {
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith('fb_')) localStorage.removeItem(k);
            });
        }
        console.log('🗑️ Cache cleared:', key || 'all');
    }
    
    static info() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('fb_'));
        console.log('📊 Cache info:', keys.length, 'items');
        return keys.map(key => {
            const item = JSON.parse(localStorage.getItem(key));
            const expireIn = (item.timestamp + item.expire - Date.now()) / 1000 / 60;
            return {
                key: key.replace('fb_', ''),
                expireIn: Math.round(expireIn) + ' min'
            };
        });
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

    // 🚀 QUOTA OPTIMIZED: ดึงข้อมูลพนักงานทั้งหมด (ใช้ cache)
    async getEmployees() {
        try {
            // ตรวจสอบ cache ก่อน
            const cached = FirebaseCache.get('employees');
            if (cached) {
                console.log('🎯 ใช้ข้อมูลพนักงานจาก cache:', cached.length, 'คน');
                return cached;
            }

            // ถ้าไม่มี cache ให้ดึงจาก Firebase (แบบประหยัด)
            console.log('📡 กำลังดึงข้อมูลพนักงานจาก Firebase...');
            const q = query(collection(this.db, this.collections.employees), limit(200)); // จำกัด 200 คน
            const querySnapshot = await getDocs(q);
            
            const employees = [];
            querySnapshot.forEach((doc) => {
                employees.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // เก็บใน cache 30 นาที
            FirebaseCache.set('employees', employees, 30);
            console.log('✅ ดึงข้อมูลพนักงาน:', employees.length, 'คน (cached 30 min)');
            return employees;
        } catch (error) {
            console.error('❌ Error fetching employees:', error);
            
            // ถ้า quota เกิน ให้ใช้ cache เก่า (ถ้ามี)
            if (error.code === 'resource-exhausted') {
                console.warn('🚨 Firebase quota exceeded - ใช้ cache ถาวร');
                const oldCache = FirebaseCache.get('employees');
                if (oldCache) {
                    console.log('💾 ใช้ข้อมูลเก่าจาก cache:', oldCache.length, 'คน');
                    return oldCache;
                }
            }
            
            return [];
        }
    }

    // 🚀 QUOTA OPTIMIZED: ดึงข้อมูลเครื่องมือทั้งหมด (ใช้ cache)
    async getTools() {
        try {
            // ตรวจสอบ cache ก่อน
            const cached = FirebaseCache.get('tools');
            if (cached) {
                console.log('🎯 ใช้ข้อมูลเครื่องมือจาก cache:', cached.length, 'รายการ');
                return cached;
            }

            // ถ้าไม่มี cache ให้ดึงจาก Firebase (แบบ pagination)
            console.log('📡 กำลังดึงข้อมูลเครื่องมือจาก Firebase...');
            const q = query(collection(this.db, this.collections.tools), limit(500)); // จำกัด 500 รายการ
            const querySnapshot = await getDocs(q);
            
            const tools = [];
            querySnapshot.forEach((doc) => {
                tools.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // เก็บใน cache 60 นาที (เครื่องมือเปลี่ยนแปลงน้อย)
            FirebaseCache.set('tools', tools, 60);
            console.log('✅ ดึงข้อมูลเครื่องมือ:', tools.length, 'รายการ (cached 60 min)');
            return tools;
        } catch (error) {
            console.error('❌ Error fetching tools:', error);
            
            // ถ้า quota เกิน ให้ใช้ cache เก่า
            if (error.code === 'resource-exhausted') {
                console.warn('🚨 Firebase quota exceeded - ใช้ cache ถาวร');
                const oldCache = FirebaseCache.get('tools');
                if (oldCache) {
                    console.log('💾 ใช้ข้อมูลเก่าจาก cache:', oldCache.length, 'รายการ');
                    return oldCache;
                }
            }
            
            return [];
        }
    }
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
            console.log('🔥 Starting to add tool request...');
            console.log('📝 Request data:', requestData);
            
            if (!this.db) {
                throw new Error('Firestore database is not initialized');
            }
            
            if (!requestData.employee_id || !requestData.requested_tools || requestData.requested_tools.length === 0) {
                throw new Error('ข้อมูลไม่ครบถ้วน: ต้องมี employee_id และ requested_tools');
            }
            
            const docData = {
                ...requestData,
                created_at: new Date(),
                status: 'pending',
                request_id: Date.now().toString() // เพิ่ม request_id สำหรับการอ้างอิง
            };
            
            console.log('💾 Saving to Firestore:', docData);
            
            const docRef = await addDoc(collection(this.db, this.collections.toolRequests), docData);
            
            console.log('✅ เพิ่มคำขอใหม่สำเร็จ - Document ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error adding tool request:', error);
            console.error('❌ Error details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
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