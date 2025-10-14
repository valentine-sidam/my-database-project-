// auth-system.js - ระบบจัดการสิทธิ์การเข้าถึง
// สำหรับการแยกสิทธิ์ระหว่าง Admin (พนักงานสโตว์/ธุรการสโตว์) และ User (พนักงานทั่วไป)

class AuthenticationSystem {
    constructor() {
        this.currentUser = null;
        this.userPermissions = {};
        this.adminDepartments = ['สโตว์', 'ธุรการสโตว์', 'Store', 'Admin']; // หน่วยงานที่มีสิทธิ์ Admin
        this.isAuthenticated = false;
    }

    // 🔐 เข้าสู่ระบบด้วยรหัสพนักงาน
    async login(employeeId) {
        try {
            console.log('🔍 กำลังตรวจสอบสิทธิ์พนักงาน:', employeeId);
            
            // ดึงข้อมูลพนักงานจาก Firebase
            const employee = await window.firebase.getEmployeeById(employeeId);
            
            if (!employee) {
                throw new Error('ไม่พบข้อมูลพนักงานในระบบ');
            }

            this.currentUser = employee;
            this.isAuthenticated = true;

            // กำหนดสิทธิ์ตามหน่วยงาน
            this.setUserPermissions(employee);

            console.log('✅ เข้าสู่ระบบสำเร็จ:', employee.full_name);
            console.log('🎯 สิทธิ์:', this.userPermissions.role);

            // บันทึกข้อมูลใน localStorage
            localStorage.setItem('toolbase_user', JSON.stringify({
                employee_id: employee.employee_id,
                full_name: employee.full_name,
                department: employee.department,
                role: this.userPermissions.role,
                loginTime: new Date().toISOString()
            }));

            return {
                success: true,
                user: this.currentUser,
                permissions: this.userPermissions
            };

        } catch (error) {
            console.error('❌ เข้าสู่ระบบไม่สำเร็จ:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 🛡️ กำหนดสิทธิ์ผู้ใช้ตามหน่วยงาน
    setUserPermissions(employee) {
        const department = employee.department || '';
        const section = employee.section || '';
        const position = employee.position || '';

        // ตรวจสอบว่าเป็น Admin หรือไม่
        const isAdmin = this.adminDepartments.some(adminDept => 
            department.toLowerCase().includes(adminDept.toLowerCase()) ||
            section.toLowerCase().includes(adminDept.toLowerCase()) ||
            position.toLowerCase().includes(adminDept.toLowerCase())
        );

        if (isAdmin) {
            // สิทธิ์ Admin (พนักงานสโตว์/ธุรการสโตว์)
            this.userPermissions = {
                role: 'admin',
                canViewDashboard: true,
                canManageRequests: true,
                canTrackTools: true,
                canCreateTransactions: true,
                canSearchEmployees: true,
                canSearchTools: true,
                canSetReturnSchedule: true,
                canSetReminders: true,
                canViewReports: true,
                canViewAllRequests: true,
                canApproveRejects: true,
                canViewStatistics: true
            };
        } else {
            // สิทธิ์ User (พนักงานทั่วไป)
            this.userPermissions = {
                role: 'user',
                canViewDashboard: false,
                canManageRequests: false,
                canTrackTools: false,
                canCreateTransactions: false,
                canSearchEmployees: false,
                canSearchTools: false,
                canSetReturnSchedule: false,
                canSetReminders: false,
                canViewReports: false,
                canViewAllRequests: false,
                canApproveRejects: false,
                canViewStatistics: false,
                // สิทธิ์ที่ User ทำได้
                canViewOwnRequests: true,
                canCreateRequests: true,
                canViewOwnHistory: true,
                canCheckReturnDates: true
            };
        }
    }

    // 🔍 ตรวจสอบสิทธิ์การเข้าถึง
    hasPermission(permission) {
        return this.userPermissions[permission] === true;
    }

    // 👤 ตรวจสอบว่าเป็น Admin หรือไม่
    isAdmin() {
        return this.userPermissions.role === 'admin';
    }

    // 👥 ตรวจสอบว่าเป็น User หรือไม่
    isUser() {
        return this.userPermissions.role === 'user';
    }

    // 🔒 ออกจากระบบ
    logout() {
        this.currentUser = null;
        this.userPermissions = {};
        this.isAuthenticated = false;
        localStorage.removeItem('toolbase_user');
        console.log('🚪 ออกจากระบบแล้ว');
    }

    // 🔄 กู้คืนข้อมูล Login จาก localStorage
    restoreSession() {
        try {
            const savedUser = localStorage.getItem('toolbase_user');
            if (savedUser) {
                const userData = JSON.parse(savedUser);
                
                // ตรวจสอบว่า session ไม่เก่าเกิน 24 ชั่วโมง
                const loginTime = new Date(userData.loginTime);
                const now = new Date();
                const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) {
                    this.currentUser = userData;
                    this.isAuthenticated = true;
                    
                    // กำหนดสิทธิ์จากข้อมูลที่บันทึกไว้
                    if (userData.role === 'admin') {
                        this.userPermissions = {
                            role: 'admin',
                            canViewDashboard: true,
                            canManageRequests: true,
                            canTrackTools: true,
                            canCreateTransactions: true,
                            canSearchEmployees: true,
                            canSearchTools: true,
                            canSetReturnSchedule: true,
                            canSetReminders: true,
                            canViewReports: true,
                            canViewAllRequests: true,
                            canApproveRejects: true,
                            canViewStatistics: true
                        };
                    } else {
                        this.userPermissions = {
                            role: 'user',
                            canViewOwnRequests: true,
                            canCreateRequests: true,
                            canViewOwnHistory: true,
                            canCheckReturnDates: true
                        };
                    }
                    
                    console.log('🔄 กู้คืน session สำเร็จ:', userData.full_name);
                    return true;
                } else {
                    // Session หมดอายุ
                    localStorage.removeItem('toolbase_user');
                }
            }
            return false;
        } catch (error) {
            console.error('❌ กู้คืน session ไม่สำเร็จ:', error);
            return false;
        }
    }

    // 📋 ข้อมูลผู้ใช้ปัจจุบัน
    getCurrentUser() {
        return this.currentUser;
    }

    // 🎯 ข้อมูลสิทธิ์ปัจจุบัน
    getUserPermissions() {
        return this.userPermissions;
    }

    // 🚫 บล็อกการเข้าถึงหากไม่มีสิทธิ์
    requirePermission(permission, redirectUrl = null) {
        if (!this.isAuthenticated) {
            this.showLoginPrompt();
            return false;
        }

        if (!this.hasPermission(permission)) {
            this.showAccessDenied();
            if (redirectUrl) {
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 2000);
            }
            return false;
        }

        return true;
    }

    // 🔐 แสดงหน้าต่างเข้าสู่ระบบ
    showLoginPrompt() {
        const employeeId = prompt('กรุณาใส่รหัสพนักงานเพื่อเข้าสู่ระบบ:');
        if (employeeId) {
            this.login(employeeId).then(result => {
                if (result.success) {
                    location.reload(); // รีเฟรชหน้าเพื่อแสดงข้อมูลที่ถูกต้อง
                } else {
                    alert('เข้าสู่ระบบไม่สำเร็จ: ' + result.error);
                }
            });
        }
    }

    // 🚫 แสดงข้อความไม่มีสิทธิ์เข้าถึง
    showAccessDenied() {
        alert(`⚠️ คุณไม่มีสิทธิ์เข้าถึงส่วนนี้\n\nฟีเจอร์นี้สำหรับ: เจ้าหน้าที่สโตว์/ธุรการสโตว์เท่านั้น\nสิทธิ์ปัจจุบันของคุณ: ${this.userPermissions.role || 'ไม่ได้เข้าสู่ระบบ'}`);
    }

    // 🎨 ปรับแต่ง UI ตามสิทธิ์ผู้ใช้
    adjustUIForPermissions() {
        if (!this.isAuthenticated) return;

        // ซ่อน/แสดงองค์ประกอบตามสิทธิ์
        const adminElements = document.querySelectorAll('[data-admin-only]');
        const userElements = document.querySelectorAll('[data-user-only]');

        adminElements.forEach(element => {
            element.style.display = this.isAdmin() ? 'block' : 'none';
        });

        userElements.forEach(element => {
            element.style.display = this.isUser() ? 'block' : 'none';
        });

        // แสดงข้อมูลผู้ใช้
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.innerHTML = `
                <div class="user-badge">
                    👤 ${this.currentUser.full_name} 
                    <span class="role-badge role-${this.userPermissions.role}">
                        ${this.userPermissions.role === 'admin' ? 'เจ้าหน้าที่' : 'พนักงาน'}
                    </span>
                </div>
            `;
        }
    }
}

// สร้าง instance global
window.authSystem = new AuthenticationSystem();

// CSS สำหรับ UI
const authCSS = `
    .user-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: #f8f9fa;
        border-radius: 8px;
        font-size: 14px;
        color: #495057;
    }

    .role-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }

    .role-admin {
        background: #28a745;
        color: white;
    }

    .role-user {
        background: #6c757d;
        color: white;
    }

    [data-admin-only] {
        display: none;
    }

    [data-user-only] {
        display: none;
    }

    .access-denied {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        text-align: center;
    }

    .login-required {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        color: #856404;
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        text-align: center;
    }
`;

// เพิ่ม CSS เข้าหน้า
const style = document.createElement('style');
style.textContent = authCSS;
document.head.appendChild(style);

console.log('🛡️ Authentication System โหลดเสร็จสิ้น');