/**
 * سامانه جامع ممیزی و بازرسی HSE
 * به همراه ثبت تاریخ شمسی، تحلیل داده و ذخیره‌سازی محلی
 */

// ۱. راه‌اندازی پایگاه داده آفلاین IndexedDB با Dexie
const db = new Dexie('HSE_Inspection_DB');
db.version(1).stores({
    inspections: '++id, date, inspector, equipmentCode, location, checklistType, checklistName, compliantCount, nonCompliantCount, naCount, complianceRate, issues'
});

// ۲. بانک اطلاعاتی سوالات و چک‌لیست‌های تخصصی HSE
const CHECKLIST_DEFINITIONS = {
    kitchen: {
        title: 'چک‌لیست بهداشت، ایمنی و محیط زیست آشپزخانه و غذاخوری',
        items: [
            'وضعیت کارت بهداشت و گواهی سلامت دوره‌ای کلیه پرسنل آشپزخانه معتبر است.',
            'استفاده مستمر از لباس کار مصوب، روپوش سفید، کلاه، ماسک و دستکش بهداشتی رعایت می‌شود.',
            'تفکیک فیزیکی و بهداشتی مراحل آماده‌سازی گوشت، سبزیجات و پخت و پز برقرار است.',
            'عملکرد تهویه صنعتی، هودهای پخت و سیستم تخلیه دود و گاز استاندارد است.',
            'کف، دیوارها و سقف سالن پخت سالم، بدون ترک، قابل شستشو و تمیز است.',
            'توری‌های پنجره‌ها، تله‌های حشرات و مسیرهای دفع آفات سلامت فیزیکی دارند.',
            'سیستم لوله‌کشی و شیرآلات گاز مجهز به شیرهای قطع سریع اضطراری است.',
            'دمای یخچال‌ها و سردخانه‌ها روزانه ثبت شده و در محدوده استاندارد نگهداری می‌شود.',
            'کپسول‌های اطفای حریق متناسب (CO2 / بیوکلاس F) در دسترس و کالیبره هستند.',
            'شستشو و ضدعفونی ظروف با آب گرم و مایعات استاندارد به طور منظم انجام می‌گیرد.',
            'جعبه کمک‌های اولیه با اقلام مخصوص سوختگی و بریدگی مجهز و در دسترس است.',
            'محل و مخازن نگهداری زباله دردار، مجهز به کیسه زباله و تخلیه به موقع هستند.',
            'سیم‌کشی‌های برق وسایل آشپزخانه ایمن و مجهز به ارتینگ محافظ جان است.',
            'روشنایی طبیعی و مصنوعی مناسب بوده و حباب‌های محافظ لامپ‌ها نصب است.',
            'کفپوش‌ها ضدلغزش بوده و از تردد با کفش‌های نامناسب جلوگیری می‌شود.',
            'انبار مواد غذایی خشک با پالت استاندارد و رعایت فاصله از دیوار و کف چیده شده است.',
            'تاریخ مصرف مواد اولیه غذایی کنترل شده و سیستم گردش کالا (FIFO) اجرا می‌شود.',
            'آب شرب مصرفی سالن غذاخوری از نظر سلامت میکروبی آزمایش دوره‌ای دارد.'
        ]
    },
    elec_panel: {
        title: 'چک‌لیست ایمنی تابلوهای برق اصلی و فرعی (MV/LV)',
        items: [
            'درب تابلو دارای قفل سالم بوده و دسترسی فقط برای افراد مجاز ممکن است.',
            'پلاک شناسایی تجهیز، ولتاژ، برچسب‌های هشدار خطر برق‌گرفتگی و شینه‌بندی نصب است.',
            'کفپوش عایق لاستیکی استاندارد متناسب با ولتاژ در مقابل تابلو پهن شده است.',
            'سیستم ارت بدنه تابلو با کابل استاندارد و اتصالات محکم برقرار است.',
            'وضعیت کابل‌کشی ورودی و خروجی فاقد پارگی، تنش فیزیکی و فرسایش است.',
            'گلندهای ورودی کابل کامل بوده و منافذ نفوذ گردوغبار و جوندگان مسدود است.',
            'تجهیزات قطع جریان نشتی (ELCB/RCD) و فیوزها سالم و متناسب با بار هستند.',
            'عدم وجود گردوغبار، رطوبت یا آثار داغ‌شدگی (تغییر رنگ) درون سلول‌ها.',
            'دیاگرام خطی (Single Line Diagram) به‌روز در داخل درب تابلو نصب است.',
            'چراغ‌های سیگنال فازها و آمپرمتر/ولتمترها به درستی کار می‌کنند.'
        ]
    },
    elec_substation: {
        title: 'چک‌لیست پست‌های توزیع برق، ترانسفورماتور و رومینگ',
        items: [
            'سیستم قفل‌گذاری و هشدار ورود افراد غیرمجاز به محوطه پست فعال است.',
            'سطح و فشار روغن ترانسفورماتورها و رله بوخهلتس نرمال است.',
            'سیستم ارتینگ حفاظتی رینگ و صاعقه‌گیرها تست شده و دارای تاییدیه است.',
            'فن‌های تهویه اتوماتیک، درجه حرارت محیط و دمای ترانسفورماتور نرمال است.',
            'حوضچه دریافت روغن اضطراری ترانس تمیز و بدون گرفتگی است.',
            'دستکش و شیلد عایق، شمش تخلیه بار الکتریکی و چراغ اضطراری در دسترس است.',
            'عاری بودن محیط پست از هرگونه مواد قابل اشتعال، پارچه و پسماند.',
            'سیستم اعلام و اطفای حریق اتوماتیک یا کپسول‌های CO2 پست آماده به کار هستند.'
        ]
    },
    elec_portable: {
        title: 'چک‌لیست تجهیزات و ابزارهای پرتابل الکتریکی',
        items: [
            'کابل تغذیه دستگاه فاقد چسب‌خوردگی، پارگی روکش و سیم‌لخت‌شدگی است.',
            'دو شاخه صنعتی سالم است و سیم‌ها مستقیماً وارد پریز نشده‌اند.',
            'حفاظ‌های ایمنی دستگاه (گارد محافظ دیسک، تسمه و تیغه) سالم و متصل است.',
            'کلید قطع و وصل دستگاه فاقد گیرکردن مکانیکی و جرقه‌زدگی غیرعادی است.',
            'دستگاه دارای بدنه عایق دوبل یا اتصال سیم ارت فعال است.',
            'دستگاه در محیط‌های مرطوب بدون ترانس ایزوله یا تجهیز ایمن استفاده نمی‌شود.'
        ]
    },
    elec_general: {
        title: 'چک‌لیست ایمنی عمومی برق، روشنایی و ارتینگ محیطی',
        items: [
            'پریزها و کلیدهای روشنایی محیط سالم، دارای درپوش و عاری از شکستگی هستند.',
            'سیم‌کشی‌های موقت و روکار در مسیر عبور لیفتراک یا تردد نفرات جمع‌آوری شده است.',
            'چاه‌ها و هم‌بندی ارت ماشین‌آلات سالن دارای برچسب تست دوره‌ای هستند.',
            'سیستم روشنایی اضطراری و علائم خروج سالن‌ها در زمان قطع برق فعال می‌شوند.',
            'هیچ وسیله گرمایشی متفرقه یا هیتر بدون مجوز در واحد استفاده نمی‌شود.'
        ]
    },
    fire_ext: {
        title: 'چک‌لیست کپسول‌های خاموش‌کننده دستی حریق',
        items: [
            'کپسول در محل مشخص و دسترسی آزاد بدون مانع (فاصله مناسب) قرار دارد.',
            'فشارسنج (گیج) در محدوده سبز و استاندارد کاری قرار دارد.',
            'شیلنگ، نازل و بدنه کپسول فاقد پوسیدگی، فرورفتگی، ترک و خوردگی است.',
            'پین ایمنی و پلمب سربی کپسول دست‌نخورده و سالم است.',
            'کارت بازرسی ماهیانه متصل بوده و تاریخ شارژ و تست هیدرواستاتیک معتبر است.',
            'پلاک مشخصات و نوع کلاس حریق (ABC/CO2) خوانا و مشخص است.',
            'ارتفاع نصب از کف مطابق استاندارد (حداکثر ۱.۵ متر) رعایت شده است.'
        ]
    },
    fire_box: {
        title: 'چک‌لیست جعبه‌های آتش‌نشانی و سیستم‌های هوزریل',
        items: [
            'درب جعبه آتش‌نشانی به راحتی و زاویه ۱۸۰ درجه باز می‌شود.',
            'شیلنگ فاقد پوسیدگی، تاخوردگی، شکستگی و نشت آب در اتصالات است.',
            'نازل تفنگی چندحالته (اسپری/جت) متصل و روان کار می‌کند.',
            'شیر تغذیه آب فاقد نشتی بوده و فلکه باز و بست به راحتی می‌چرخد.',
            'قرقره هوزریل آزادانه و بدون گیرکردن می‌چرخد.',
            'کپسول کمکی داخل فایرباکس بازرسی شده و سالم است.',
            'علائم شب‌نما و شماره فایرباکس کاملاً خوانا و مشخص است.'
        ]
    }
};

// ۳. تابع تبدیل تاریخ میلادی به هجری شمسی
function convertToShamsi(dateString) {
    if (!dateString) return 'نامشخص';
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        if (typeof jalaali !== 'undefined' && jalaali.toJalaali) {
            const j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
            return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`;
        }
        // اگر کتابخانه بارگذاری نشده بود، فرمت پیش‌فرض مرورگر
        return d.toLocaleDateString('fa-IR');
    } catch (e) {
        console.error('خطا در تبدیل تاریخ:', e);
        return dateString;
    }
}

// ۴. متغیرهای نمودارها
let complianceChartInstance = null;
let categoryChartInstance = null;

// ۵. راه‌اندازی پس از بارگذاری کامل صفحه
document.addEventListener('DOMContentLoaded', async () => {
    // مقداردهی تاریخ امروز
    const dateInput = document.getElementById('inspDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // لیسنر برای تغییر چک‌لیست
    const selectEl = document.getElementById('checklistSelect');
    if (selectEl) {
        selectEl.addEventListener('change', renderChecklistForm);
    }

    // لیسنر ثبت فرم
    const formEl = document.getElementById('inspectionForm');
    if (formEl) {
        formEl.addEventListener('submit', handleFormSubmit);
    }

    // لیسنر خروجی اکسل
    const excelBtn = document.getElementById('exportExcelBtn');
    if (excelBtn) {
        excelBtn.addEventListener('click', exportToExcel);
    }

    // لیسنر پاکسازی داده‌ها
    const clearBtn = document.getElementById('clearDataBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllData);
    }

    // بارگذاری جدول و نمودارها
    await refreshHistoryAndCharts();
});

// ۶. تابع باز کردن و ساخت ردیف‌های چک‌لیست
function renderChecklistForm() {
    const key = document.getElementById('checklistSelect').value;
    const form = document.getElementById('inspectionForm');
    const container = document.getElementById('itemsContainer');
    const titleEl = document.getElementById('currentFormTitle');

    if (!key || !CHECKLIST_DEFINITIONS[key]) {
        form.classList.add('hidden');
        container.innerHTML = '';
        return;
    }

    const checklist = CHECKLIST_DEFINITIONS[key];
    titleEl.textContent = checklist.title;
    container.innerHTML = '';

    checklist.items.forEach((itemText, index) => {
        const row = document.createElement('div');
        row.className = 'bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-2';
        row.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span class="font-medium text-slate-700 leading-relaxed">${index + 1}. ${itemText}</span>
                <div class="flex items-center gap-3 shrink-0">
                    <label class="inline-flex items-center gap-1 cursor-pointer text-emerald-700">
                        <input type="radio" name="item_${index}" value="C" checked class="text-emerald-600 focus:ring-emerald-500">
                        <span>انطباق</span>
                    </label>
                    <label class="inline-flex items-center gap-1 cursor-pointer text-rose-700">
                        <input type="radio" name="item_${index}" value="NC" class="text-rose-600 focus:ring-rose-500">
                        <span>عدم‌انطباق</span>
                    </label>
                    <label class="inline-flex items-center gap-1 cursor-pointer text-slate-600">
                        <input type="radio" name="item_${index}" value="NA" class="text-slate-500 focus:ring-slate-400">
                        <span>کاربرد ندارد</span>
                    </label>
                </div>
            </div>
            <input type="text" id="action_${index}" placeholder="توضیحات و اقدام اصلاحی لازم در صورت عدم انطباق..." class="w-full p-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500">
        `;
        container.appendChild(row);
    });

    form.classList.remove('hidden');
}

// ۷. ثبت فرم در IndexedDB
async function handleFormSubmit(e) {
    e.preventDefault();

    const checklistKey = document.getElementById('checklistSelect').value;
    const checklistDef = CHECKLIST_DEFINITIONS[checklistKey];
    if (!checklistDef) return;

    const rawDate = document.getElementById('inspDate').value;
    const shamsiDate = convertToShamsi(rawDate);

    const inspector = document.getElementById('inspectorName').value.trim();
    const equipmentCode = document.getElementById('equipmentCode').value.trim().toUpperCase();
    const location = document.getElementById('location').value.trim();

    let compliantCount = 0;
    let nonCompliantCount = 0;
    let naCount = 0;
    let issues = [];

    checklistDef.items.forEach((itemText, index) => {
        const checkedRadio = document.querySelector(`input[name="item_${index}"]:checked`);
        const selectedVal = checkedRadio ? checkedRadio.value : 'C';
        const actionInput = document.getElementById(`action_${index}`);
        const actionText = actionInput ? actionInput.value.trim() : '';

        if (selectedVal === 'C') {
            compliantCount++;
        } else if (selectedVal === 'NC') {
            nonCompliantCount++;
            issues.push(`بند ${index + 1}: ${actionText || 'بدون ثبت شرح'}`);
        } else {
            naCount++;
        }
    });

    const evaluatedTotal = compliantCount + nonCompliantCount;
    const complianceRate = evaluatedTotal > 0 ? Math.round((compliantCount / evaluatedTotal) * 100) : 100;

    const record = {
        date: shamsiDate, // ثبت تاریخ شمسی
        rawDate: rawDate,
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

    // ریست فیلدهای فرم
    document.getElementById('inspectionForm').reset();
    document.getElementById('inspDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('inspectionForm').classList.add('hidden');
    document.getElementById('checklistSelect').value = '';

    alert(`✅ بازرسی تجهیز "${equipmentCode}" با تاریخ شمسی (${shamsiDate}) با موفقیت ثبت شد.`);
    await refreshHistoryAndCharts();
}

// ۸. به‌روزرسانی جدول سوابق و نمودارها
async function refreshHistoryAndCharts() {
    const list = await db.inspections.toArray();

    // به‌روزرسانی KPIها
    const totalCount = list.length;
    document.getElementById('kpiTotal').textContent = totalCount;

    if (totalCount === 0) {
        document.getElementById('kpiCompliance').textContent = '0%';
        document.getElementById('kpiNonConform').textContent = '0';
        document.getElementById('kpiEquipments').textContent = '0';
        document.getElementById('historyTableBody').innerHTML = `
            <tr><td colspan="9" class="text-center py-6 text-slate-400">هنوز بازرسی ثبت نشده است.</td></tr>
        `;
        renderCharts(0, 0, {});
        return;
    }

    let sumCompliance = 0;
    let totalNC = 0;
    let totalC = 0;
    const uniqueEquips = new Set();
    const categoryNcCounts = {};

    list.forEach(r => {
        sumCompliance += r.complianceRate;
        totalNC += r.nonCompliantCount;
        totalC += r.compliantCount;
        uniqueEquips.add(r.equipmentCode);

        const shortName = r.checklistName.split(' ')[1] || r.checklistName;
        categoryNcCounts[shortName] = (categoryNcCounts[shortName] || 0) + r.nonCompliantCount;
    });

    document.getElementById('kpiCompliance').textContent = `${Math.round(sumCompliance / totalCount)}%`;
    document.getElementById('kpiNonConform').textContent = totalNC;
    document.getElementById('kpiEquipments').textContent = uniqueEquips.size;

    // رندرسازی جدول تاریخچه
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';

    // نمایش معکوس (جدیدترین‌ها در بالا)
    [...list].reverse().forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 border-b border-slate-100 transition';
        tr.innerHTML = `
            <td class="p-2.5 font-mono text-slate-700 font-semibold">${row.date}</td>
            <td class="p-2.5 font-bold text-blue-700">${row.equipmentCode}</td>
            <td class="p-2.5 text-slate-600 max-w-[150px] truncate" title="${row.checklistName}">${row.checklistName}</td>
            <td class="p-2.5 text-slate-600">${row.location}</td>
            <td class="p-2.5 text-slate-600">${row.inspector}</td>
            <td class="p-2.5 text-center text-emerald-600 font-bold">${row.compliantCount}</td>
            <td class="p-2.5 text-center text-rose-600 font-bold">${row.nonCompliantCount}</td>
            <td class="p-2.5 text-center">
                <span class="px-2 py-0.5 rounded-full text-xs font-bold ${row.complianceRate >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                    ${row.complianceRate}%
                </span>
            </td>
            <td class="p-2.5 text-center">
                <button onclick="deleteRecord(${row.id})" class="text-rose-500 hover:text-rose-700 font-bold">حذف</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    renderCharts(totalC, totalNC, categoryNcCounts);
}

// ۹. رسم نمودارهای تحلیلی با Chart.js
function renderCharts(totalC, totalNC, categoryData) {
    // ۱. نمودار دایره‌ای انطباق کل
    const ctxPie = document.getElementById('complianceChart').getContext('2d');
    if (complianceChartInstance) complianceChartInstance.destroy();

    complianceChartInstance = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['منطبق (C)', 'عدم انطباق (NC)'],
            datasets: [{
                data: [totalC, totalNC],
                backgroundColor: ['#10b981', '#f43f5e'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { font: { family: 'sans-serif' } } }
            }
        }
    });

    // ۲. نمودار میله‌ای خطرات بر حسب چک‌لیست
    const ctxBar = document.getElementById('categoryChart').getContext('2d');
    if (categoryChartInstance) categoryChartInstance.destroy();

    categoryChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                label: 'موارد عدم انطباق',
                data: Object.values(categoryData),
                backgroundColor: '#6366f1',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ۱۰. حذف یک رکورد خاص
window.deleteRecord = async function(id) {
    if (confirm('آیا از حذف این رکورد بازرسی مطمئن هستید؟')) {
        await db.inspections.delete(id);
        await refreshHistoryAndCharts();
    }
};

// ۱۱. پاک‌سازی کل اطلاعات
async function clearAllData() {
    if (confirm('⚠️ اخطار: تمام سوابق بازرسی پاک خواهند شد. آیا اطمینان دارید؟')) {
        await db.inspections.clear();
        await refreshHistoryAndCharts();
        alert('تمام داده‌ها پاک‌سازی شدند.');
    }
}

// ۱۲. صدور فایل اکسل گزارشات با تاریخ شمسی
async function exportToExcel() {
    const list = await db.inspections.toArray();
    if (list.length === 0) {
        alert('اطلاعاتی برای خروجی اکسل وجود ندارد.');
        return;
    }

    const excelData = list.map(item => ({
        'شناسه': item.id,
        'تاریخ بازرسی (شمسی)': item.date,
        'کد تجهیز (Tag)': item.equipmentCode,
        'واحد / موقعیت': item.location,
        'عنوان چک‌لیست': item.checklistName,
        'نام بازرس': item.inspector,
        'موارد منطبق': item.compliantCount,
        'موارد عدم انطباق': item.nonCompliantCount,
        'کاربرد ندارد': item.naCount,
        'درصد انطباق': `${item.complianceRate}%`,
        'عدم انطباق‌ها و اقدامات': item.issues
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'گزارش بازرسی HSE');

    // خروجی نهایی
    XLSX.writeFile(workbook, `HSE_Audit_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
}
