// وظائف JavaScript لإدارة الخدمات
class ServicesManager {
    constructor() {
        this.services = [];
        this.init();
    }

    init() {
        this.loadServices();
        this.setupEventListeners();
        this.setupServiceRequestForm();
    }

    loadServices() {
        // محاكاة بيانات الخدمات
        this.services = [
            {
                id: 1,
                type: 'maintenance',
                title: 'الصيانة الوقائية',
                description: 'برامج صيانة دورية للحفاظ على كفاءة الأنظمة',
                features: ['فحص دوري شامل', 'تنظيف وتركيب القطع', 'تقارير أداء مفصلة'],
                plans: [
                    {
                        name: 'الباقة الأساسية',
                        price: 500,
                        features: ['4 زيارات صيانة سنوية', 'فحص شامل للأجهزة', 'تنظيف الفلاتر', 'تقرير فني مفصل']
                    },
                    {
                        name: 'الباقة المتقدمة',
                        price: 800,
                        features: ['6 زيارات صيانة سنوية', 'فحص شامل ومتقدم', 'تنظيف كامل للنظام', 'أولوية في خدمة الطوارئ', 'تقارير أداء شهرية'],
                        featured: true
                    },
                    {
                        name: 'الباقة الشاملة',
                        price: 1200,
                        features: ['12 زيارة صيانة سنوية', 'فحص شامل ومتقدم', 'صيانة وقائية كاملة', 'أولوية مطلقة في الخدمة', 'تقارير أداء أسبوعية', 'خدمة الطوارئ مجانية']
                    }
                ]
            },
            {
                id: 2,
                type: 'repair',
                title: 'إصلاح الأعطال',
                description: 'خدمات إصلاح سريعة ومهنية للطوارئ والأعطال المفاجئة',
                features: ['طوارئ 24/7', 'فنيون متخصصون', 'قطع غيار أصلية']
            }
        ];
    }

    setupEventListeners() {
        // التنقل بين أقسام الخدمات
        const serviceLinks = document.querySelectorAll('a[href^="#"]');
        serviceLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToService(targetId);
            });
        });

        // اختيار باقات الصيانة
        const planButtons = document.querySelectorAll('.plan-card .btn');
        planButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.selectMaintenancePlan(e.target);
            });
        });

        // نموذج طلب الخدمة
        const serviceForm = document.getElementById('serviceRequestForm');
        if (serviceForm) {
            serviceForm.addEventListener('submit', (e) => {
                this.handleServiceRequest(e);
            });
        }
    }

    setupServiceRequestForm() {
        const serviceTypeSelect = document.getElementById('serviceType');
        if (serviceTypeSelect) {
            serviceTypeSelect.addEventListener('change', (e) => {
                this.updateServiceForm(e.target.value);
            });
        }
    }

    scrollToService(serviceId) {
        const element = document.getElementById(serviceId);
        if (element) {
            const offsetTop = element.offsetTop - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    selectMaintenancePlan(button) {
        const planCard = button.closest('.plan-card');
        const planName = planCard.querySelector('h4').textContent;
        
        // إزالة التحديد من جميع الباقات
        document.querySelectorAll('.plan-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // إضافة التحديد للباقة المختارة
        planCard.classList.add('selected');
        
        ColdCloud.showNotification(`تم اختيار ${planName}`, 'success');
    }

    updateServiceForm(serviceType) {
        // تحديث النموذج بناءً على نوع الخدمة المختار
        const form = document.getElementById('serviceRequestForm');
        const additionalFields = form.querySelector('.additional-fields');
        
        if (additionalFields) {
            additionalFields.remove();
        }

        let newFields = '';
        
        switch (serviceType) {
            case 'maintenance':
                newFields = `
                    <div class="additional-fields">
                        <div class="form-group">
                            <label for="maintenanceType">نوع الصيانة</label>
                            <select id="maintenanceType" required>
                                <option value="basic">أساسية</option>
                                <option value="comprehensive">شاملة</option>
                                <option value="emergency">طارئة</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="frequency">التكرار</label>
                            <select id="frequency" required>
                                <option value="monthly">شهري</option>
                                <option value="quarterly">ربع سنوي</option>
                                <option value="biannual">نصف سنوي</option>
                                <option value="annual">سنوي</option>
                            </select>
                        </div>
                    </div>
                `;
                break;
                
            case 'repair':
                newFields = `
                    <div class="additional-fields">
                        <div class="form-group">
                            <label for="issueType">نوع العطل</label>
                            <select id="issueType" required>
                                <option value="electrical">كهربائي</option>
                                <option value="mechanical">ميكانيكي</option>
                                <option value="cooling">تبريد</option>
                                <option value="other">أخرى</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="urgency">درجة الاستعجال</label>
                            <select id="urgency" required>
                                <option value="low">منخفض</option>
                                <option value="medium">متوسط</option>
                                <option value="high">عالي</option>
                                <option value="emergency">طارئ</option>
                            </select>
                        </div>
                    </div>
                `;
                break;
                
            case 'installation':
                newFields = `
                    <div class="additional-fields">
                        <div class="form-group">
                            <label for="systemType">نوع النظام</label>
                            <select id="systemType" required>
                                <option value="split">منفصل</option>
                                <option value="central">مركزي</option>
                                <option value="vrv">VRV/VRF</option>
                                <option value="package">مجمعة</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="capacity">السعة (طن)</label>
                            <input type="number" id="capacity" min="1" max="100" required>
                        </div>
                    </div>
                `;
                break;
        }
        
        form.insertAdjacentHTML('beforeend', newFields);
    }

    handleServiceRequest(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const requestData = {
            serviceType: formData.get('serviceType'),
            name: formData.get('name'),
            phone: formData.get('phone'),
            location: formData.get('location'),
            additionalInfo: this.getAdditionalFormData()
        };
        
        // محاكاة إرسال الطلب
        this.submitServiceRequest(requestData);
    }

    getAdditionalFormData() {
        const data = {};
        const additionalFields = document.querySelectorAll('.additional-fields input, .additional-fields select');
        
        additionalFields.forEach(field => {
            data[field.id] = field.value;
        });
        
        return data;
    }

    submitServiceRequest(requestData) {
        // محاكاة إرسال الطلب إلى الخادم
        console.log('إرسال طلب خدمة:', requestData);
        
        // عرض رسالة نجاح
        ColdCloud.showNotification('تم إرسال طلب الخدمة بنجاح! سيتصل بك فريقنا قريباً.', 'success');
        
        // إعادة تعيين النموذج
        document.getElementById('serviceRequestForm').reset();
        
        // إعادة توجيه إلى لوحة التحكم بعد 3 ثوان
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 3000);
    }

    // وظائف إضافية لإدارة الخدمات
    getServiceById(id) {
        return this.services.find(service => service.id === id);
    }

    getServicesByType(type) {
        return this.services.filter(service => service.type === type);
    }

    calculateMaintenanceCost(plan, additionalServices = []) {
        let totalCost = plan.price;
        
        additionalServices.forEach(service => {
            totalCost += service.cost || 0;
        });
        
        return totalCost;
    }

    scheduleMaintenance(plan, startDate, frequency) {
        const schedule = {
            plan: plan,
            startDate: new Date(startDate),
            frequency: frequency,
            nextService: this.calculateNextServiceDate(startDate, frequency)
        };
        
        return schedule;
    }

    calculateNextServiceDate(startDate, frequency) {
        const date = new Date(startDate);
        
        switch (frequency) {
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'quarterly':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'biannual':
                date.setMonth(date.getMonth() + 6);
                break;
            case 'annual':
                date.setFullYear(date.getFullYear() + 1);
                break;
        }
        
        return date;
    }
}

// تهيئة مدير الخدمات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.servicesManager = new ServicesManager();
});

// وظائف مساعدة للخدمات
function requestEmergencyService() {
    const phoneNumber = "920012345";
    ColdCloud.showNotification(`اتصل بنا على: ${phoneNumber} للخدمات الطارئة`, 'info');
}

function downloadServiceCatalog() {
    // محاكاة تحميل الكتالوج
    ColdCloud.showNotification('جاري تحميل كتالوج الخدمات...', 'info');
    
    setTimeout(() => {
        ColdCloud.showNotification('تم تحميل الكتالوج بنجاح!', 'success');
    }, 2000);
}

function scheduleCallback() {
    const name = prompt('الاسم الكامل:');
    const phone = prompt('رقم الهاتف:');
    const preferredTime = prompt('الوقت المفضل للاتصال:');
    
    if (name && phone) {
        ColdCloud.showNotification('سيقوم فريقنا بالاتصال بك في الوقت المحدد!', 'success');
    }
}
