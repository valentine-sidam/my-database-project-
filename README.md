# 🏗️ My Database Project - Tools Management System

## 📋 ภาพรวม
ระบบจัดการเครื่องมือแบบครบครัน ประกอบด้วย 2 ระบบหลัก:
- **🔧 Tools Management System**: สำหรับธุรการสโตว์ (Admin/Manager)
- **📱 Tools Request System**: สำหรับพนักงานทั่วไป (End Users)

## 🌿 Branch Structure

### � `main` - Main Branch
- **Purpose**: Production code และ shared components
- **Contains**: Core functionality, documentation, และ Firebase configuration

### � `tools-manage-system` - ระบบจัดการเครื่องมือ
- **Target Users**: ธุรการสโตว์, ผู้จัดการ, แอดมิน
- **Features**: 
  - จัดการคำขอเบิก (อนุมัติ/ปฏิเสธ)
  - จัดการข้อมูลเครื่องมือ
  - สร้างรายงานและวิเคราะห์
  - จัดการผู้ใช้งาน

### 📱 `tools-track-system` - ระบบขอเบิกเครื่องมือ  
- **Target Users**: พนักงานทั่วไป, หัวหน้างาน
- **Features**:
  - ค้นหาและขอเบิกเครื่องมือ
  - ติดตามสถานะคำขอ
  - ดูประวัติการเบิก
  - การแจ้งเตือน

## 🚀 Quick Start

### เลือก Branch ตามการใช้งาน
```bash
# สำหรับระบบจัดการ (Admin/Manager)
git checkout tools-manage-system
npm run manage

# สำหรับระบบขอเบิก (End Users)  
git checkout tools-track-system
npm run track

# Development ใน main branch
git checkout main
npm start
```

# 3. บันทึกไฟล์เป็น: my-database-project-firebase-adminsdk.json
```

### 2. อัปโหลดข้อมูล
```bash
# วิธีที่ 1: ใช้สคริปต์
./upload.sh

# วิธีที่ 2: รันโดยตรง
node uploadAllData.js
```

### 3. อัปโหลดแต่ละประเภท
```bash
# เฉพาะเครื่องมือ
node uploadToolsFromSheet.js

# เฉพาะพนักงาน  
node uploadEmployeesFromCSV.js
```

## 📊 โครงสร้างข้อมูลใน Firebase

### Collection: `tools`
```javascript
{
  "E.MJ.CON.010.010.001.0001": {
    "id": "E.MJ.CON.010.010.001.0001",
    "tool_name": "เวอร์เครนบูมกระดก 8 ตัน", 
    "serial_no": "E.MJ.CON.010.010.001.0001",
    "old_code": "TTS2080010011",
    "unit": "เครื่อง",
    "status": "พร้อมใช้งาน",
    "location": "คลังสินค้าบางบ่อ",
    "latest_update_date": "29/7/2025",
    "note": "",
    "current_responsible": ""
  }
}
```

### Collection: `employees`
```javascript
{
  "100007": {
    "employee_id": "100007",
    "first_name": "กมลลาศ",
    "last_name": "วิชัยโย", 
    "full_name": "กมลลาศ วิชัยโย",
    "section": "PRANNOK-TADMAI (DH2)",
    "group": "งานสถาปัตยกรรม",
    "department": "โครงการ",
    "position": "โฟร์แมนอาวุโสงานสถาปัตย์"
  }
}
```

## 📈 สถิติข้อมูล

### เครื่องมือ (6,635 รายการ)
- ดึงจาก Google Sheets: [ลิงค์](https://docs.google.com/spreadsheets/d/1LFkaZSMJDC548v5GyNxp_hJxaog6NOocwPbwMFEveDg)
- อัปโหลดแบบ Batch (500 รายการต่อครั้ง)

### พนักงาน (206 คน)  
- **โครงการ**: 179 คน
- **โกดัง**: 22 คน
- **สำนักงานใหญ่**: 5 คน

## 🔍 การทดสอบ

```bash
# ทดสอบการดึงข้อมูลเครื่องมือ
node uploadToolsFromSheet.js

# ทดสอบการอ่านข้อมูลพนักงาน
node uploadEmployeesFromCSV.js

# ทดสอบการเชื่อมต่อ Google Sheets
node testSheetConnection.js

# ตรวจสอบ GID ของ Sheets
node findCorrectGids.js
```

## ⚠️ ข้อควรระวัง

1. **Firebase Admin SDK Key**: อย่าอัปโหลดไฟล์ `.json` เข้า Git
2. **Batch Size**: ปรับขนาด batch ตามขีดจำกัดของ Firestore
3. **Google Sheets Access**: ตรวจสอบให้แน่ใจว่า Sheet เป็น Public หรือมี API key

## 🔗 ลิงค์สำคัญ

- [Firebase Console](https://console.firebase.google.com/project/my-database-project)
- [Google Sheets Data](https://docs.google.com/spreadsheets/d/1LFkaZSMJDC548v5GyNxp_hJxaog6NOocwPbwMFEveDg)
- [Firestore Database](https://console.firebase.google.com/project/my-database-project/firestore)

---
📅 **อัปเดตล่าสุด**: October 8, 2025  
👤 **ผู้พัฒนา**: valentine-sidam