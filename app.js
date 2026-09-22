/**
 * سامانه جامع بازرسی HSE - نسخه تاریخ شمسی
 */

// ... [سایر بخش‌های کد بدون تغییر باقی می‌مانند تا سطر ۵۰] ...

// تابع جدید برای تبدیل تاریخ میلادی به شمسی
function convertToShamsi(dateString) {
    const d = new Date(dateString);
    const j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return `${j.jy}/${j.jm.toString().padStart(2, '0')}/${j.jd.toString().padStart(2, '0')}`;
}

// ... [ادامه کد - تابع renderChecklistForm بدون تغییر] ...

// اصلاح تابع ثبت فرم (تغییر فقط در نحوه خواندن تاریخ)
async function handleFormSubmit(e) {
    e.preventDefault();

    const checklistKey = document.getElementById('checklistSelect').value;
    const checklistDef = CHECKLIST_DEFINITIONS[checklistKey];
    if (!checklistDef) return;

    // تاریخ میلادی را از اینپوت می‌گیرد و به شمسی تبدیل می‌کند
    const rawDate = document.getElementById('inspDate').value;
    const date = convertToShamsi(rawDate); 
    
    const inspector = document.getElementById('inspectorName').value.trim();
    const equipmentCode = document.getElementById('equipmentCode').value.trim().toUpperCase();
    const location = document.getElementById('location').value.trim();

    let compliantCount = 0;
    let nonCompliantCount = 0;
    let naCount = 0;
    let issues = [];

    checklistDef.items.forEach((itemText, index) => {
        const selectedVal = document.querySelector(`input[name="item_${index}"]:checked`).value;
        const actionText = document.getElementById(`action_${index}`).value.trim();

        if (selectedVal === 'C') compliantCount++;
        else if (selectedVal === 'NC') {
            nonCompliantCount++;
            issues.push(`بند ${index + 1}: ${actionText || 'بدون شرح اقدام'}`);
        } else {
            naCount++;
        }
    });

    const evaluatedTotal = compliantCount + nonCompliantCount;
    const complianceRate = evaluatedTotal > 0 ? Math.round((compliantCount / evaluatedTotal) * 100) : 100;

    const record = {
        date, // اینجا تاریخ شمسی ذخیره می‌شود
        inspector,
        equipmentCode,
        location,
        checklistType: checklistKey,
        checklistName: checklistDef.title,
        compliantCount,
        nonCompliantCount,
        naCount,
        complianceRate,
        issues: issues.join(' | ')
    };

    await db.inspections.add(record);

    // ریست فرم
    document.getElementById('inspectionForm').reset();
    document.getElementById('inspDate').valueAsDate = new Date();
    document.getElementById('inspectionForm').classList.add('hidden');
    document.getElementById('checklistSelect').value = '';

    alert('✅ بازرسی با تاریخ شمسی ثبت شد.');

    await refreshHistoryAndCharts();
}

// ... [بقیه کد (refreshHistoryAndCharts، exportToExcel و...) بدون هیچ تغییری باقی می‌مانند] ...
