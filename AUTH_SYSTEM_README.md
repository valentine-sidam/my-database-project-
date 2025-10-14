# 🛡️ ระบบควบคุมสิทธิ์การเข้าถึง (Authentication & Authorization System)

## 📋 ภาพรวม
ระบบนี้จัดการสิทธิ์การเข้าถึงสำหรับ Tools Management System โดยแยกสิทธิ์ระหว่าง:
- **Admin (เจ้าหน้าที่สโตว์/ธุรการสโตว์)**: สิทธิ์เต็ม
- **User (พนักงานทั่วไป)**: สิทธิ์จำกัด

## 🔧 ไฟล์ที่เกี่ยวข้อง

### ไฟล์หลัก
- `auth-system.js` - ระบบ Authentication หลัก
- `auth-test.html` - หน้าทดสอบระบบสิทธิ์

### ไฟล์ที่ปรับปรุงแล้ว
- `tools-track.html` - เพิ่มการตรวจสอบสิทธิ์ Admin
- `tools-request-firebase.html` - เพิ่มการตรวจสอบสิทธิ์ User
- `firebase-real-config.js` - มีฟังก์ชัน getEmployeeById อยู่แล้ว

## 👨‍💼 สิทธิ์ Admin (เจ้าหน้าที่สโตว์/ธุรการสโตว์)

### 🎯 หน่วยงานที่ได้รับสิทธิ์ Admin
- สโตว์
- ธุรการสโตว์  
- Store
- Admin

### ✅ สิทธิ์ที่ได้รับ
- ✅ **ดู Dashboard** สถิติทั้งหมด (คำขอทั้งหมด, กำหนดส่งมอบ, ส่งมอบแล้ว, จบกิจ)
- ✅ **จัดการคำขออุปกรณ์** - อนุมัติ/ปฏิเสธ/เปลี่ยนสถานะ
- ✅ **ติดตามการเบิก-คืนเครื่องมือ** แบบ Real-time
- ✅ **บันทึกธุรกรรม** เบิก/คืน/โอนเครื่องมือ
- ✅ **ค้นหาพนักงาน** จากรหัสหรือชื่อ-นามสกุล
- ✅ **ค้นหาเครื่องมือ** จาก Serial No., Old Code, ชื่อเครื่องมือ
- ✅ **กำหนดรอบการคืน** (รายวัน/สัปดาห์/เดือน/ไตรมาส/ปี/ใช้ประจำ)
- ✅ **ตั้งกำหนดเวลาคืน** และแจ้งเตือน
- ✅ **ดูรายงาน** และสถิติการใช้งาน

### 🌐 หน้าที่เข้าถึงได้
- `tools-track.html` - หน้า Dashboard ติดตามเครื่องมือ
- `admin-firebase.html` - หน้าจัดการระบบ
- `tools-request-firebase.html` - หน้าขอเบิกเครื่องมือ (สำหรับช่วยพนักงาน)

## 👥 สิทธิ์ User (พนักงานทั่วไป)

### ✅ สิทธิ์ที่ได้รับ
- ✅ **ดูสถานะคำขอของตัวเอง** (รออนุมัติ/อนุมัติแล้ว/ส่งมอบแล้ว/จบกิจ)
- ✅ **ยื่นคำขอเบิกเครื่องมือ** ผ่านระบบ
- ✅ **ดูประวัติการเบิก-คืน** ของตัวเอง
- ✅ **ตรวจสอบกำหนดคืนเครื่องมือ**

### ❌ สิทธิ์ที่ไม่ได้รับ
- ❌ **ไม่สามารถจัดการคำขอของคนอื่น**
- ❌ **ไม่เห็น Dashboard สถิติทั้งหมด**
- ❌ **ไม่สามารถอนุมัติ/ปฏิเสธคำขอ**
- ❌ **ไม่สามารถดูข้อมูลพนักงานคนอื่น**

### 🌐 หน้าที่เข้าถึงได้
- `tools-request-firebase.html` - หน้าขอเบิกเครื่องมือ (แสดงเฉพาะข้อมูลตัวเอง)

## 🔐 การใช้งานระบบ

### 1. การเข้าสู่ระบบ
```javascript
// เข้าสู่ระบบด้วยรหัสพนักงาน
const result = await window.authSystem.login('100007');
if (result.success) {
    console.log('เข้าสู่ระบบสำเร็จ:', result.user.full_name);
    console.log('สิทธิ์:', result.permissions.role);
}
```

### 2. ตรวจสอบสิทธิ์
```javascript
// ตรวจสอบว่าเป็น Admin หรือไม่
if (window.authSystem.isAdmin()) {
    // แสดงฟีเจอร์ Admin
}

// ตรวจสอบสิทธิ์เฉพาะ
if (window.authSystem.hasPermission('canViewDashboard')) {
    // แสดง Dashboard
}
```

### 3. ป้องกันการเข้าถึง
```javascript
// บังคับให้มีสิทธิ์เฉพาะ
if (!window.authSystem.requirePermission('canManageRequests')) {
    return; // หยุดการทำงานถ้าไม่มีสิทธิ์
}
```

### 4. ปรับแต่ง UI ตามสิทธิ์
```html
<!-- แสดงเฉพาะ Admin -->
<div data-admin-only>
    <button>จัดการคำขอ</button>
</div>

<!-- แสดงเฉพาะ User -->
<div data-user-only>
    <button>ขอเบิกเครื่องมือ</button>
</div>
```

## 📊 โครงสร้างข้อมูลใน Firebase

### Collection: `employees`
```javascript
{
  "employee_id": "100007",
  "full_name": "กมลลาศ วิชัยโย", 
  "department": "โครงการ", // ใช้ตรวจสอบสิทธิ์
  "section": "PRANNOK-TADMAI (DH2)",
  "position": "โฟร์แมนอาวุโสงานสถาปัตย์"
}
```

### กำหนดสิทธิ์ตามหน่วยงาน
ระบบจะตรวจสอบคำต่อไปนี้ใน `department`, `section`, หรือ `position`:
- **"สโตว์"** → Admin
- **"ธุรการสโตว์"** → Admin  
- **"Store"** → Admin
- **"Admin"** → Admin
- **อื่นๆ** → User

## 🧪 การทดสอบระบบ

### เปิดหน้าทดสอบ
```
http://localhost:3000/auth-test.html
```

### ตัวอย่างการทดสอบ
1. **ทดสอบ Admin**: ใส่รหัสพนักงานที่มี department = "สโตว์"
2. **ทดสอบ User**: ใส่รหัสพนักงานทั่วไป
3. **ตรวจสอบสิทธิ์**: ดูว่าแต่ละ permission แสดงผลถูกต้องหรือไม่

## 🔄 Session Management

### การจัดเก็บ Session
- ใช้ `localStorage` เก็บข้อมูลผู้ใช้
- Session หมดอายุใน 24 ชั่วโมง
- สามารถกู้คืน session เมื่อรีเฟรชหน้า

### การออกจากระบบ
```javascript
window.authSystem.logout(); // ลบ session ทันที
```

## 🎨 UI Elements

### User Badge
แสดงข้อมูลผู้ใช้และสิทธิ์:
```html
<div class="user-badge">
    👤 กมลลาศ วิชัยโย 
    <span class="role-badge role-admin">เจ้าหน้าที่</span>
</div>
```

### Access Denied Message
แสดงเมื่อไม่มีสิทธิ์เข้าถึง:
```html
<div class="access-denied">
    <h3>⚠️ ไม่มีสิทธิ์เข้าถึง</h3>
    <p>หน้านี้สำหรับเจ้าหน้าที่สโตว์/ธุรการสโตว์เท่านั้น</p>
</div>
```

## 🔧 การติดตั้ง

### 1. เพิ่มไฟล์ auth-system.js
```html
<script src="auth-system.js"></script>
```

### 2. เรียกใช้ในหน้าที่ต้องการ
```javascript
// ตรวจสอบสิทธิ์เมื่อโหลดหน้า
window.addEventListener('load', async () => {
    await waitForFirebase();
    
    // กู้คืน session หรือขอให้ login
    if (!window.authSystem.restoreSession()) {
        const employeeId = prompt('กรุณาใส่รหัสพนักงาน:');
        await window.authSystem.login(employeeId);
    }
    
    // ปรับแต่ง UI
    window.authSystem.adjustUIForPermissions();
});
```

## 🚨 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **ไม่สามารถเข้าสู่ระบบได้**
   - ตรวจสอบว่ารหัสพนักงานมีใน Firebase หรือไม่
   - ตรวจสอบการเชื่อมต่อ Firebase

2. **สิทธิ์ไม่ถูกต้อง**
   - ตรวจสอบ `department`, `section`, `position` ใน Firebase
   - ตรวจสอบว่าชื่อหน่วยงานตรงกับที่กำหนดไว้หรือไม่

3. **UI ไม่อัพเดท**
   - เรียก `window.authSystem.adjustUIForPermissions()` หลัง login
   - ตรวจสอบ attribute `data-admin-only` และ `data-user-only`

### Debug Commands
```javascript
// ตรวจสอบข้อมูลผู้ใช้ปัจจุบัน
console.log(window.authSystem.getCurrentUser());

// ตรวจสอบสิทธิ์ทั้งหมด
console.log(window.authSystem.getUserPermissions());

// ตรวจสอบสิทธิ์เฉพาะ
console.log(window.authSystem.hasPermission('canViewDashboard'));
```

## 📝 บันทึกการเปลี่ยนแปลง

### Version 1.0 (2024-10-14)
- สร้างระบบ Authentication พื้นฐาน
- แยกสิทธิ์ Admin และ User
- เพิ่มการตรวจสอบสิทธิ์ในหน้าต่างๆ
- สร้างหน้าทดสอบระบบ
- เพิ่ม Session Management

### การปรับปรุงต่อไป
- [ ] เพิ่ม Role-based permissions ที่ละเอียดขึ้น
- [ ] เพิ่มการ log การเข้าถึง
- [ ] เพิ่มการแจ้งเตือนเมื่อ session ใกล้หมดอายุ
- [ ] เพิ่มการเข้ารหัสข้อมูลใน localStorage