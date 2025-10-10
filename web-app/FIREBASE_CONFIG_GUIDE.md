# 🔥 วิธีการหา Firebase Web Config ที่ถูกต้อง

## 📝 ขั้นตอนการดึง Firebase Web Configuration:

### 1. เข้าสู่ Firebase Console
- ไปที่: https://console.firebase.google.com/
- เลือกโปรเจค: **my-database-project-343ae**

### 2. เข้าสู่ Project Settings
- คลิกที่ไอคอน ⚙️ (Settings) มุมซ้ายบน
- เลือก **Project settings**

### 3. หา Web App Configuration
- เลื่อนลงไปหาส่วน **"Your apps"**
- ถ้ายังไม่มี Web App ให้คลิก **"Add app"** เลือก **Web** (</>) 
- ถ้ามีแล้ว ให้คลิกที่ Web App ที่มีอยู่

### 4. คัดลอก Firebase Config
ข้อมูลที่ต้องการจะมีหน้าตาประมาณนี้:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "my-database-project-343ae.firebaseapp.com",
  projectId: "my-database-project-343ae",
  storageBucket: "my-database-project-343ae.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 5. อัพเดทไฟล์ firebase-real-config.js
แทนที่ข้อมูลใน firebaseConfig ด้วยข้อมูลที่คัดลอกมา

---

## 🔧 หากยังไม่มี Web App ใน Firebase:

### สร้าง Web App ใหม่:
1. ไปที่ Project Settings
2. เลื่อนลงหา "Your apps"
3. คลิก "Add app" 
4. เลือก Web (</>) icon
5. ใส่ชื่อ app: "ToolBase Web App"
6. ✅ เลือก "Also set up Firebase Hosting for this app" (ถ้าต้องการ)
7. คลิก "Register app"
8. คัดลอก Configuration code ที่แสดง

---

## 📋 ข้อมูลที่เราทราบแล้ว:
- **Project ID**: my-database-project-343ae
- **Auth Domain**: my-database-project-343ae.firebaseapp.com  
- **Storage Bucket**: my-database-project-343ae.appspot.com

---

## ⚠️ สำคัญ:
- **Admin SDK Key** (ที่เรามีอยู่) ใช้สำหรับ Server-side เท่านั้น
- **Web Config** ใช้สำหรับ Client-side (เว็บแอป) 
- ข้อมูลทั้งสองแบบต่างกัน และต้องใช้ตามวัตถุประสงค์

---

## 🧪 หลังจากอัพเดท Config แล้ว:
1. เปิดหน้า firebase-test.html
2. ทดสอบการเชื่อมต่อ
3. ตรวจสอบข้อมูลในแต่ละ Collection
4. สร้างข้อมูลทดสอบ

---

## 🔍 วิธีตรวจสอบว่า Config ถูกต้อง:
- Project ID ต้องตรงกัน
- Auth Domain ต้องเป็น projectid.firebaseapp.com
- ไม่มี error ใน Browser Console
- สามารถดึงข้อมูลได้สำเร็จ