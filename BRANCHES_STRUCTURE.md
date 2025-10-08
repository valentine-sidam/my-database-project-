# Project Branches Structure

## Overview
โปรเจ็กต์นี้แบ่งออกเป็น 3 branches หลัก เพื่อจัดการระบบต่างๆ แยกกัน:

## Branches

### 1. `main`
- **Purpose**: Main branch สำหรับ production code
- **Contains**: Core functionality และ shared components
- **Firebase**: เชื่อมต่อกับ Firebase database เดียวกัน

### 2. `tools-track-system`
- **Purpose**: ระบบขอเบิกเครื่องมือ (Tools Track System)
- **Target Users**: ผู้ต้องการเบิกเครื่องมือ
- **Features**:
  - หน้าแสดงรายการเครื่องมือที่มีอยู่
  - ฟอร์มขอเบิกเครื่องมือ
  - ติดตามสถานะการขอเบิก
  - ประวัติการเบิกเครื่องมือ
- **Main Files**:
  - `web-app/tools-request.html`
  - `web-app/tools-request-new.html`
  - `web-app/tools-track.html`

### 3. `tools-manage-system`
- **Purpose**: ระบบจัดการเครื่องมือ (Tools Management System)
- **Target Users**: ธุรการสโตว์ / ผู้จัดการ
- **Features**:
  - จัดการข้อมูลเครื่องมือ (เพิ่ม/แก้ไข/ลบ)
  - อนุมัติ/ปฏิเสธการขอเบิก
  - รายงานการใช้งานเครื่องมือ
  - จัดการผู้ใช้งาน
- **Main Files**:
  - `web-app/admin.html`
  - `web-app/dashboard.html`

## Shared Components
Files ที่ใช้ร่วมกันระหว่าง branches:
- `firebase-config.js` - การตั้งค่า Firebase
- Backend files (index.js, server.js, etc.)
- Database configuration files

## Firebase Integration
ทั้ง 2 ระบบจะเชื่อมต่อกับ Firebase database เดียวกัน:
- **Authentication**: ผู้ใช้งานจะ login ผ่านระบบเดียวกัน
- **Database**: ข้อมูลเครื่องมือและการขอเบิกจะเก็บใน Firestore
- **Storage**: ไฟล์เอกสารและรูปภาพจะเก็บใน Firebase Storage

## Development Workflow
1. **Feature Development**: สร้าง feature branch จาก main
2. **Testing**: ทำการทดสอบใน feature branch
3. **Integration**: Merge กลับไป main หลังจาก review
4. **Deployment**: Deploy จาก main branch

## Getting Started
1. Clone repository: `git clone https://github.com/valentine-sidam/my-database-project-`
2. Switch to desired branch: `git checkout [branch-name]`
3. Install dependencies: `npm install`
4. Configure Firebase: Copy `my-database-project-firebase-adminsdk.json.example` to `my-database-project-firebase-adminsdk.json`
5. Start development server: `npm start`