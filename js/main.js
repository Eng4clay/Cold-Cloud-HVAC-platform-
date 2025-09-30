// كود JavaScript الرئيسي للموقع
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة جميع المكونات
    initNavigation();
    initAnimations();
    initForms();
    initScrollEffects();
});

// إدارة شريط التنقل
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // إغلاق القائمة عند النقر على رابط
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // التنقل السلس
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // إذا كان الرابط يشير إلى قسم في نفس الصفحة
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// إدارة الأنيميشن
function initAnimations() {
    // تأثير التمرير على الهيدر
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'var(--background)';
            header.style.backdropFilter = 'none';
        }
    });

    // إضافة تأثيرات للكروت
    const cards = document.querySelectorAll('.feature-card, .service-card, .library-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // تأثيرات للأزرار
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// إدارة النماذج
function initForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // هنا يمكن إضافة منطق إرسال النموذج
            const formData = new FormData(this);
            const formValues = Object.fromEntries(formData.entries());
            
            console.log('بيانات النموذج:', formValues);
            
            // عرض رسالة نجاح
            showNotification('تم إرسال الطلب بنجاح!', 'success');
            
            // إعادة تعيين النموذج
            this.reset();
        });
    });
}

// تأثيرات التمرير
function initScrollEffects() {
    // ظهور العناصر عند التمرير
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // مراقبة العناصر التي نريد إضافة تأثير لها
    const animatedElements = document.querySelectorAll('.feature-card, .service-card, .library-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// وظيفة لعرض الإشعارات
function showNotification(message, type = 'info') {
    // إنصراف عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // إضافة التنسيقات
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // إخفاء الإشعار بعد 5 ثوان
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// وظائف مساعدة للإشعارات
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#0ea5e9'
    };
    return colors[type] || '#0ea5e9';
}

// وظائف عامة
function formatPhoneNumber(phone) {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// تصدير الوظائف للاستخدام في ملفات أخرى
window.ColdCloud = {
    showNotification,
    formatPhoneNumber,
    validateEmail
};
} 
// تحديث نظام التنقل بناءً على حالة المصادقة
function updateNavigation() {
    const authSystem = window.authSystem;
    if (!authSystem) return;

    const currentUser = authSystem.getCurrentUser();
    const navButtons = document.querySelector('.nav-buttons');
    const userMenu = document.querySelector('.user-menu');

    if (currentUser && navButtons && userMenu) {
        navButtons.style.display = 'none';
        userMenu.style.display = 'flex';
        
        // تحديث اسم المستخدم
        const userNameElement = userMenu.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        }
    } else if (navButtons && userMenu) {
        navButtons.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}

// تحديث التنقل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateNavigation, 100);
});
