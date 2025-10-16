// Navbar Component for Tools Track System
class ToolsTrackNavbar {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        if (filename.includes('tools-request')) return 'request';
        if (filename.includes('tools-track')) return 'track';
        if (filename.includes('admin')) return 'admin';
        if (filename.includes('dashboard-status')) return 'dashboard';
        if (filename === '' || filename === '/' || filename.includes('index')) return 'home';
        return 'other';
    }

    init() {
        this.createNavbar();
        this.attachEventListeners();
    }

    createNavbar() {
        const navbar = document.createElement('nav');
        navbar.id = 'toolsTrackNavbar';
        navbar.innerHTML = `
            <div class="navbar-container">
                <!-- Logo & Brand -->
                <div class="navbar-brand">
                    <a href="tools-track.html" class="brand-link ${this.currentPage === 'track' ? 'active' : ''}">
                        <span class="brand-icon">🛠️</span>
                        <span class="brand-text">Tools Track</span>
                    </a>
                </div>

                <!-- Navigation Menu -->
                <div class="navbar-menu">
                    <a href="tools-request-firebase.html" class="nav-item ${this.currentPage === 'request' ? 'active' : ''}">📝 ขอเบิกเครื่องมือ</a>
                    <a href="tools-track.html" class="nav-item ${this.currentPage === 'track' ? 'active' : ''}">🔍 ติดตามสถานะ</a>
                    <a href="admin-firebase.html" class="nav-item ${this.currentPage === 'admin' ? 'active' : ''}">⚙️ ระบบจัดการ</a>
                </div>

                <!-- Status Indicator & User Info -->
                <div class="navbar-status">
                    <div class="user-info-navbar" id="navbarUserInfo" style="display: none;">
                        <!-- จะเติมข้อมูลผู้ใช้ด้วย JavaScript -->
                    </div>
                    <div class="status-indicator">
                        <span class="status-dot"></span>
                        <span class="status-text">Firebase Ready</span>
                    </div>
                </div>
                </div>

                <!-- Mobile Menu Button -->
                <button class="mobile-menu-btn" onclick="toolsNavbar.toggleMobileMenu()">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        `;

        // Insert at the beginning of body
        document.body.insertBefore(navbar, document.body.firstChild);
        
        // Add CSS
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Navbar Styles */
            #toolsTrackNavbar {
                background: white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                position: sticky;
                top: 0;
                z-index: 1000;
                border-bottom: 1px solid #e9ecef;
            }

            .navbar-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 30px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-height: 60px;
            }

            /* Brand */
            .navbar-brand {
                flex-shrink: 0;
            }

            .brand-link {
                display: flex;
                align-items: center;
                gap: 10px;
                text-decoration: none;
                color: #333;
                font-weight: 600;
                font-size: 24px; /* เพิ่มจาก 20px เป็น 24px */
                transition: all 0.3s ease;
            }

            .brand-link:hover {
                color: #007bff;
            }

            .brand-icon {
                font-size: 28px; /* เพิ่มจาก 24px เป็น 28px */
            }

            /* Navigation Menu */
            .navbar-menu {
                display: flex;
                gap: 40px;
                align-items: center;
            }

            .nav-item {
                text-decoration: none;
                color: #666;
                font-weight: 500;
                font-size: 18px; /* เพิ่มจาก 16px เป็น 18px */
                padding: 10px 0; /* เพิ่ม padding เล็กน้อย */
                transition: all 0.3s ease;
                position: relative;
            }

            .nav-item:hover {
                color: #333;
            }

            .nav-item.active {
                color: #333;
                font-weight: 700; /* เพิ่มความหนาจาก 600 เป็น 700 */
            }

            .nav-item.active::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                right: 0;
                height: 2px;
                background: #007bff;
            }

            /* Status Indicator & User Info */
            .navbar-status {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .user-info-navbar {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 20px;
                font-size: 14px;
                color: #333;
                border: 1px solid #ddd;
            }

            .user-info-navbar .user-name {
                font-weight: 600;
            }

            .user-info-navbar .user-role {
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }

            .user-info-navbar .role-admin {
                background: #28a745;
                color: white;
            }

            .user-info-navbar .role-user {
                background: #6c757d;
                color: white;
            }

            .logout-btn {
                background: none;
                border: none;
                color: #dc3545;
                cursor: pointer;
                font-size: 16px;
                padding: 2px;
                margin-left: 5px;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            .logout-btn:hover {
                background: #dc3545;
                color: white;
            }

            .status-indicator {
                display: none; /* ซ่อน status indicator เดิม */
            }

            /* Mobile Menu Button */
            .mobile-menu-btn {
                display: none;
                flex-direction: column;
                gap: 4px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 8px;
            }

            .mobile-menu-btn span {
                width: 25px;
                height: 3px;
                background: white;
                border-radius: 3px;
                transition: all 0.3s ease;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .navbar-container {
                    padding: 0 15px;
                    min-height: 60px;
                }

                .brand-link {
                    font-size: 20px;
                    padding: 6px 12px;
                }

                .brand-icon {
                    font-size: 24px;
                }

                .navbar-menu {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    flex-direction: column;
                    padding: 20px;
                    gap: 15px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }

                .navbar-menu.mobile-open {
                    display: flex;
                }

                .nav-item {
                    min-width: auto;
                    width: 100%;
                    justify-content: center;
                }

                .mobile-menu-btn {
                    display: flex;
                }

                .navbar-status {
                    order: -1;
                    margin-left: auto;
                    margin-right: 10px;
                }

                .status-indicator {
                    padding: 6px 12px;
                    font-size: 12px;
                }
            }

            @media (max-width: 480px) {
                .navbar-container {
                    padding: 0 10px;
                }

                .nav-text {
                    font-size: 13px;
                }

                .nav-icon {
                    font-size: 20px;
                }
            }

            /* Adjust body margin to account for navbar */
            body {
                margin-top: 0 !important;
                padding-top: 0 !important;
            }

            /* Ensure main content appears below navbar */
            body > .main-content,
            body > .container {
                margin-top: 20px !important;
                padding-top: 20px !important;
            }

            /* For pages that might have different container classes */
            .main-content,
            .container,
            .content-wrapper {
                margin-top: 20px !important;
            }
        `;
        document.head.appendChild(style);
    }

    toggleMobileMenu() {
        const menu = document.querySelector('.navbar-menu');
        menu.classList.toggle('mobile-open');
    }

    attachEventListeners() {
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const navbar = document.getElementById('toolsTrackNavbar');
            const menu = document.querySelector('.navbar-menu');
            
            if (!navbar.contains(e.target) && menu.classList.contains('mobile-open')) {
                menu.classList.remove('mobile-open');
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            const menu = document.querySelector('.navbar-menu');
            if (window.innerWidth > 768 && menu.classList.contains('mobile-open')) {
                menu.classList.remove('mobile-open');
            }
        });

        // อัพเดทข้อมูลผู้ใช้เมื่อโหลดหน้าเสร็จ
        document.addEventListener('DOMContentLoaded', () => {
            this.updateUserInfo();
        });

        // ตรวจสอบการเปลี่ยนแปลงข้อมูลผู้ใช้
        setInterval(() => {
            this.updateUserInfo();
        }, 5000); // ตรวจสอบทุก 5 วินาที
    }

    // อัพเดทข้อมูลผู้ใช้ใน navbar
    updateUserInfo() {
        const userInfoElement = document.getElementById('navbarUserInfo');
        if (!userInfoElement) return;

        // ตรวจสอบว่ามี authSystem หรือไม่
        if (typeof window.authSystem === 'undefined') {
            userInfoElement.style.display = 'none';
            return;
        }

        const currentUser = window.authSystem.getCurrentUser();
        const permissions = window.authSystem.getUserPermissions();

        if (currentUser && window.authSystem.isAuthenticated) {
            userInfoElement.style.display = 'flex';
            userInfoElement.innerHTML = `
                <span class="user-name">👤 ${currentUser.full_name}</span>
                <span class="user-role role-${permissions.role}">
                    ${permissions.role === 'admin' ? 'เจ้าหน้าที่' : 'พนักงาน'}
                </span>
                <button class="logout-btn" onclick="toolsNavbar.logout()" title="ออกจากระบบ">🚪</button>
            `;
        } else {
            userInfoElement.style.display = 'none';
        }
    }

    // ออกจากระบบ
    logout() {
        if (typeof window.authSystem !== 'undefined') {
            if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
                window.authSystem.logout();
                this.updateUserInfo();
                
                // รีเฟรชหน้าเพื่อให้ระบบตรวจสอบสิทธิ์ใหม่
                setTimeout(() => {
                    location.reload();
                }, 500);
            }
        }
    }
}

// Initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.toolsNavbar = new ToolsTrackNavbar();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToolsTrackNavbar;
}