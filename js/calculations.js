// وظائف JavaScript للأدوات الحسابية - النسخة الكاملة والمصححة
class CalculationsManager {
    constructor() {
        this.calculationHistory = [];
        this.currentResults = null;
        this.init();
    }

    init() {
        this.setupCalculationTabs();
        this.setupEventListeners();
        this.setupDuctTypeToggle();
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

        // إضافة مستمعي الأحداث لأزرار الحساب
        document.getElementById('ductType')?.addEventListener('change', (e) => {
            this.toggleAspectRatio(e.target.value);
        });
    }

    setupDuctTypeToggle() {
        this.toggleAspectRatio('round'); // تعيين الافتراضي
    }

    toggleAspectRatio(ductType) {
        const aspectRatioGroup = document.getElementById('aspectRatioGroup');
        if (aspectRatioGroup) {
            if (ductType === 'rectangular') {
                aspectRatioGroup.style.display = 'flex';
            } else {
                aspectRatioGroup.style.display = 'none';
            }
        }
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

    // حاسبة BTU - عاملة ✔️
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
        this.saveCalculation('btu', { 
            totalBTU, 
            tonnage, 
            volume, 
            roomType,
            dimensions: { length, width, height }
        });
    }

    displayBTUResults(btu, tonnage, volume) {
        document.getElementById('btuResult').textContent = `${btu.toLocaleString()} BTU`;
        document.getElementById('tonnageResult').textContent = `${tonnage} طن`;

        // توليد التوصيات
        const recommendations = this.generateBTURecommendations(btu, tonnage, volume);
        document.getElementById('btuRecommendations').textContent = recommendations;

        // إظهار قسم النتائج
        document.getElementById('btuResults').classList.add('active');
        
        ColdCloud.showNotification(`تم حساب احتياجات التبريد: ${btu.toLocaleString()} BTU`, 'success');
    }

    generateBTURecommendations(btu, tonnage, volume) {
        let recommendations = `لمساحة ${volume.toLocaleString()} متر مكعب، نوصي بـ: `;

        if (tonnage <= 1) {
            recommendations += "وحدة تكييف منفصلة سعة 1 طن أو نظام ميني سبليت.";
        } else if (tonnage <= 3) {
            recommendations += "نظام تكييف مركزي صغير أو عدة وحدات منفصلة.";
        } else if (tonnage <= 5) {
            recommendations += "نظام تكييف مركزي متوسط السعة مع توزيع هواء مناسب.";
        } else {
            recommendations += "نظام تكييف مركزي عالي السعة مع تصميم متخصص للمجاري الهوائية.";
        }

        recommendations += " يرجى استشارة فني متخصص للتحقق من الحسابات وتصميم النظام المناسب.";

        return recommendations;
    }

    // حاسبة CFM - عاملة ✔️
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

        this.displayCFMResults(cfm, actualACH, volume);
        this.saveCalculation('cfm', { 
            cfm, 
            volume, 
            airChanges: actualACH, 
            roomUsage 
        });
    }

    displayCFMResults(cfm, ach, volume) {
        document.getElementById('cfmResult').textContent = `${cfm.toLocaleString()} CFM`;
        document.getElementById('cfmResults').classList.add('active');

        ColdCloud.showNotification(`تم حساب معدل تدفق الهواء: ${cfm} CFM (بمعدل ${ach} تغييرات هواء في الساعة)`, 'success');
    }

    // حاسبة ACH - مُصلحة الآن ✔️
    calculateACH() {
        const cfm = parseFloat(document.getElementById('achCFM').value) || 0;
        const volume = parseFloat(document.getElementById('achVolume').value) || 0;
        const roomType = document.getElementById('achRoomType').value;

        if (!cfm || !volume) {
            ColdCloud.showNotification('الرجاء إدخال قيم CFM والحجم', 'error');
            return;
        }

        // حساب ACH
        const ach = Math.round((cfm * 60) / volume * 10) / 10;

        // تقييم المعدل
        const evaluation = this.evaluateACH(ach, roomType);

        this.displayACHResults(ach, evaluation, cfm, volume);
        this.saveCalculation('ach', { 
            ach, 
            cfm, 
            volume, 
            roomType,
            evaluation 
        });
    }

    evaluateACH(ach, roomType) {
        const standards = {
            residential: { min: 4, max: 6, ideal: 5 },
            office: { min: 6, max: 8, ideal: 7 },
            commercial: { min: 8, max: 12, ideal: 10 },
            medical: { min: 12, max: 20, ideal: 15 },
            industrial: { min: 20, max: 30, ideal: 25 }
        };

        const standard = standards[roomType] || standards.residential;

        if (ach < standard.min) {
            return { level: 'منخفض', description: 'معدل غير كافٍ للتهوية', color: '#ef4444' };
        } else if (ach <= standard.max) {
            return { level: 'مثالي', description: 'معدل ممتاز للتهوية', color: '#10b981' };
        } else {
            return { level: 'مرتفع', description: 'معدل عالي قد يستهلك طاقة إضافية', color: '#f59e0b' };
        }
    }

    displayACHResults(ach, evaluation, cfm, volume) {
        document.getElementById('achResult').textContent = `${ach} ACH`;
        document.getElementById('achEvaluation').innerHTML = 
            `<span style="color: ${evaluation.color}">${evaluation.level} - ${evaluation.description}</span>`;
        document.getElementById('achResults').classList.add('active');

        ColdCloud.showNotification(`معدل تغيير الهواء: ${ach} ACH - ${evaluation.level}`, 'info');
    }

    // حاسبة المجاري - مُصلحة الآن ✔️
    calculateDuctSize() {
        const cfm = parseFloat(document.getElementById('ductCFM').value) || 0;
        const velocity = parseFloat(document.getElementById('airVelocity').value) || 900;
        const ductType = document.getElementById('ductType').value;
        const aspectRatio = parseFloat(document.getElementById('aspectRatio')?.value) || 1.5;

        if (!cfm) {
            ColdCloud.showNotification('الرجاء إدخال قيمة CFM', 'error');
            return;
        }

        // حساب مساحة المقطع العرضي (قدم مربع)
        const areaSqFt = cfm / velocity;
        const areaSqIn = areaSqFt * 144; // تحويل إلى بوصة مربعة

        let resultsHTML = '';

        if (ductType === 'round') {
            // حساب القطر للمجاري الدائرية
            const diameterInches = Math.sqrt((areaSqIn * 4) / Math.PI);
            const diameterMm = Math.round(diameterInches * 25.4);
            const roundedDiameter = this.roundToStandardDuctSize(diameterInches);

            resultsHTML = `
                <div class="result-card">
                    <div class="result-value">${areaSqFt.toFixed(2)} قدم²</div>
                    <div class="result-label">مساحة المقطع العرضي</div>
                </div>
                <div class="result-card">
                    <div class="result-value">${roundedDiameter} بوصة</div>
                    <div class="result-label">القطر الموصى به</div>
                </div>
                <div class="result-card">
                    <div class="result-value">${Math.round(diameterInches)} بوصة</div>
                    <div class="result-label">القطر الدقيق</div>
                </div>
                <div class="result-card">
                    <div class="result-value">${diameterMm} مم</div>
                    <div class="result-label">القطر بالمليمتر</div>
                </div>
            `;
        } else {
            // حساب الأبعاد للمجاري المستطيلة
            const widthInches = Math.sqrt(areaSqIn / aspectRatio);
            const heightInches = widthInches * aspectRatio;
            
            const roundedWidth = this.roundToStandardDuctSize(widthInches);
            const roundedHeight = this.roundToStandardDuctSize(heightInches);

            resultsHTML = `
                <div class="result-card">
                    <div class="result-value">${areaSqFt.toFixed(2)} قدم²</div>
                    <div class="result-label">مساحة المقطع العرضي</div>
                </div>
                <div class="result-card">
                    <div class="result-value">${roundedWidth} × ${roundedHeight} بوصة</div>
                    <div class="result-label">الأبعاد الموصى بها</div>
                </div>
                <div class="result-card">
                    <div class="result-value">${Math.round(widthInches)} × ${Math.round(heightInches)} بوصة</div>
                    <div class="result-label">الأبعاد الدقيقة</div>
                </div>
                <div class="result-card">
                    <div class="result-value">${Math.round(widthInches * 25.4)} × ${Math.round(heightInches * 25.4)} مم</div>
                    <div class="result-label">الأبعاد بالمليمتر</div>
                </div>
            `;
        }

        this.displayDuctResults(resultsHTML, cfm, velocity, ductType);
        this.saveCalculation('duct', { 
            cfm, 
            velocity, 
            ductType, 
            areaSqFt,
            aspectRatio: ductType === 'rectangular' ? aspectRatio : undefined
        });
    }

    roundToStandardDuctSize(size) {
        const standardSizes = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 24, 30, 36];
        return standardSizes.reduce((prev, curr) => {
            return (Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev);
        });
    }

    displayDuctResults(resultsHTML, cfm, velocity, ductType) {
        document.getElementById('ductResultsContent').innerHTML = resultsHTML;
        document.getElementById('ductResults').classList.add('active');

        const ductTypeName = ductType === 'round' ? 'دائري' : 'مستطيل';
        ColdCloud.showNotification(`تم حساب مقاسات المجاري ${ductTypeName} لـ ${cfm} CFM`, 'success');
    }

    // حاسبة الطاقة - مُصلحة الآن ✔️
    calculateEnergy() {
        const capacity = parseFloat(document.getElementById('systemCapacity').value) || 0;
        const efficiency = parseFloat(document.getElementById('efficiencyRating').value) || 0;
        const dailyUsage = parseFloat(document.getElementById('dailyUsage').value) || 0;
        const operatingDays = parseInt(document.getElementById('operatingDays').value) || 0;
        const electricityRate = parseFloat(document.getElementById('electricityRate').value) || 0;
        const climateZone = document.getElementById('climateZone').value;

        if (!capacity || !efficiency || !dailyUsage || !operatingDays || !electricityRate) {
            ColdCloud.showNotification('الرجاء إدخال جميع البيانات المطلوبة', 'error');
            return;
        }

        // حساب استهلاك الطاقة (كيلوواط)
        const powerConsumption = (capacity * 3.517) / efficiency; // 1 طن = 3.517 كيلوواط

        // حساب الاستهلاك اليومي (كيلوواط ساعة)
        const dailyConsumption = powerConsumption * dailyUsage;

        // حساب الاستهلاك الشهري
        const monthlyConsumption = dailyConsumption * operatingDays * 4.345; // متوسط أسابيع في الشهر

        // حساب التكلفة
        const monthlyCost = monthlyConsumption * electricityRate;
        const yearlyCost = monthlyCost * 12;

        // تطبيق عامل المناخ
        const climateFactors = {
            hot: 1.3,
            warm: 1.1,
            moderate: 1.0
        };

        const climateFactor = climateFactors[climateZone] || 1.0;
        const adjustedMonthlyCost = monthlyCost * climateFactor;
        const adjustedYearlyCost = yearlyCost * climateFactor;

        this.displayEnergyResults(
            powerConsumption, 
            dailyConsumption, 
            adjustedMonthlyCost, 
            adjustedYearlyCost,
            climateZone
        );

        this.saveCalculation('energy', {
            capacity,
            efficiency,
            dailyUsage,
            operatingDays,
            electricityRate,
            climateZone,
            powerConsumption,
            monthlyCost: adjustedMonthlyCost,
            yearlyCost: adjustedYearlyCost
        });
    }

    displayEnergyResults(power, daily, monthly, yearly, climateZone) {
        document.getElementById('powerConsumption').textContent = `${power.toFixed(2)} ك.و`;
        document.getElementById('dailyConsumption').textContent = `${daily.toFixed(2)} ك.و.س`;
        document.getElementById('monthlyCost').textContent = `${monthly.toFixed(2)} ريال`;
        document.getElementById('yearlyCost').textContent = `${yearly.toFixed(2)} ريال`;

        // عرض نصائح التوفير
        const tips = this.generateEnergyTips(power, monthly, climateZone);
        document.getElementById('energyTips').textContent = tips;

        document.getElementById('energyResults').classList.add('active');

        ColdCloud.showNotification(`تم حساب استهلاك الطاقة: ${monthly.toFixed(2)} ريال/شهر`, 'success');
    }

    generateEnergyTips(power, monthlyCost, climateZone) {
        let tips = "لتحسين كفاءة الطاقة: ";
        
        if (monthlyCost > 500) {
            tips += "• فكر في ترقية النظام إلى وحدة أكثر كفاءة. ";
        }
        
        if (climateZone === 'hot') {
            tips += "• استخدم العزل الحراري الجيد للجدران والأسقف. ";
        }
        
        tips += "• حافظ على الصيانة الدورية للنظام. ";
        tips += "• اضبط منظم الحرارة على 24°C للحصول على أفضل كفاءة. ";
        tips += "• أغلق النوافذ والأبواب أثناء التشغيل.";

        return tips;
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
        
        ColdCloud.showNotification('تم حفظ الحساب في السجل', 'info');
    }

    updateCalculationHistory() {
        // تحديث واجهة سجل الحسابات لكل نوع
        const historyElements = {
            btu: document.getElementById('btuHistory'),
            cfm: document.getElementById('cfmHistory'),
            ach: document.getElementById('achHistory'),
            duct: document.getElementById('ductHistory'),
            energy: document.getElementById('energyHistory')
        };

        for (const [type, element] of Object.entries(historyElements)) {
            if (element) {
                const typeCalculations = this.calculationHistory.filter(calc => calc.type === type);
                element.innerHTML = typeCalculations.slice(0, 5).map(calc => 
                    this.createHistoryRow(calc)
                ).join('') || '<tr><td colspan="5" style="text-align: center;">لا توجد حسابات سابقة</td></tr>';
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
            case 'ach':
                return `
                    <tr>
                        <td>${timestamp}</td>
                        <td>${data.cfm} CFM</td>
                        <td>${data.volume} قدم³</td>
                        <td>${data.ach} ACH</td>
                        <td>${data.evaluation.level}</td>
                    </tr>
                `;
            case 'duct':
                return `
                    <tr>
                        <td>${timestamp}</td>
                        <td>${data.cfm} CFM</td>
                        <td>${data.velocity} FPM</td>
                        <td>${data.ductType === 'round' ? 'دائري' : 'مستطيل'}</td>
                        <td>${data.areaSqFt.toFixed(2)} قدم²</td>
                    </tr>
                `;
            case 'energy':
                return `
                    <tr>
                        <td>${timestamp}</td>
                        <td>${data.capacity} طن</td>
                        <td>${data.efficiency}</td>
                        <td>${data.monthlyCost.toFixed(2)} ريال</td>
                        <td>${this.getClimateZoneName(data.climateZone)}</td>
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

    getClimateZoneName(zone) {
        const names = {
            hot: 'حار جداً',
            warm: 'حار',
            moderate: 'معتدل'
        };
        return names[zone] || zone;
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

    // وظائف إعادة التعيين
    resetBTUForm() {
        document.getElementById('btuForm').reset();
        document.getElementById('btuResults').classList.remove('active');
        ColdCloud.showNotification('تم إعادة تعيين الحاسبة', 'info');
    }

    resetCFMForm() {
        document.getElementById('cfmForm').reset();
        document.getElementById('cfmResults').classList.remove('active');
        ColdCloud.showNotification('تم إعادة تعيين الحاسبة', 'info');
    }

    resetACHForm() {
        document.getElementById('achForm').reset();
        document.getElementById('achResults').classList.remove('active');
        ColdCloud.showNotification('تم إعادة تعيين الحاسبة', 'info');
    }

    resetDuctForm() {
        document.getElementById('ductForm').reset();
        document.getElementById('ductResults').classList.remove('active');
        ColdCloud.showNotification('تم إعادة تعيين الحاسبة', 'info');
    }

    resetEnergyForm() {
        document.getElementById('energyForm').reset();
        document.getElementById('energyResults').classList.remove('active');
        ColdCloud.showNotification('تم إعادة تعيين الحاسبة', 'info');
    }
}

// تهيئة مدير الحسابات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.calculationsManager = new CalculationsManager();
});

// وظائف عامة للحاسبات - متاحة عالمياً
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

function calculateEnergy() {
    window.calculationsManager.calculateEnergy();
}

function resetBTUForm() {
    window.calculationsManager.resetBTUForm();
}

function resetCFMForm() {
    window.calculationsManager.resetCFMForm();
}

function resetACHForm() {
    window.calculationsManager.resetACHForm();
}

function resetDuctForm() {
    window.calculationsManager.resetDuctForm();
}

function resetEnergyForm() {
    window.calculationsManager.resetEnergyForm();
}

function saveCalculation(type) {
    // يتم التعامل مع الحفظ داخل المدير
    // هذه الدالة موجودة للتوافق مع HTML
}

// وظائف إضافية للمساعدة
function toggleAspectRatio(ductType) {
    const aspectRatioGroup = document.getElementById('aspectRatioGroup');
    if (aspectRatioGroup) {
        if (ductType === 'rectangular') {
            aspectRatioGroup.style.display = 'flex';
        } else {
            aspectRatioGroup.style.display = 'none';
        }
    }
}

// جعل الدوال متاحة عالمياً للاستخدام في HTML
window.toggleAspectRatio = toggleAspectRatio;
