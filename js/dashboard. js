// نظام إدارة لوحة التحكم الديناميكية
class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    checkAuthentication() {
        this.currentUser = window.authSystem?.getCurrentUser();
        
        if (!this.currentUser) {
            ColdCloud.showNotification('يجب تسجيل الدخول للوصول إلى لوحة التحكم', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        this.updateUI();
    }

    setupEventListeners() {
        // التنقل بين التبويبات
        const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-tab]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // تحديث البيانات عند التركيز على النافذة
        window.addEventListener('focus', () => {
            this.loadDashboardData();
        });
    }

    switchTab(tabName) {
        // تحديث الروابط النشطة
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // عرض المحتوى المناسب
        this.showTabContent(tabName);
    }

    showTabContent(tabName) {
        // إخفاء جميع المحتويات أولاً
        const contents = [
            'servicesSection',
            'recentActivity'
            // يمكن إضافة المزيد من الأقسام هنا
        ];

        contents.forEach(content => {
            const element = document.getElementById(content);
            if (element) element.style.display = 'none';
        });

        // عرض المحتوى المطلوب
        switch (tabName) {
            case 'services':
                document.getElementById('servicesSection').style.display = 'block';
                this.loadServicesContent();
                break;
            case 'calculations':
                this.loadCalculationsContent();
                break;
            case 'overview':
            default:
                contents.forEach(content => {
                    const element = document.getElementById(content);
                    if (element) element.style.display = 'block';
                });
                this.loadOverviewContent();
                break;
        }
    }

    loadDashboardData() {
        if (!this.currentUser) return;

        this.updateWelcomeBanner();
        this.updateStats();
        this.loadServicesContent();
        this.loadActivityContent();
    }

    updateUI() {
        if (!this.currentUser) return;

        // تحديث بيانات المستخدم في الشريط الجانبي
        document.getElementById('userName').textContent = 
            `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        document.getElementById('userRole').textContent = 
            this.getUserTypeArabic(this.currentUser.userType);
        document.getElementById('userEmail').textContent = this.currentUser.email;
        document.getElementById('userAvatar').textContent = this.currentUser.avatar || '👤';

        // تحديث اسم المستخدم في القائمة العلوية
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }
    }

    updateWelcomeBanner() {
        const welcomeBanner = document.getElementById('welcomeBanner');
        if (welcomeBanner) {
            const hour = new Date().getHours();
            let greeting = 'مساء الخير';

            if (hour < 12) greeting = 'صباح الخير';
            else if (hour < 18) greeting = 'مساء الخير';

            welcomeBanner.innerHTML = `
                <h1>${greeting}، ${this.currentUser.firstName}! 👋</h1>
                <p>لديك ${this.currentUser.services?.length || 0} خدمات تحتاج لمتابعة</p>
            `;
        }
    }

    updateStats() {
        const userServices = window.authSystem.getUserServices();
        const userCalculations = window.authSystem.getUserCalculations();
        
        const activeServices = userServices.filter(s => 
            s.status === 'pending' || s.status === 'in_progress'
        ).length;

        const completedServices = userServices.filter(s => 
            s.status === 'completed'
        ).length;

        document.getElementById('servicesCount').textContent = activeServices;
        document.getElementById('completedServices').textContent = completedServices;
        document.getElementById('calculationsCount').textContent = userCalculations.length;
        document.getElementById('libraryItems').textContent = 
            parseInt(localStorage.getItem('coldCloudLibraryRead') || '0');
    }

    loadServicesContent() {
        const userServices = window.authSystem.getUserServices();
        const servicesContent = document.getElementById('servicesContent');

        if (!userServices || userServices.length === 0) {
            servicesContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tools"></i>
                    <h3>لا توجد خدمات حالياً</h3>
                    <p>لم تقم بطلب أي خدمة بعد. ابدأ بطلب خدمتك الأولى!</p>
                    <a href="services.html" class="btn btn-primary" style="margin-top: 1rem;">
                        طلب خدمة جديدة
                    </a>
                </div>
            `;
            return;
        }

        const recentServices = userServices
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        let tableHTML = `
            <table class="services-table">
                <thead>
                    <tr>
                        <th>رقم الخدمة</th>
                        <th>نوع الخدمة</th>
                        <th>التاريخ</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
        `;

        recentServices.forEach(service => {
            const serviceDate = new Date(service.createdAt).toLocaleDateString('ar-SA');
            const statusBadge = this.getStatusBadge(service.status);
            
            tableHTML += `
                <tr>
                    <td>#SC-${service.id.toString().slice(-4)}</td>
                    <td>${this.getServiceTypeArabic(service.type)}</td>
                    <td>${serviceDate}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-outline btn-small" onclick="viewService(${service.id})">
                            تفاصيل
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        servicesContent.innerHTML = tableHTML;
    }

    loadActivityContent() {
        const activityContent = document.getElementById('activityContent');
        const activities = this.generateRecentActivities();
        
        if (activities.length === 0) {
            activityContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>لا يوجد نشاط حديث</h3>
                    <p>سيظهر نشاطك هنا عندما تبدأ باستخدام المنصة</p>
                </div>
            `;
            return;
        }

        let activityHTML = `<ul class="activity-list">`;
        
        activities.forEach(activity => {
            activityHTML += `
                <li class="activity-item">
                    <div class="activity-icon">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                </li>
            `;
        });

        activityHTML += `</ul>`;
        activityContent.innerHTML = activityHTML;
    }

    generateRecentActivities() {
        const activities = [];
        const userServices = window.authSystem.getUserServices();
        const userCalculations = window.authSystem.getUserCalculations();

        // أنشطة الخدمات
        userServices.slice(0, 3).forEach(service => {
            activities.push({
                icon: 'fas fa-tools',
                title: `طلب خدمة ${this.getServiceTypeArabic(service.type)}`,
                time: this.formatTimeAgo(new Date(service.createdAt))
            });
        });

        // أنشطة الحسابات
        userCalculations.slice(0, 2).forEach(calculation => {
            activities.push({
                icon: 'fas fa-calculator',
                title: `حساب ${this.getCalculationTypeArabic(calculation.type)}`,
                time: this.formatTimeAgo(new Date(calculation.createdAt))
            });
        });

        // نشاط تسجيل الدخول
        activities.push({
            icon: 'fas fa-sign-in-alt',
            title: 'تسجيل الدخول إلى المنصة',
            time: this.formatTimeAgo(new Date(this.currentUser.registrationDate))
        });

        return activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    // دوال مساعدة
    getStatusBadge(status) {
        const statuses = {
            'pending': { text: 'في الانتظار', class: 'status-pending' },
            'in_progress': { text: 'قيد التنفيذ', class: 'status-in-progress' },
            'completed': { text: 'مكتمل', class: 'status-completed' },
            'cancelled': { text: 'ملغي', class: 'status-cancelled' }
        };

        const statusInfo = statuses[status] || statuses.pending;
        return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
    }

    getServiceTypeArabic(type) {
        const types = {
            'maintenance': 'صيانة وقائية',
            'repair': 'إصلاح عطل',
            'installation': 'تركيب',
            'consultation': 'استشارة'
        };
        return types[type] || type;
    }

    getCalculationTypeArabic(type) {
        const types = {
            'btu': 'BTU',
            'cfm': 'CFM',
            'ach': 'ACH',
            'duct': 'مجاري الهواء',
            'energy': 'الطاقة'
        };
        return types[type] || type;
    }

    getUserTypeArabic(type) {
        const types = {
            'client': 'عميل',
            'technician': 'فني',
            'engineer': 'مهندس',
            'admin': 'مدير'
        };
        return types[type] || type;
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        if (diffDays < 7) return `منذ ${diffDays} يوم`;
        
        return date.toLocaleDateString('ar-SA');
    }

    loadCalculationsContent() {
        // سيتم تطوير هذا لاحقاً
        ColdCloud.showNotification('قسم الحسابات قيد التطوير', 'info');
    }

    loadOverviewContent() {
        this.loadServicesContent();
        this.loadActivityContent();
    }
}

// دوال عامة للاستخدام في HTML
function viewService(serviceId) {
    ColdCloud.showNotification('عرض تفاصيل الخدمة - قيد التطوير', 'info');
}

function showProfile() {
    ColdCloud.showNotification('الملف الشخصي - قيد التطوير', 'info');
}

// جعل الدالة متاحة عالمياً للتحديث
window.updateDashboard = function(user) {
    if (window.dashboardManager) {
        window.dashboardManager.currentUser = user;
        window.dashboardManager.updateUI();
        window.dashboardManager.loadDashboardData();
    }
};

// تهيئة لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    if (window.authSystem?.getCurrentUser()) {
        window.dashboardManager = new DashboardManager();
    }
});
