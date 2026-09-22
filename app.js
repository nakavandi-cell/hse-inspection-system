/**
 * سامانه جامع بازرسی HSE
 * مدیریت پایگاه‌داده Dexie، هندلینگ چک‌لیست‌های تخصصی، Chart.js و اکسل SheetJS
 */

// ۱. پایگاه‌داده محلی آفلاین IndexedDB
const db = new Dexie('HSE_Inspection_DB');
db.version(1).stores({
    inspections: '++id, date, checklistType, equipmentCode, location, inspector, compliantCount, nonCompliantCount, complianceRate'
});

// ۲. بانک اطلاعاتی آیتم‌های چک‌لیست‌های تخصصی
const CHECKLIST_DEFINITIONS = {
    kitchen: {
        title: "چک‌لیست ایمنی و بهداشت آشپزخانه و سالن غذاخوری",
        items: [
            "داشتن کارت بهداشت و گواهی سلامت معتبر پرسنل آشپزخانه",
            "استفاده کامل از البسه کار اختصاصی (کلاه، روپوش، دستکش، کفش ضدلغزش)",
            "وجود و کارکرد مطلوب امکانات شستشوی دست، صابون مایع و دستمال یکبار مصرف",
            "جداسازی کامل تخته‌ها و چاقوهای آماده‌سازی گوشت خام از سبزیجات و مواد پخته",
            "رعایت دمای مجاز یخچال‌ها (زیر ۴ درجه) و فریزرها (زیر ۱۸- درجه سانتی‌گراد)",
            "رعایت قانون چیدمان FIFO و تاریخ انقضای مواد غذایی",
            "نگهداری مواد شوینده و شیمیایی در قفسه کاملاً مجزا و قفل‌دار دور از غذا",
            "شستشو و گندزدایی اصولی ۳ مرحله‌ای ظروف و سبزیجات",
            "شستشو و ضدعفونی دوره‌ای هود، کانال‌های مکنده و فیلترهای چربی‌گیر",
            "تخلیه مستمر و به‌موقع پسماندها و مجهز بودن سطل‌ها به درب پدالی",
            "سلامت و ضدلغزش بودن کف‌پوش آشپزخانه و وجود شیب مناسب به سمت کف‌شورها",
            "وجود توری سالم روی پنجره‌ها و سیستم دفع و مبارزه با حشرات و جوندگان",
            "کفایت و سلامت سیستم تهویه هوا و خروجی بخارات و بو",
            "وضعیت استاندارد روشنایی و داشتن حفاظ ضدپاشش روی تمامی چراغ‌ها",
            "اتصالات و شیلنگ‌های استاندارد گاز، بست‌های فلزی محکم و تست نشتی دوره‌ای",
            "کلید قطع اضطراری گاز (Emergency Shut-off) در دسترس و با عملکرد سالم",
            "نصب کلیدهای محافظ جان (RCD/GFCI) برای کلیه پریزهای مجاور سینک و رطوبت",
            "کپسول آتش‌نشانی مناسب (CO2 و پودری/کلاس F) آماده، شارژ و دارای مانع دسترسی نبودن"
        ]
    },
    elec_panel: {
        title: "چک‌لیست بازرسی تابلوهای برق اصلی و فرعی (LV/MV)",
        items: [
            "مسدود نبودن حریم ایمنی ۱ متری روبروی تابلو و تمیزی کامل محوطه",
            "بسته و قفل بودن درب تابلو و جلوگیری از دسترسی افراد غیرمجاز",
            "وجود نقشه الکتریکی به‌روز (Single Line Diagram) داخل درب تابلو",
            "نصب علائم هشدار خطر برق‌گرفتگی استاندارد روی بدنه تابلو",
            "وجود و اتصال مطمئن شینه و هادی اتصال به زمین (ارتینگ بدنه و درب)",
            "عملکرد صحیح کلید محافظ جان (RCD / ELCB) با فشردن دکمه تست دوره‌ای",
            "عدم وجود هرگونه سیم‌کشی تار عنکبوتی، لخت یا بدون لیبل و شماره سیم",
            "عایق‌بندی گلندهای ورودی و خروجی کابل‌ها و جلوگیری از ورود گردوغبار و جوندگان",
            "عدم مشاهده آثار گرمای بیش از حد، ذوب‌شدگی، دوده یا جرقه روی شینه‌ها و کلیدها",
            "وجود کفپوش عایق لاستیکی استاندارد (با ولتاژ آزمون معتبر) در مقابل تابلو"
        ]
    },
    elec_substation: {
        title: "چک‌لیست پست توزیع برق، ترانسفورماتور و رومینگ",
        items: [
            "سیستم تهویه و فن‌های اتاق ترانس و کنترل مناسب دما",
            "عدم نشتی روغن ترانسفورماتور و سطح مجاز گیج روغن",
            "سلامت سیلیکاژل ترانس (رنگ آبی مناسب و بدون اشباع رطوبت)",
            "وجود و کالیبره بودن تجهیزات حفاظت فردی ولتاژ بالا (دستکش عایق، اپرون و فازمتر فشارقوی)",
            "وجود چوب یا استیک نجات عایق (Rescue Hook) در محل مشخص و آماده",
            "روشنایی اضطراری اتاق پست و عملکرد باتری‌بکاپ‌ها در زمان قطعی",
            "سیستم اعلام و اطفای حریق اتوماتیک یا کپسول‌های CO2 شارژ شده ویژه پست",
            "بسته‌بندی و نفوذناپذیری دریچه‌های کابل‌ها در برابر ورود گربه و پرندگان"
        ]
    },
    elec_portable: {
        title: "چک‌لیست ایمنی ابزارها و تجهیزات پرتابل برقی",
        items: [
            "سلامت کامل روکش کابل تغذیه، بدون پارگی، دوشاخه استاندارد و چسب‌خوردگی",
            "وجود و عملکرد سالم حفاظ‌های ایمنی مکانیکی روی سنگ فرز، اره دیسکی و دریل",
            "عملکرد سریع و روان سوئیچ روشن/خاموش بدون گیرکردن دکمه قفل سوئیچ",
            "تجهیز به دوشاخه مجهز به ارت یا کلاس عایقی دوبل (Class II Double Insulated)",
            "عدم ایجاد بوی سوختگی، صدای ناهنجار یا جرقه‌زنی شدید کلکتور آرمیچر",
            "انجام آزمون دوره‌ای مقاومت عایقی و برچسب بازرسی معتبر (PAT Test Tag)"
        ]
    },
    elec_general: {
        title: "چک‌لیست ایمنی عمومی برق، روشنایی و ارتینگ محیطی",
        items: [
            "ارتینگ کامل اسکلت فلزی سازه، مخازن و خطوط انتقال مواد قابل اشتعال",
            "سالم بودن تمامی کلیدها، پریزها و پوشش کلیدهای صنعتی در سالن",
            "عدم استفاده از سه راهی‌ها و رابط‌های برق غیراستاندارد به‌صورت دائمی",
            "کفایت لوکس نوری محیط کار و عدم وجود سایه یا خیرگی آزاردهنده",
            "سالم بودن چراغ‌های خروج اضطراری (Emergency Exit Signs)"
        ]
    },
    fire_ext: {
        title: "چک‌لیست بازرسی کپسول‌های خاموش‌کننده دستی",
        items: [
            "کپسول در محل تعریف‌شده روی پایه/دیوار در ارتفاع استاندارد نصب شده است",
            "دسترسی فیزیکی کاملاً آزاد و بدون هیچ‌گونه مانع کارگاهی یا پالت‌گذاری",
            "عقربه فشارسنج (گیج) در محدوده سبز و استاندارد قرار دارد",
            "پین ضامن، سیم پلمپ و برچسب پلمپ سربی کاملاً دست‌نخورده و سالم است",
            "شیلنگ، بست و نازل خروجی بدون ترک، خشکی و گرفتگی است",
            "کارت بازرسی ماهانه دارای تاریخ تایید و امضای مسئول آتش‌نشانی است",
            "بدنه کپسول فاقد هرگونه زنگ‌زدگی، ضربه‌دیدگی، دفرمگی و فرورفتگی است",
            "نوع کپسول (پودری، CO2، آب و گاز، فوم) متناسب با ماهیت بار حریق محل است"
        ]
    },
    fire_box: {
        title: "چک‌لیست جعبه‌های آتش‌نشانی و سیستم‌های هوزریل",
        items: [
            "درب جعبه به‌راحتی تا ۱۸۰ درجه باز شده و قفل آن روان است",
            "کارت شناسایی، پلاک مشخصات و شبرنگ علامت‌گذاری شب‌نما نصب است",
            "قرقره هوزریل روان بوده و بدون گیر کردن شیلنگ را باز می‌کند",
            "شیلنگ بدون پوسیدگی، سوراخ‌شدگی، پارگی و تغییر فرم است",
            "نازل (شیر سه حالته جت/اسپری/بسته) سالم و اتصالات بدون نشتی هستند",
            "فشار هیدرواستاتیکی آب پشت شیر کوپلینگ کافی و مورد تأیید است",
            "فضای زیر و روبروی فایرباکس کاملاً تخلیه و بدون چیدمان کالا است",
            "آچار کوپلینگ و اتصالات کمکی داخل جعبه موجود است"
        ]
    }
};

// متغیرهای نگه‌دارنده چارت‌ها
let complianceChartInstance = null;
let categoryChartInstance = null;

// ۳. راه‌اندازی اولیه
document.addEventListener('DOMContentLoaded', async () => {
    // تنظیم پیش‌فرض تاریخ روی امروز
    document.getElementById('inspDate').valueAsDate = new Date();

    // رویداد تغییر نوع چک‌لیست
    document.getElementById('checklistSelect').addEventListener('change', renderChecklistForm);

    // ثبت فرم
    document.getElementById('inspectionForm').addEventListener('submit', handleFormSubmit);

    // دکمه خروجی اکسل
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);

    // پاکسازی داده‌ها
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);

    // بارگذاری جدول تاریخچه و نمودارها
    await refreshHistoryAndCharts();
});

// ۴. رندر کردن فرم چک‌لیست
function renderChecklistForm(e) {
    const checklistKey = e.target.value;
    const form = document.getElementById('inspectionForm');
    const container = document.getElementById('itemsContainer');
    const titleEl = document.getElementById('currentFormTitle');

    if (!checklistKey || !CHECKLIST_DEFINITIONS[checklistKey]) {
        form.classList.add('hidden');
        return;
    }

    const currentChecklist = CHECKLIST_DEFINITIONS[checklistKey];
    titleEl.innerText = currentChecklist.title;
    container.innerHTML = '';

    currentChecklist.items.forEach((itemText, index) => {
        const itemRow = document.createElement('div');
        itemRow.className = "bg-white p-3.5 rounded-lg border border-slate-200 hover:border-blue-300 transition space-y-2";
        itemRow.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div class="text-xs font-semibold text-slate-800 flex items-start gap-2">
                    <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 text-[11px] font-mono">${index + 1}</span>
                    <span>${itemText}</span>
                </div>
                <div class="flex items-center gap-3 text-xs flex-shrink-0 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <label class="inline-flex items-center gap-1 cursor-pointer text-emerald-700 font-medium">
                        <input type="radio" name="item_${index}" value="C" checked class="text-emerald-600 focus:ring-emerald-500">
                        <span>منطبق</span>
                    </label>
                    <label class="inline-flex items-center gap-1 cursor-pointer text-rose-700 font-medium">
                        <input type="radio" name="item_${index}" value="NC" class="text-rose-600 focus:ring-rose-500">
                        <span>عدم‌انطباق</span>
                    </label>
                    <label class="inline-flex items-center gap-1 cursor-pointer text-slate-500 font-medium">
                        <input type="radio" name="item_${index}" value="NA" class="text-slate-500 focus:ring-slate-400">
                        <span>عدم‌کاربرد</span>
                    </label>
                </div>
            </div>
            <!-- فیلد اقدام اصلاحی در صورت عدم انطباق -->
            <div class="pt-1">
                <input type="text" id="action_${index}" placeholder="توضیح عدم‌انطباق / اقدام اصلاحی پیشنهادی (در صورت وجود)" class="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded text-slate-700 focus:bg-white focus:border-rose-400 focus:outline-none">
            </div>
        `;
        container.appendChild(itemRow);
    });

    form.classList.remove('hidden');
}

// ۵. هندل ثبت فرم و ذخیره در IndexedDB
async function handleFormSubmit(e) {
    e.preventDefault();

    const checklistKey = document.getElementById('checklistSelect').value;
    const checklistDef = CHECKLIST_DEFINITIONS[checklistKey];
    if (!checklistDef) return;

    const date = document.getElementById('inspDate').value;
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
        date,
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

    alert('✅ بازرسی با موفقیت ثبت شد و داشبورد به‌روز گردید.');

    await refreshHistoryAndCharts();
}

// ۶. به‌روزرسانی تاریخچه، KPIها و نمودارها
async function refreshHistoryAndCharts() {
    const list = await db.inspections.reverse().toArray();

    // به‌روزرسانی کارت‌های شاخص (KPI)
    const totalInspections = list.length;
    let totalC = 0, totalNC = 0, totalEquips = new Set();

    list.forEach(item => {
        totalC += item.compliantCount;
        totalNC += item.nonCompliantCount;
        if (item.equipmentCode) totalEquips.add(item.equipmentCode);
    });

    const totalEvaluated = totalC + totalNC;
    const avgRate = totalEvaluated > 0 ? Math.round((totalC / totalEvaluated) * 100) : 0;

    document.getElementById('kpiTotal').innerText = totalInspections;
    document.getElementById('kpiCompliance').innerText = `${avgRate}%`;
    document.getElementById('kpiNonConform').innerText = totalNC;
    document.getElementById('kpiEquipments').innerText = totalEquips.size;

    // به‌روزرسانی جدول تاریخچه
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center p-4 text-slate-400">هنوز بازرسی ثبت نشده است.</td></tr>`;
    } else {
        list.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50 border-b border-slate-100";
            tr.innerHTML = `
                <td class="p-2.5 font-mono">${row.date}</td>
                <td class="p-2.5 font-bold font-mono text-blue-700">${row.equipmentCode}</td>
                <td class="p-2.5 font-medium">${row.checklistName}</td>
                <td class="p-2.5">${row.location}</td>
                <td class="p-2.5">${row.inspector}</td>
                <td class="p-2.5 text-center text-emerald-600 font-bold">${row.compliantCount}</td>
                <td class="p-2.5 text-center text-rose-600 font-bold">${row.nonCompliantCount}</td>
                <td class="p-2.5 text-center">
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold ${row.complianceRate >= 85 ? 'bg-emerald-100 text-emerald-800' : (row.complianceRate >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')}">
                        ${row.complianceRate}%
                    </span>
                </td>
                <td class="p-2.5 text-center">
                    <button onclick="deleteRecord(${row.id})" class="text-rose-500 hover:text-rose-700 font-bold">حذف</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ترسیم نمودارها
    renderCharts(list, totalC, totalNC);
}

// ۷. ترسیم نمودارهای Chart.js
function renderCharts(list, totalC, totalNC) {
    // نمودار ۱: دایره‌ای انطباق
    const ctx1 = document.getElementById('complianceChart').getContext('2d');
    if (complianceChartInstance) complianceChartInstance.destroy();

    complianceChartInstance = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['موارد منطبق (C)', 'موارد عدم انطباق (NC)'],
            datasets: [{
                data: [totalC || 0, totalNC || 0],
                backgroundColor: ['#10b981', '#f43f5e'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { font: { family: 'sans-serif', size: 11 } } }
            }
        }
    });

    // نمودار ۲: میله‌ای عدم‌انطباق‌ها بر حسب چک‌لیست
    const categoryCounts = {
        kitchen: 0,
        elec_panel: 0,
        elec_substation: 0,
        elec_portable: 0,
        elec_general: 0,
        fire_ext: 0,
        fire_box: 0
    };

    list.forEach(r => {
        if (categoryCounts[r.checklistType] !== undefined) {
            categoryCounts[r.checklistType] += r.nonCompliantCount;
        }
    });

    const ctx2 = document.getElementById('categoryChart').getContext('2d');
    if (categoryChartInstance) categoryChartInstance.destroy();

    categoryChartInstance = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['آشپزخانه', 'تابلو برق', 'پست برق', 'ابزار پرتابل', 'ایمنی عمومی', 'کپسول‌ها', 'فایرباکس'],
            datasets: [{
                label: 'تعداد عدم‌انطباق‌ها',
                data: Object.values(categoryCounts),
                backgroundColor: '#3b82f6',
                borderRadius: 4
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

// ۸. خروجی اکسل با SheetJS (.xlsx)
async function exportToExcel() {
    const list = await db.inspections.toArray();
    if (list.length === 0) {
        alert('هیچ اطلاعاتی برای صدور خروجی اکسل یافت نشد.');
        return;
    }

    const excelData = list.map((item, index) => ({
        "ردیف": index + 1,
        "تاریخ بازرسی": item.date,
        "کد اختصاصی تجهیز (Tag ID)": item.equipmentCode,
        "نوع چک‌لیست": item.checklistName,
        "محل / واحد استقرار": item.location,
        "نام بازرس": item.inspector,
        "تعداد انطباق": item.compliantCount,
        "تعداد عدم‌انطباق": item.nonCompliantCount,
        "عدم‌کاربرد": item.naCount,
        "درصد انطباق (%)": item.complianceRate,
        "شرح عدم‌انطباق‌ها و اقدامات اصلاحی": item.issues || 'بدون عدم‌انطباق'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // تنظیم عرض ستون‌ها برای خوانایی بهتر در اکسل
    worksheet['!cols'] = [
        { wch: 6 },  // ردیف
        { wch: 12 }, // تاریخ
        { wch: 16 }, // کد تجهیز
        { wch: 32 }, // نوع چک‌لیست
        { wch: 18 }, // محل
        { wch: 16 }, // بازرس
        { wch: 12 }, // انطباق
        { wch: 14 }, // عدم‌انطباق
        { wch: 10 }, // عدم‌کاربرد
        { wch: 14 }, // درصد
        { wch: 45 }  // شرح اقدامات
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "گزارش بازرسی HSE");

    const todayStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `HSE_Inspection_Report_${todayStr}.xlsx`);
}

// ۹. حذف یک رکورد
window.deleteRecord = async function(id) {
    if (confirm('آیا از حذف این رکورد بازرسی اطمینان دارید؟')) {
        await db.inspections.delete(id);
        await refreshHistoryAndCharts();
    }
};

// ۱۰. پاک‌سازی کل اطلاعات
async function clearAllData() {
    if (confirm('⚠️ اخطار: آیا از پاک‌سازی کامل تمام رکوردهای بازرسی اطمینان دارید؟ این عملیات غیرقابل بازگشت است.')) {
        await db.inspections.clear();
        await refreshHistoryAndCharts();
    }
}
