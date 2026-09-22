// ۱. راه‌اندازی دیتابیس Dexie
const db = new Dexie('HSE_Inspection_System');
db.version(1).stores({
    inspections: '++id, type, date, location, inspector, safeCount, unsafeCount, naCount, details'
});

// ۲. بانک سوالات استاندارد هر چک‌لیست
const standardChecklists = {
    electrical: {
        title: "چک‌لیست ایمنی برق و تابلوها (مطابق استاندارد OSHA 1910.303)",
        items: [
            "عدم وجود سیم، کابل لخت و فرسوده در مسیر تردد و خطوط تولید",
            "بسته و قفل بودن درب تابلوهای برق اصلی و فرعی",
            "نصب برچسب‌های هشدار خطر برق‌گرفتگی روی تابلوها",
            "صحت عملکرد کلیدهای محافظ جان (RCD / نشتی جریان)",
            "وجود و اتصال صحیح کابل سیستم ارتینگ به تجهیزات و تابلو",
            "رعایت حریم ایمنی اطراف تابلوهای برق (حداقل ۹۰ سانتی‌متر عدم چیدمان)",
            "استفاده از تجهیزات ضد جرقه (Explosion Proof) در محیط‌های مستعد گاز/غبار",
            "کالیبراسیون و بررسی دوره‌ای بار مصرفی فیدرها و کابل‌ها"
        ]
    },
    firebox: {
        title: "چک‌لیست جعبه‌های آتش‌نشانی - فایرباکس (مطابق NFPA 14/25)",
        items: [
            "دسترسی آزاد و عدم چیدمان بار یا مانع در مقابل جعبه (شعاع ۱ متر)",
            "سالم بودن درب، قفل، لولا و شیشه جعبه آتش‌نشانی",
            "سالم بودن قرقره و باز شدن آسان و روان شیلنگ",
            "عدم پوسیدگی، سوراخ بودن یا فرسودگی شیلنگ (برزنتی / هوزریلی)",
            "سالم بودن نازل (سرلول)، اتصال محکم و کارکرد اهرم پاشش (مه‌پاش/جت)",
            "عدم نشتی آب از شیر فلکه (کوپلینگ)، اورینگ و اتصالات",
            "خوانا بودن شماره‌گذاری جعبه و وجود علائم راهنمای شب‌نما",
            "بررسی فشار هیدرواستاتیک آب داخل شبکه اطفاء"
        ]
    },
    extinguisher: {
        title: "چک‌لیست کپسول‌های آتش‌نشانی قابل‌حمل (مطابق NFPA 10)",
        items: [
            "قرار داشتن عقربه مانومتر (گیج فشار) در محدوده سبز رنگ",
            "وجود پین ضامن و سلامت پلمپ سربی / پلاستیکی کپسول",
            "عدم فرسودگی، ترک‌خوردگی یا گرفتگی شیپوره و شیلنگ خروجی",
            "نصب بودن کپسول در ارتفاع استاندارد (۱۰ الی ۱۵۰ سانتی‌متر از کف)",
            "دارا بودن کارت بازرسی ماهانه دارای امضاء و تاریخ معتبر",
            "عدم زنگ‌زدگی، فرورفتگی، سوختگی یا صدمه فیزیکی روی سیلندر",
            "عدم انسداد مسیر دسترسی به کپسول و وجود تابلوی راهنما در بالا",
            "تطابق نوع خاموش‌کننده با نوع خطرات حریق احتمالی محل (A, B, C, D, K)"
        ]
    },
    kitchen: {
        title: "چک‌لیست بهداشت و ایمنی آشپزخانه و غذاخوری (مطابق استانداردهای بهداشت حرفه‌ای)",
        items: [
            "دارا بودن کارت بهداشت و سلامت معتبر برای کلیه پرسنل خدمات و طبخ",
            "استفاده پرسنل از کلاه، روپوش، دستکش و کفش ایمنی ضدلغزش مناسب",
            "کارکرد صحیح و مکش استاندارد هودهای تهویه صنعتی بالای دیگ‌ها و کباب‌پز",
            "وجود کپسول اطفای حریق کلاس K (مخصوص روغن‌های خوراکی) و پتو نسوز",
            "سلامت شیلنگ‌های گاز، عدم استفاده از رابط غیراستاندارد و وجود بست فلزی",
            "تفکیک و درپوش‌دار بودن سطل‌های زباله و تخلیه به موقع آن‌ها",
            "نظافت مداوم سطوح، ترالی‌ها، چربی‌زدایی دیوارها و ضدعفونی تخته‌های گوشت",
            "کنترل دمای استاندارد سردخانه‌ها، یخچال‌ها و ثبت در چک‌لیست حرارتی"
        ]
    }
};

let currentTab = 'dashboard';
let charts = {};

// ۳. جابجایی بین تب‌ها
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    const activeBtn = document.getElementById(`tab-${tab}`);
    if (activeBtn) activeBtn.classList.add('active-tab');

    const formSec = document.getElementById('form-container');
    const dashSec = document.getElementById('dashboard-view');
    const histSec = document.getElementById('history-view');

    formSec.classList.add('hidden');
    dashSec.classList.add('hidden');
    histSec.classList.add('hidden');

    if (tab === 'dashboard') {
        dashSec.classList.remove('hidden');
        renderDashboard();
    } else if (tab === 'history') {
        histSec.classList.remove('hidden');
        renderHistory();
    } else {
        formSec.classList.remove('hidden');
        loadChecklistForm(tab);
    }
}

// ۴. بارگذاری فرم چک‌لیست انتخابی
function loadChecklistForm(type) {
    const data = standardChecklists[type];
    document.getElementById('checklist-title').innerText = data.title;
    
    // تنظیم تاریخ جاری شمسی به کمک فرمتر داخلی جاوااسکریپت
    const today = new Intl.DateTimeFormat('fa-IR').format(new Date());
    document.getElementById('insp-date').value = today;

    const container = document.getElementById('checklist-questions');
    container.innerHTML = '';

    data.items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = "p-3 bg-slate-50 border rounded-lg hover:bg-slate-100 transition";
        row.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <span class="text-sm font-semibold text-slate-700">${index + 1}. ${item}</span>
                <div class="flex items-center gap-4 text-xs font-bold">
                    <label class="flex items-center gap-1 cursor-pointer text-emerald-600">
                        <input type="radio" name="item_${index}" value="safe" checked class="w-4 h-4 accent-emerald-600">
                        ایمن
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer text-rose-600">
                        <input type="radio" name="item_${index}" value="unsafe" class="w-4 h-4 accent-rose-600">
                        ناایمن
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer text-slate-500">
                        <input type="radio" name="item_${index}" value="na" class="w-4 h-4 accent-slate-500">
                        نامربوط
                    </label>
                </div>
            </div>
            <input type="text" id="desc_${index}" placeholder="توضیح یا اقدام اصلاحی (اختیاری)" class="mt-2 w-full p-1.5 border rounded text-xs bg-white text-slate-600">
        `;
        container.appendChild(row);
    });
}

// ۵. ذخیره‌سازی بازرسی در Dexie
async function saveInspection() {
    const inspector = document.getElementById('inspector-name').value.trim();
    const location = document.getElementById('insp-location').value.trim();
    const date = document.getElementById('insp-date').value;

    if (!inspector || !location) {
        alert("لطفاً نام بازرس و محل استقرار را وارد کنید.");
        return;
    }

    const items = standardChecklists[currentTab].items;
    let safeCount = 0;
    let unsafeCount = 0;
    let naCount = 0;
    let details = [];

    items.forEach((item, index) => {
        const status = document.querySelector(`input[name="item_${index}"]:checked`).value;
        const note = document.getElementById(`desc_${index}`).value;
        if (status === 'safe') safeCount++;
        else if (status === 'unsafe') unsafeCount++;
        else naCount++;

        details.push({ item, status, note });
    });

    await db.inspections.add({
        type: currentTab,
        date,
        inspector,
        location,
        safeCount,
        unsafeCount,
        naCount,
        details
    });

    alert("✅ بازرسی با موفقیت ثبت شد.");
    switchTab('dashboard');
}

// ۶. رندر داشبورد و نمودارها
async function renderDashboard() {
    const all = await db.inspections.toArray();
    document.getElementById('total-inspections').innerText = all.length;

    let totalSafe = 0, totalUnsafe = 0, totalNa = 0;
    let categoryUnsafe = { electrical: 0, firebox: 0, extinguisher: 0, kitchen: 0 };

    all.forEach(record => {
        totalSafe += record.safeCount;
        totalUnsafe += record.unsafeCount;
        totalNa += record.naCount;
        if (categoryUnsafe[record.type] !== undefined) {
            categoryUnsafe[record.type] += record.unsafeCount;
        }
    });

    document.getElementById('total-safe').innerText = totalSafe;
    document.getElementById('total-unsafe').innerText = totalUnsafe;

    const totalEvaluated = totalSafe + totalUnsafe;
    const rate = totalEvaluated > 0 ? Math.round((totalSafe / totalEvaluated) * 100) : 0;
    document.getElementById('compliance-rate').innerText = `${rate}%`;

    // رسم نمودار میله‌ای عدم انطباق‌ها
    if (charts.bar) charts.bar.destroy();
    const ctxBar = document.getElementById('categoryChart').getContext('2d');
    charts.bar = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['ایمنی برق', 'فایرباکس', 'کپسول‌ها', 'آشپزخانه'],
            datasets: [{
                label: 'تعداد عدم‌انطباق (خطر)',
                data: [
                    categoryUnsafe.electrical,
                    categoryUnsafe.firebox,
                    categoryUnsafe.extinguisher,
                    categoryUnsafe.kitchen
                ],
                backgroundColor: ['#f87171', '#fb923c', '#fbbf24', '#38bdf8']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // رسم نمودار دایره‌ای نسبت کل وضعیت‌ها
    if (charts.pie) charts.pie.destroy();
    const ctxPie = document.getElementById('ratioChart').getContext('2d');
    charts.pie = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['ایمن', 'ناایمن', 'نامربوط'],
            datasets: [{
                data: [totalSafe, totalUnsafe, totalNa],
                backgroundColor: ['#10b981', '#ef4444', '#94a3b8']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// ۷. نمایش تاریخچه سوابق
async function renderHistory() {
    const list = await db.inspections.toArray();
    const tbody = document.getElementById('history-table-body');
    tbody.innerHTML = '';

    const typeTitles = {
        electrical: '⚡ برق',
        firebox: '🚒 فایرباکس',
        extinguisher: '🧯 کپسول',
        kitchen: '🍽️ آشپزخانه'
    };

    list.reverse().forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-slate-50";
        tr.innerHTML = `
            <td class="p-3">${index + 1}</td>
            <td class="p-3 font-semibold text-teal-800">${typeTitles[item.type] || item.type}</td>
            <td class="p-3">${item.location}</td>
            <td class="p-3 text-xs text-slate-500">${item.date}</td>
            <td class="p-3 text-emerald-600 font-bold">${item.safeCount}</td>
            <td class="p-3 text-rose-600 font-bold">${item.unsafeCount}</td>
            <td class="p-3">
                <button onclick="deleteRecord(${item.id})" class="text-rose-500 hover:text-rose-700 text-xs">حذف</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ۸. حذف رکورد
async function deleteRecord(id) {
    if (confirm("آیا از حذف این رکورد اطمینان دارید؟")) {
        await db.inspections.delete(id);
        renderHistory();
    }
}

// ۹. پاکسازی کل دیتابیس
async function clearAllData() {
    if (confirm("آیا می‌خواهید تمام سوابق حذف شوند؟ این عملیات برگشت‌پذیر نیست.")) {
        await db.inspections.clear();
        renderHistory();
        renderDashboard();
    }
}

// ۱۰. خروجی اکسل هوشمند دوحالته (اندروید Native Share + دانلود مستقیم ویندوز)
async function exportToExcel() {
    const filter = document.getElementById('export-filter').value;
    let data = await db.inspections.toArray();

    if (filter !== 'all') {
        data = data.filter(d => d.type === filter);
    }

    if (data.length === 0) {
        alert("هیچ رکوردی برای استخراج اکسل یافت نشد.");
        return;
    }

    // ساخت آرایه دیتای فلت برای شیت اکسل با هدرهای فارسی
    const rows = [];
    data.forEach(rec => {
        rec.details.forEach((det, idx) => {
            rows.push({
                "کد بازرسی": rec.id,
                "حوزه بازرسی": rec.type,
                "تاریخ": rec.date,
                "محل استقرار": rec.location,
                "نام بازرس": rec.inspector,
                "ردیف آیتم": idx + 1,
                "شرح استاندارد": det.item,
                "وضعیت": det.status === 'safe' ? 'ایمن' : (det.status === 'unsafe' ? 'ناایمن' : 'نامربوط'),
                "اقدام اصلاحی / توضیحات": det.note || '-'
            });
        });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HSE_Reports");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `گزارش_جامع_HSE_${new Date().toISOString().slice(0,10)}.xlsx`;

    // مکانیزم اشتراک اندروید در صورت پشتیبانی
    const file = new File([blob], fileName, { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: 'گزارش بازرسی HSE',
                text: 'فایل خروجی اکسل بازرسی‌های دوره‌ای HSE'
            });
            return;
        } catch (e) {
            console.log("اشتراک لغو شد یا با خطا مواجه شد، استفاده از دانلود مستقیم.");
        }
    }

    // دانلود استاندارد در مرورگر ویندوز
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// بارگذاری اولیه
window.onload = () => {
    switchTab('dashboard');
};
