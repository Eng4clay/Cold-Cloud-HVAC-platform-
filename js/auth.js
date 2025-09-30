// نظام إدارة المستخدمين والمصادقة
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.init();
    }

    init() {
        this.loadUsers();
        this.checkAuthState();
        this.setupEventListeners();
    }

    loadUsers() {
        const savedUsers = localStorage.getItem('coldCloudUsers');
        const savedAuth = localStorage.getItem('coldCloudAuth');
        
        if (savedUsers) {
            this.users = JSON.parse(savedUsers);
        } else {
            // بيانات تجريبية افتراضية
            this.users = [
                {
                    id: 1,
                    firstName: 'أحمد',
                    lastName: 'محمد',
                    email: 'ahmed@example.com',
                    password: '123456',
                    phone: '+966500000001',
                    company: 'شركة التقنية المثالية',
                    userType: 'client',
                    registrationDate: new Date().toISOString(),
                    avatar: '👤',
                    services: [1, 2],
                    calculations: [1, 2, 3]
                }
            ];
            this.saveUsers();
        }

        if (savedAuth) {
            this.currentUser = JSON.parse(savedAuth);
            this.updateUI();
        }
    }

    saveUsers() {
        localStorage.setItem('coldCloudUsers', JSON.stringify(this.users));
    }

    saveAuth() {
        if (this.currentUser) {
            localStorage.setItem('coldCloudAuth', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('coldCloudAuth');
        }
    }

    // تسجيل مستخدم جديد
    register(userData) {
        return new Promise((resolve, reject) => {
            // التحقق من وجود المستخدم مسبقاً
            const existingUser = this.users.find(u => u.email === userData.email);
            if (existingUser) {
                reject('البريد الإلكتروني مسجل مسبقاً');
                return;
            }

            // إنشاء مستخدم جديد
            const newUser = {
                id: Date.now(),
                ...userData,
                registrationDate: new Date().toISOString(),
                avatar: '👤',
                services: [],
                calculations: [],
                isActive: true
            };

            this.users.push(newUser);
            this.saveUsers();

            // تسجيل الدخول تلقائياً
            this.login(userData.email, userData.password)
                .then(resolve)
                .catch(reject);
        });
    }

    // تسجيل الدخول
    login(email, password) {
        return new Promise((resolve, reject) => {
            const user = this.users.find(u => 
                u.email === email && u.password === password && u.isActive !== false
            );

            if (user) {
                this.currentUser = user;
                this.saveAuth();
                this.updateUI();
                resolve(user);
            } else {
                reject('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            }
        });
    }

    // تسجيل الخروج
    logout() {
        this.currentUser = null;
        this.saveAuth();
        this.updateUI();
        window.location.href = 'index.html';
    }

    // تحديث واجهة المستخدم بناءً على حالة التسجيل
    updateUI() {
        const navButtons = document.querySelector('.nav-buttons');
        const userMenu = document.querySelector('.user-menu');
        
        if (this.currentUser && navButtons && userMenu) {
            navButtons.style.display = 'none';
            userMenu.style.display = 'flex';
            
            // تحديث اسم المستخدم
            const userNameElement = userMenu.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            }
        } else if (navButtons && userMenu) {
            navButtons.style.display = 'flex';
            userMenu.style.display = 'none';
        }

        // تحديث لوحة التحكم إذا كانت مفتوحة
        if (window.updateDashboard && this.currentUser) {
            window.updateDashboard(this.currentUser);
        }
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // منع السلوك الافتراضي لأزرار Google/Microsoft
        const socialButtons = document.querySelectorAll('.social-btn');
        socialButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                ColdCloud.showNotification('هذه الخدمة قيد التطوير حالياً', 'info');
            });
        });
    }

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        return this.currentUser;
    }

    // تحديث بيانات المستخدم
    updateUserProfile(updatedData) {
        if (!this.currentUser) return false;

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updatedData };
            this.currentUser = this.users[userIndex];
            this.saveUsers();
            this.saveAuth();
            return true;
        }
        return false;
    }

    // إضافة خدمة للمستخدم
    addUserService(serviceData) {
        if (!this.currentUser) return false;

        const service = {
            id: Date.now(),
            ...serviceData,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        this.currentUser.services.push(service.id);
        this.updateUserProfile(this.currentUser);
        
        // حفظ الخدمة في التخزين
        this.saveService(service);
        return service.id;
    }

    // إضافة حساب للمستخدم
    addUserCalculation(calculationData) {
        if (!this.currentUser) return false;

        const calculation = {
            id: Date.now(),
            ...calculationData,
            createdAt: new Date().toISOString()
        };

        this.currentUser.calculations.push(calculation.id);
        this.updateUserProfile(this.currentUser);
        
        // حفظ الحساب في التخزين
        this.saveCalculation(calculation);
        return calculation.id;
    }

    // حفظ الخدمة
    saveService(service) {
        const services = this.getServices();
        services.push(service);
        localStorage.setItem('coldCloudServices', JSON.stringify(services));
    }

    // حفظ الحساب
    saveCalculation(calculation) {
        const calculations = this.getCalculations();
        calculations.push(calculation);
        localStorage.setItem('coldCloudCalculations', JSON.stringify(calculations));
    }

    // الحصول على خدمات المستخدم
    getUserServices() {
        if (!this.currentUser) return [];
        const allServices = this.getServices();
        return allServices.filter(service => 
            this.currentUser.services.includes(service.id)
        );
    }

    // الحصول على حسابات المستخدم
    getUserCalculations() {
        if (!this.currentUser) return [];
        const allCalculations = this.getCalculations();
        return allCalculations.filter(calculation => 
            this.currentUser.calculations.includes(calculation.id)
        );
    }

    // الحصول على جميع الخدمات
    getServices() {
        const saved = localStorage.getItem('coldCloudServices');
        return saved ? JSON.parse(saved) : [];
    }

    // الحصول على جميع الحسابات
    getCalculations() {
        const saved = localStorage.getItem('coldCloudCalculations');
        return saved ? JSON.parse(saved) : [];
    }
}

// تهيئة نظام المصادقة
document.addEventListener('DOMContentLoaded', function() {
    window.authSystem = new AuthSystem();
});

// دوال مساعدة للمصادقة
function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        company: formData.get('company') || '',
        userType: formData.get('userType')
    };

    // التحقق من كلمة المرور
    if (userData.password !== formData.get('confirmPassword')) {
        ColdCloud.showNotification('كلمات المرور غير متطابقة', 'error');
        return;
    }

    // التحقق من الشروط
    if (!formData.get('agreeTerms')) {
        ColdCloud.showNotification('يجب الموافقة على الشروط والأحكام', 'error');
        return;
    }

    window.authSystem.register(userData)
        .then((user) => {
            ColdCloud.showNotification(`مرحباً ${user.firstName}! تم إنشاء حسابك بنجاح`, 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        })
        .catch((error) => {
            ColdCloud.showNotification(error, 'error');
        });
}

function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');

    window.authSystem.login(email, password)
        .then((user) => {
            ColdCloud.showNotification(`مرحباً بعودتك ${user.firstName}!`, 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        })
        .catch((error) => {
            ColdCloud.showNotification(error, 'error');
        });
}

function handleLogout() {
    window.authSystem.logout();
    ColdCloud.showNotification('تم تسجيل الخروج بنجاح', 'success');
}
