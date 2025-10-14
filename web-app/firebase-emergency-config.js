// 🔧 Firebase Emergency Configuration 
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

// Firebase Web Config
const firebaseConfig = {
    apiKey: "AIzaSyB-LtGJqfXXYy9dQVchR2cZzIMKFyWLRgI",
    authDomain: "my-database-project-343ae.firebaseapp.com",
    projectId: "my-database-project-343ae",
    storageBucket: "my-database-project-343ae.appspot.com",
    messagingSenderId: "483304885152",
    appId: "1:483304885152:web:toolbase2024"
};

// 💾 Emergency Cache System เพื่อลดการใช้ Firebase Quota
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
}

// Initialize Firebase with error handling
let app, db;

try {
    console.log('🔥 Initializing Firebase (Emergency Mode)...');
    
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    // เปิดใช้ offline persistence
    enablePersistence(db).then(() => {
        console.log('✅ Offline persistence enabled - ระบบจะใช้ cache เมื่อ quota เกิน');
    }).catch((err) => {
        console.warn('⚠️ Persistence warning:', err.code);
    });
    
    console.log('✅ Firebase ready (Emergency Mode)');
    
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    alert('❌ ไม่สามารถเชื่อมต่อ Firebase ได้\nกรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
}

// 🚀 Optimized Firebase Service สำหรับ Quota Emergency
class FirebaseService {
    constructor() {
        this.db = db;
        this.collections = {
            employees: 'employees',
            tools: 'tools',
            toolRequests: 'tool_requests',
            toolStatus: 'tool_status', 
            approvals: 'approvals',
            transactions: 'transactions'
        };
    }

    // 🚨 EMERGENCY MODE: ดึงข้อมูลพนักงาน (ใช้ cache เป็นหลัก)
    async getEmployees() {
        try {
            // ตรวจสอบ cache ก่อนเสมอ
            const cached = FirebaseCache.get('employees');
            if (cached) {
                console.log('🎯 ใช้ข้อมูลพนักงานจาก cache:', cached.length, 'คน');
                return cached;
            }

            // ถ้าไม่มี cache ให้ดึงจาก Firebase (แบบจำกัด)
            console.log('📡 ดึงข้อมูลพนักงานจาก Firebase (จำกัด 100 คน)...');
            const q = query(collection(this.db, this.collections.employees), limit(100));
            const querySnapshot = await getDocs(q);
            
            const employees = [];
            querySnapshot.forEach((doc) => {
                employees.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // เก็บใน cache 2 ชั่วโมง
            FirebaseCache.set('employees', employees, 120);
            console.log('✅ ดึงข้อมูลพนักงาน:', employees.length, 'คน (cached 2 hr)');
            return employees;
            
        } catch (error) {
            console.error('❌ Error fetching employees:', error);
            
            // ถ้า quota เกิน ให้ใช้ข้อมูลจาก cache (ไม่สนใจ expire)
            if (error.code === 'resource-exhausted') {
                console.warn('🚨 QUOTA EXCEEDED - ใช้ข้อมูลเก่าจาก cache');
                const oldData = localStorage.getItem('fb_employees');
                if (oldData) {
                    const parsed = JSON.parse(oldData);
                    console.log('💾 ใช้ข้อมูลเก่า:', parsed.data.length, 'คน');
                    return parsed.data;
                }
            }
            
            // ถ้าไม่มีข้อมูลเลย ให้ใช้ข้อมูลตัวอย่าง
            console.warn('⚠️ ใช้ข้อมูลตัวอย่าง');
            return this.getSampleEmployees();
        }
    }

    // 🚨 EMERGENCY MODE: ดึงข้อมูลเครื่องมือ (ใช้ cache เป็นหลัก)
    async getTools() {
        try {
            const cached = FirebaseCache.get('tools');
            if (cached) {
                console.log('🎯 ใช้ข้อมูลเครื่องมือจาก cache:', cached.length, 'รายการ');
                return cached;
            }

            console.log('📡 ดึงข้อมูลเครื่องมือจาก Firebase (จำกัด 200 รายการ)...');
            const q = query(collection(this.db, this.collections.tools), limit(200));
            const querySnapshot = await getDocs(q);
            
            const tools = [];
            querySnapshot.forEach((doc) => {
                tools.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            FirebaseCache.set('tools', tools, 180); // cache 3 ชั่วโมง
            console.log('✅ ดึงข้อมูลเครื่องมือ:', tools.length, 'รายการ (cached 3 hr)');
            return tools;
            
        } catch (error) {
            console.error('❌ Error fetching tools:', error);
            
            if (error.code === 'resource-exhausted') {
                console.warn('🚨 QUOTA EXCEEDED - ใช้ข้อมูลเก่าจาก cache');
                const oldData = localStorage.getItem('fb_tools');
                if (oldData) {
                    const parsed = JSON.parse(oldData);
                    console.log('💾 ใช้ข้อมูลเก่า:', parsed.data.length, 'รายการ');
                    return parsed.data;
                }
            }
            
            console.warn('⚠️ ใช้ข้อมูลตัวอย่าง');
            return this.getSampleTools();
        }
    }

    // 🚨 EMERGENCY MODE: ดึงคำขอเครื่องมือ (แบบจำกัด)
    async getToolRequests(employeeId = null) {
        try {
            const cacheKey = employeeId ? `requests_${employeeId}` : 'requests_all';
            const cached = FirebaseCache.get(cacheKey);
            if (cached) {
                console.log('🎯 ใช้คำขอจาก cache:', cached.length, 'รายการ');
                return cached;
            }

            console.log('📡 ดึงคำขอจาก Firebase (จำกัด 50 รายการ)...');
            let q = query(
                collection(this.db, this.collections.toolRequests),
                orderBy('request_date', 'desc'),
                limit(50)
            );

            if (employeeId) {
                q = query(
                    collection(this.db, this.collections.toolRequests),
                    where('employee_id', '==', employeeId),
                    orderBy('request_date', 'desc'),
                    limit(20)
                );
            }

            const querySnapshot = await getDocs(q);
            const requests = [];
            querySnapshot.forEach((doc) => {
                requests.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            FirebaseCache.set(cacheKey, requests, 15); // cache 15 นาที
            console.log('✅ ดึงคำขอ:', requests.length, 'รายการ');
            return requests;
            
        } catch (error) {
            console.error('❌ Error fetching requests:', error);
            
            if (error.code === 'resource-exhausted') {
                console.warn('🚨 QUOTA EXCEEDED - ไม่สามารถดึงคำขอใหม่ได้');
            }
            
            return [];
        }
    }

    // ค้นหาพนักงานจาก ID (ใช้ cache)
    async getEmployeeById(employeeId) {
        try {
            const employees = await this.getEmployees();
            return employees.find(emp => emp.employee_id === employeeId) || null;
        } catch (error) {
            console.error('❌ Error finding employee:', error);
            return null;
        }
    }

    // 🚨 EMERGENCY: เพิ่มคำขอใหม่ (ระวัง quota)
    async addToolRequest(requestData) {
        try {
            console.log('📝 กำลังเพิ่มคำขอใหม่...');
            const docRef = await addDoc(collection(this.db, this.collections.toolRequests), requestData);
            
            // ลบ cache requests เพื่อให้โหลดข้อมูลใหม่
            FirebaseCache.clear('requests_all');
            FirebaseCache.clear(`requests_${requestData.employee_id}`);
            
            console.log('✅ เพิ่มคำขอสำเร็จ:', docRef.id);
            return { success: true, id: docRef.id };
            
        } catch (error) {
            console.error('❌ Error adding request:', error);
            
            if (error.code === 'resource-exhausted') {
                alert('🚨 Firebase quota เกินขีดจำกัด\nไม่สามารถเพิ่มคำขอใหม่ได้ในขณะนี้\nกรุณาลองใหม่พรุ่งนี้');
                return { success: false, error: 'Quota exceeded' };
            }
            
            return { success: false, error: error.message };
        }
    }

    // ข้อมูลตัวอย่างสำหรับกรณี emergency
    getSampleEmployees() {
        return [
            {
                employee_id: '100007',
                full_name: 'กมลลาศ วิชัยโย',
                department: 'โครงการ',
                section: 'PRANNOK-TADMAI (DH2)',
                position: 'โฟร์แมนอาวุโสงานสถาปัตย์'
            },
            {
                employee_id: '100001',
                full_name: 'ผู้ใช้ตัวอย่าง',
                department: 'สโตว์',
                section: 'จัดการเครื่องมือ',
                position: 'เจ้าหน้าที่สโตว์'
            }
        ];
    }

    getSampleTools() {
        return [
            {
                id: 'SAMPLE001',
                tool_name: 'เครื่องมือตัวอย่าง 1',
                serial_no: 'SAMPLE001',
                unit: 'ชิ้น',
                status: 'พร้อมใช้งาน'
            },
            {
                id: 'SAMPLE002',
                tool_name: 'เครื่องมือตัวอย่าง 2',
                serial_no: 'SAMPLE002',
                unit: 'ชิ้น',
                status: 'พร้อมใช้งาน'
            }
        ];
    }

    // ตรวจสอบสถานะ Firebase
    async checkQuotaStatus() {
        try {
            const testQuery = query(collection(this.db, 'employees'), limit(1));
            await getDocs(testQuery);
            return { status: 'ok', message: 'Firebase พร้อมใช้งาน' };
        } catch (error) {
            if (error.code === 'resource-exhausted') {
                return { 
                    status: 'quota_exceeded', 
                    message: 'Firebase quota เกินขีดจำกัด - ใช้ cached data' 
                };
            }
            return { 
                status: 'error', 
                message: 'เกิดข้อผิดพลาด: ' + error.message 
            };
        }
    }
}

// สร้าง instance และ export
const firebaseService = new FirebaseService();

// Global functions
window.firebase = firebaseService;
window.FirebaseCache = FirebaseCache;

// ตรวจสอบสถานะเมื่อโหลด
window.addEventListener('load', async () => {
    console.log('🔍 ตรวจสอบสถานะ Firebase...');
    const status = await firebaseService.checkQuotaStatus();
    console.log('📊 Firebase Status:', status.message);
    
    if (status.status === 'quota_exceeded') {
        console.warn('🚨 Firebase ทำงานในโหมด Emergency - ใช้ cache เป็นหลัก');
    }
});

console.log('✅ Firebase Emergency Service พร้อมใช้งาน');
console.log('💡 ระบบจะใช้ cached data เมื่อ Firebase quota เกินขีดจำกัด');

export { firebaseService, FirebaseCache };