// وظائف JavaScript للأدوات الحسابية
class CalculationsManager {
    constructor() {
        this.calculationHistory = [];
        this.currentResults = null;
        this.init();
    }

    init() {
        this.setupCalculationTabs();
        this.setupEventListeners();
        this.loadCalculationHistory();
    }

    setupCalculationTabs() {
        const calcTabs = document.querySelectorAll('.calc-tab');
        const calcSections = document.querySelectorAll('.calculator-section');

        calcTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const calcType = tab.getAttribute('data-calc');
                
                // إزالة النشاط من جميع الألسنة
                calcTabs.forEach(t => t.classList.remove('active'));
                calcSections.forEach(s => s.classList.remove('active'));
                
                // إضافة النشاط للسان والقطعة المختارة
                tab.classList.add('active');
                document.getElementById(`${calcType}-calc`).classList.add('active');
            });
        });
    }

    setupEventListeners() {
        // إضافة مستمعي الأحداث للحقول المدخلة
        const numberInputs = document.querySelectorAll('input[type="number"]');
        numberInputs.forEach(input => {
            input.addEventListener('input', this.validateNumberInput.bind(this));
        });
    }

    validateNumberInput(e) {
        const input = e.target;
        const value = parseFloat(input.value);
        
        if (value < 0) {
            input.value = Math.abs(value);
        }
        
        if (input.min && value < parseFloat(input.min)) {
            input.value = input.min;
        }
        
        if (input.max && value > parseFloat(input.max)) {
            input.value = input.max;
        }
    }

    // حاسبة BTU
    calculateBTU() {
        const length = parseFloat(document.getElementById('roomLength').value) || 0;
        const width = parseFloat(document.getElementById('roomWidth').value) || 0;
        const height = parseFloat(document.getElementById('roomHeight').value) || 0;
        const roomType = document.getElementById('roomType').value;
        const occupants = parseInt(document.getElementById('occupants').value) || 1;
        const climate = document.getElementById('climate').value;
        const sunExposure = document.getElementById('sunExposure').value;
        const insulation = document.getElementById('insulation').value;

        if (!length || !width || !height) {
            ColdCloud.showNotification('الرجاء إدخال جميع الأبعاد', 'error');
            return;
        }

        // حساب الحجم بالمتر المكعب
        const volume = length * width * height;

        // عوامل التصحيح
        const roomMultipliers = {
            living: 1.2,
            bedroom: 1.0,
            kitchen: 1.4,
            office: 1.1,
            commercial: 1.5
        };

        const climateMultipliers = {
            hot: 1.2,
            moderate: 1.0,
            cold: 0.8
        };

        const sunMultipliers = {
            low: 0.9,
            medium: 1.0,
            high: 1.1
        };

        const insulationMultipliers = {
            poor: 1.2,
            average: 1.0,
            good: 0.8
        };

        const baseBTU = volume * 100; // قاعدة 100 BTU لكل متر مكعب
        const roomFactor = roomMultipliers[roomType] || 1.0;
        const climateFactor = climateMultipliers[climate] || 1.0;
        const sunFactor = sunMultipliers[sunExposure] || 1.0;
        const insulationFactor = insulationMultipliers[insulation] || 1.0;
        const occupantsBTU = occupants * 600; // 600 BTU لكل شخص

        const totalBTU = Math.round(
            baseBTU * roomFactor * climateFactor * sunFactor * insulationFactor + occupantsBTU
        );

        const tonnage = Math.round((totalBTU / 12000) * 10) / 10; // 1 طن = 12,000 BTU

        // عرض النتائج
        this.displayBTUResults(totalBTU, tonnage, volume);
        this.saveCalculation('btu', { totalBTU, tonnage, volume, roomType });
    }

    displayBTUResults(btu, tonnage, volume) {
        document.getElementById('btuResult').textContent = `${btu.toLocaleString()} BTU`;
        document.getElementById('tonnageResult').textContent = `${tonnage} طن`;

        // توليد التوصيات
        const recommendations = this.generateBTURecommendations(btu, tonnage, volume);
        document.getElementById('btuRecommendations').textContent = recommendations;

        // إظهار قسم النتائج
        document.getElementById('btuResults').classList.add('active');
    }

    generateBTURecommendations(btu, tonnage, volume) {
        let recommendations = `لمساحة ${volume.toLocaleString()} متر مكعب، نوصي بـ:`;

        if (tonnage <= 1) {
            recommendations += " وحدة تكييف منفصلة سعة 1 طن أو نظام ميني سبليت.";
        } else if (tonnage <= 3) {
            recommendations += " نظام تكييف مركزي صغير أو عدة وحدات منفصلة.";
        } else if (tonnage <= 5) {
            recommendations += " نظام تكييف مركزي متوسط السعة مع توزيع هواء مناسب.";
        } else {
            recommendations += " نظام تكييف مركزي عالي السعة مع تصميم متخصص للمجاري الهوائية.";
        }

        recommendations += " يرجى استشارة فني متخصص للتحقق من الحسابات وتصميم النظام المناسب.";

        return recommendations;
    }

    // حاسبة CFM
    calculateCFM() {
        const volume = parseFloat(document.getElementById('cfmVolume').value) || 0;
        const airChanges = parseFloat(document.getElementById('airChanges').value) || 6;
        const roomUsage = document.getElementById('roomUsage').value;

        if (!volume) {
            ColdCloud.showNotification('الرجاء إدخال حجم الغرفة', 'error');
            return;
        }

        // معدلات تغيير الهواء الموصى بها حسب استخدام الغرفة
        const achRates = {
            residential: 4,
            office: 6,
            commercial: 8,
            industrial: 12
        };

        const recommendedACH = achRates[roomUsage] || 6;
        const actualACH = airChanges || recommendedACH;

        // حساب CFM
        const cfm = Math.round((volume * actualACH) / 60);

        this.displayCFMResults(cfm, actualACH);
        this.saveCalculation('cfm', { cfm, volume, airChanges: actualACH, roomUsage });
    }

    displayCFMResults(cfm, ach) {
        document.getElementById('cfmResult').textContent = `${cfm.toLocaleString()} CFM`;
        document.getElementById('cfmResults').classList.add('active');

        ColdCloud.showNotification(`تم حساب معدل تدفق الهواء: ${cfm} CFM (بمعدل ${ach} تغييرات هواء في الساعة)`, 'success');
    }

    // حاسبة ACH
    calculateACH() {
        const cfm = parseFloat(document.getElementById('achCFM').value) || 0;
        const volume = parseFloat(document.getElementById('achVolume').value) || 0;

        if (!cfm || !volume) {
            ColdCloud.showNotification('الرجاء إدخال قيم CFM والحجم', 'error');
            return;
        }

        const ach = Math.round((cfm * 60) / volume * 10) / 10;

        this.displayACHResults(ach);
        this.saveCalculation('ach', { ach, cfm, volume });
    }

    displayACHResults(ach) {
        document.getElementById('achResult').textContent = `${ach} ACH`;
        document.getElementById('achResults').classList.add('active');

        // تقييم معدل تغيير الهواء
        let evaluation = '';
        if (ach < 4) {
            evaluation = 'منخفض - قد لا يكون كافياً للتهوية الجيدة';
        } else if (ach <= 6) {
            evaluation = 'مثالي للمساحات السكنية';
        } else if (ach <= 10) {
            evaluation = 'جيد للمساحات التجارية';
        } else {
            evaluation = 'مرتفع - مناسب للمساحات الصناعية';
        }

        ColdCloud.showNotification(`معدل تغيير الهواء: ${ach} - ${evaluation}`, 'info');
    }

    // حاسبة مقاسات المجاري
    calculateDuctSize() {
        const cfm = parseFloat(document.getElementById('ductCFM').value) || 0;
        const velocity = parseFloat(document.getElementById('airVelocity').value) || 900;

        if (!cfm) {
            ColdCloud.showNotification('الرجاء إدخال قيمة CFM', 'error');
            return;
        }

        // حساب مساحة المقطع العرضي
        const area = cfm / velocity; // قدم مربع
        const areaCm = area * 929.03; // تحويل إلى سم مربع

        // حساب القطر للمجاري الدائرية
        const diameterInches = Math.sqrt((area * 144 * 4) / Math.PI);
        const diameterMm = diameterInches * 25.4;

        // حساب الأبعاد للمجاري المستطيلة
        const aspectRatio = 1.5; // نسبة الطول إلى العرض
        const widthInches = Math.sqrt(area * 144 / aspectRatio);
        const heightInches = widthInches * aspectRatio;

        this.displayDuctResults(area, diameterInches, diameterMm, widthInches, heightInches);
        this.saveCalculation('duct', { cfm, velocity, area, diameterInches, diameterMm });
    }

    displayDuctResults(area, diameterInches, diameterMm, widthInches, heightInches) {
        const resultsHTML = `
            <div class="result-card">
                <div class="result-value">${area.toFixed(2)} قدم²</div>
                <div class="result-label">مساحة المقطع العرضي</div>
            </div>
            <div class="result-card">
                <div class="result-value">${Math.round(diameterInches)} بوصة</div>
                <div class="result-label">القطر (مجاري دائرية)</div>
            </div>
            <div class="result-card">
                <div class="result-value">${Math.round(diameterMm)} مم</div>
                <div class="result-label">القطر بالمليمتر</div>
            </div>
            <div class="result-card">
                <div class="result-value">${Math.round(widthInches)} × ${Math.round(heightInches)} بوصة</div>
                <div class="result-label">الأبعاد (مجاري مستطيلة)</div>
            </div>
        `;

        document.getElementById('ductResults').innerHTML = resultsHTML;
        document.getElementById('ductResults').classList.add('active');
    }

    // وظائف إدارة سجل الحسابات
    saveCalculation(type, data) {
        const calculation = {
            id: Date.now(),
            type: type,
            data: data,
            timestamp: new Date().toLocaleString('ar-SA')
        };

        this.calculationHistory.unshift(calculation);
        this.updateCalculationHistory();
        this.saveToLocalStorage();
    }

    updateCalculationHistory() {
        // تحديث واجهة سجل الحسابات
        const historyElements = {
            btu: document.getElementById('btuHistory'),
            cfm: document.getElementById('cfmHistory'),
            ach: document.getElementById('achHistory'),
            duct: document.getElementById('ductHistory')
        };

        for (const [type, element] of Object.entries(historyElements)) {
            if (element) {
                const typeCalculations = this.calculationHistory.filter(calc => calc.type === type);
                element.innerHTML = typeCalculations.slice(0, 5).map(calc => 
                    this.createHistoryRow(calc)
                ).join('');
            }
        }
    }

    createHistoryRow(calculation) {
        const { type, data, timestamp } = calculation;
        
        switch (type) {
            case 'btu':
                return `
                    <tr>
                        <td>${timestamp}</td>
                        <td>${data.volume} م³</td>
                        <td>${this.getRoomTypeName(data.roomType)}</td>
                        <td>${data.totalBTU.toLocaleString()} BTU</td>
                        <td>${data.tonnage} طن</td>
                    </tr>
                `;
            case 'cfm':
                return `
                    <tr>
                        <td>${timestamp}</td>
                        <td>${data.volume} قدم³</td>
                        <td>${data.airChanges} ACH</td>
                        <td>${data.cfm.toLocaleString()} CFM</td>
                        <td>${this.getRoomUsageName(data.roomUsage)}</td>
                    </tr>
                `;
            default:
                return '';
        }
    }

    getRoomTypeName(type) {
        const names = {
            living: 'غرفة معيشة',
            bedroom: 'غرفة نوم',
            kitchen: 'مطبخ',
            office: 'مكتب',
            commercial: 'تجاري'
        };
        return names[type] || type;
    }

    getRoomUsageName(usage) {
        const names = {
            residential: 'سكني',
            office: 'مكتب',
            commercial: 'تجاري',
            industrial: 'صناعي'
        };
        return names[usage] || usage;
    }

    loadCalculationHistory() {
        const savedHistory = localStorage.getItem('calculationHistory');
        if (savedHistory) {
            this.calculationHistory = JSON.parse(savedHistory);
            this.updateCalculationHistory();
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('calculationHistory', JSON.stringify(this.calculationHistory));
    }

    // وظائف مساعدة
    resetBTUForm() {
        document.getElementById('btuForm').reset();
        document.getElementById('btuResults').classList.remove('active');
    }

    resetCFMForm() {
        document.getElementById('cfmForm').reset();
        document.getElementById('cfmResults').classList.remove('active');
    }

    exportCalculations() {
        const dataStr = JSON.stringify(this.calculationHistory, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'calculations-history.json';
        link.click();
        
        ColdCloud.showNotification('تم تصدير سجل الحسابات', 'success');
    }

    clearHistory() {
        if (confirm('هل أنت متأكد من رغبتك في مسح سجل الحسابات؟')) {
            this.calculationHistory = [];
            this.updateCalculationHistory();
            this.saveToLocalStorage();
            ColdCloud.showNotification('تم مسح سجل الحسابات', 'success');
        }
    }
}

// تهيئة مدير الحسابات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.calculationsManager = new CalculationsManager();
});

// وظائف عامة للحاسبات
function calculateBTU() {
    window.calculationsManager.calculateBTU();
}

function calculateCFM() {
    window.calculationsManager.calculateCFM();
}

function calculateACH() {
    window.calculationsManager.calculateACH();
}

function calculateDuctSize() {
    window.calculationsManager.calculateDuctSize();
}

function resetBTUForm() {
    window.calculationsManager.resetBTUForm();
}

function resetCFMForm() {
    window.calculationsManager.resetCFMForm();
}
