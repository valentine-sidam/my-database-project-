# 🏗️ My Database Project - Firebase Upload System

## 📋 ภาพรวม
ระบบสำหรับอัปโหลดข้อมูลจากหลายแหล่งเข้า Firebase Firestore:
- **เครื่องมือ (Tools)**: 6,635 รายการ จาก Google Sheets
- **พนักงาน (Employees)**: 206 คน จากไฟล์ CSV

## 📁 ไฟล์สำคัญ

### 🚀 ไฟล์หลัก
- `uploadAllData.js` - อัปโหลดข้อมูลทั้งหมด
- `upload.sh` - สคริปต์รันแบบง่าย

### 📊 ไฟล์ข้อมูล
- `uploadToolsFromSheet.js` - อัปโหลดเครื่องมือจาก Google Sheets
- `uploadEmployeesFromCSV.js` - อัปโหลดพนักงานจาก CSV
- `ToolBase System - Employees.csv` - ข้อมูลพนักงาน 206 คน

### ⚙️ ไฟล์ตั้งค่า
- `sheetConfig.js` - การตั้งค่า Google Sheets
- `my-database-project-firebase-adminsdk.json.example` - ตัวอย่าง Firebase key

## 🔧 วิธีการใช้งาน

### 1. ตั้งค่า Firebase Admin SDK
```bash
# 1. ไปที่ Firebase Console
# https://console.firebase.google.com/project/my-database-project

# 2. Project Settings > Service Accounts > Generate new private key

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