// --- ۱. پایگاه داده Dexie ---
const db = new Dexie('HSEInspectionDB');
db.version(1).stores({
  inspections: '++id, checklistId, checklistTitle, category, date, inspector, unitCode, equipmentCode, location, overallStatus, createdAt'
});

const HSE_DB = {
  async saveInspection(data) {
    data.createdAt = new Date().toISOString();
    return await db.inspections.add(data);
  },
  async getAllInspections() {
    return await db.inspections.orderBy('id').reverse().toArray();
  },
  async deleteInspection(id) {
    return await db.inspections.delete(Number(id));
  },
  async getSummaryStats() {
    const all = await db.inspections.toArray();
    let compliant = 0, warning = 0, critical = 0;
    all.forEach(item => {
      if (item.overallStatus === 'compliant') compliant++;
      else if (item.overallStatus === 'warning') warning++;
      else if (item.overallStatus === 'critical') critical++;
    });
    return {
      total: all.length,
      compliant,
      warning,
      critical,
      kitchenCount: all.filter(i => i.category === 'kitchen').length,
      electricalCount: all.filter(i => i.category === 'electrical').length
    };
  }
};

// --- ۲. داده‌های ۵ چک‌لیست تخصصی ---
const CHECKLIST_CONFIGS = {
  kitchen: {
    id: "kitchen",
    title: "بازرسی و ممیزی بهداشت و ایمنی آشپزخانه و غذاخوری",
    badge: "بهداشت محیط",
    category: "kitchen",
    sections: [
      {
        title: "بخش اول: بهداشت فردی پرسنل",
        items: [
          { id: "k1", text: "آیا پرسنل دارای کارت بهداشت معتبر و گواهی دوره آموزش بهداشت هستند؟" },
          { id: "k2", text: "آیا پرسنل از لباس کار تمیز، کلاه، ماسک، روپوش روشن و دستکش یکبار مصرف استفاده می‌کنند؟" },
          { id: "k3", text: "آیا بهداشت فردی (کوتاه بودن ناخن‌ها، نداشتن زیورآلات حین کار، عدم وجود زخم باز در دست) رعایت می‌شود؟" }
        ]
      },
      {
        title: "بخش دوم: نگهداری مواد غذایی، انبار و سردخانه‌ها",
        items: [
          { id: "k4", text: "آیا مواد خام و پخته به‌طور کامل مجزا از یکدیگر نگهداری می‌شوند (جلوگیری از آلودگی متقاطع / Cross-Contamination)؟" },
          { id: "k5", text: "آیا دمای سردخانه‌ها، یخچال‌ها و فریزرها مناسب بوده و لاگ ثبت روزانه دما تکمیل می‌شود؟" },
          { id: "k6", text: "آیا تاریخ تولید و انقضای مواد غذایی کنترل شده و سیستم FIFO رعایت می‌شود؟" },
          { id: "k7", text: "آیا مواد غذایی روی پالت‌های بهداشتی و با فاصله استاندارد از کف و دیوار (حداقل ۱۵ سانتی‌متر) چیده شده‌اند؟" }
        ]
      },
      {
        title: "بخش سوم: شستشو، ضدعفونی و مدیریت پسماند",
        items: [
          { id: "k8", text: "آیا فرآیند انگل‌زدایی و شستشوی ۴ مرحله‌ای سبزیجات و میوه‌ها به طور دقیق انجام می‌شود؟" },
          { id: "k9", text: "آیا سینک‌های شستشوی ظروف، مواد پروتئینی و سبزیجات به صورت مجزا تفکیک شده‌اند؟" },
          { id: "k10", text: "آیا سطل‌های زباله از نوع پدالی، دارای کیسه زباله سالم و دربسته بوده و به موقع تخلیه می‌شوند؟" }
        ]
      },
      {
        title: "بخش چهارم: ایمنی تجهیزات، تأسیسات و شرایط محیطی",
        items: [
          { id: "k11", text: "آیا کف، دیوارها، سقف و کانال‌های تهویه تمیز، بدون ترک‌خوردگی، روغن‌گرفتگی و شستشوپذیر هستند؟" },
          { id: "k12", text: "آیا توری‌های ضد حشرات روی پنجره‌ها و هواکش‌ها سالم و نصب شده‌اند و اثری از حشرات یا جوندگان وجود ندارد؟" },
          { id: "k13", text: "آیا تجهیزات برقی، سیم‌کشی‌ها، کلید/پریزهای ضدآب و سیستم اتصال زمین (ارت) ایمن غذایی روی پالت‌های بهداشتی و با فاصله استاندارد از کف و دیوار (حداقل ۱۵ سانتی‌متر) چیده شده‌اند؟" }
        ]
      },
      {
        title: "بخش سوم: شستشو، ضدعفونی و مدیریت پسماند",
        items: [
          { id: "k8", text: "آیا فرآیند انگل‌زدایی و شستشوی ۴ مرحله‌ای سبزیجات و میوه‌ها به طور دقیق انجام می‌شود؟" },
          { id: "k9", text: "آیا سینک‌های شستشوی ظروف، مواد پروتئینی و سبزیجات به صورت مجزا تفکیک شده‌اند؟" },
          { id: "k10", text: "آیا سطل‌های زباله از نوع پدالی، دارای کیسه زباله سالم و دربسته بوده و به موقع تخلیه می‌شوند؟" }
        ]
      },
      {
        title: "بخش چهارم: ایمنی تجهیزات، تأسیسات و شرایط محیطی",
        items: [
          { id: "k11", text: "آیا کف، دیوارها، سقف و کانال‌های تهویه تمیز، بدون ترک‌خوردگی، روغن‌گرفتگی و شستشوپذیر هستند؟" },
          { id: "k12", text: "آیا توری‌های ضد حشرات روی پنجره‌ها و هواکش‌ها سالم و نصب شده‌اند و اثری از حشرات یا جوندگان وجود ندارد؟" },
          { id: "k13", text: "آیا تجهیزات برقی، سیم‌کشی‌ها، کلید/پریزهای ضدآب و سیستم اتصال زمین (ارت) ایمن و بدون نقص هستند؟" },
          { id: "k14", text: "آیا سیستم‌های گازسوز، اتصالات، شیلنگ‌ها، بست‌ها و شیرهای قطع‌کن اضطراری گاز ایمن و فاقد نشتی هستند؟" },
          { id: "k15", text: "آیا هودها و فیلترهای چربی‌گیر تمیز بوده و سیستم تهویه به خوبی بخارات و حرارت را خارج می‌کند؟" }
        ]
      },
      {
        title: "بخش پنجم: ایمنی، پیشگیری از حریق و شرایط اضطراری",
        items:      },
      {
        title: "تجهیزات حفاظتی و ترموگرافی",
        items: [
          { id: "ep4", text: "آیا کلیدهای محافظ جان (RCD/RCCB) نصب شده و عملکرد آنها تست شده است؟" },
          { id: "ep5", text: "آیا شینه‌ها و ترمینال‌ها فاقد شل‌بودگی، تغییر رنگ یا آثار سوختگی هستند؟" },
          { id: "ep6", text: "آیا بدنه فلزی تابلو به شبکه ارتینگ همبندی شده است؟" },
          { id: "ep7", text: "آیا لاستیک فرش عایق استاندارد در مقابل تابلو پهن شده است؟" }
        ]
      }
    ]
  },
  elec_substation: {
    id: "elec_substation",
    title: "چک‌لیست پست‌های توزیع و ترانسفورماتور",
    badge: "فشار متوسط/قوی",
    category: "electrical",
    sections: [
      {
        title: "ساختمان و دسترسی",
        items: [
          { id: "es1", text: "آیا درب‌های پست مجهز به قفل ایمن، توری ضد جوندگان و علائم هشدار هستند؟" },
          { id: "es2", text: "آیا سیستم تهویه و دمای محیط پست ترانسفورماتور مناسب است؟" },
          { id: "es3", text: "آیا روشنایی عادی و اضطراری محوطه پست سالم است؟" }
        ]
      },
      {
        title: "ترانسفورماتور و تجهیزات فشار متوسط",
        items: [
          { id: "es4", text: "آیا سطح روغن ترانس، رنگ سیلیکاژل و گیج‌های دما/فشار در محدوده مجاز هستند؟" },
          { id: "es5", text: "آیا ترانسفورماتور فاقد نشتی روغن یا صدای غیرعادی (زوزه شدید) است؟" },
          { id: "es6", text: "آیا حوضچه جمع‌آوری روغن ترانس سالم، تمیز و دارای قلوه‌سنگ است؟" },
          { id: "es7", text: "آیا تجهیزات ایمنی فردی عایق (چوب استیک، دستکش ولتاژ بالا) موجود و تست شده هستند؟" }
        ]
      }
    ]
  },
  elec_portable: {
    id: "elec_portable",
    title: "چک‌لیست ابزارها و تجهیزات برقی پرتابل",
    badge: "تجهیزات متحرک",
    category: "electrical",
    sections: [
      {
        title: "کابل و اتصالات",
        items: [
          { id: "pt1", text: "آیا کابل تغذیه ابزار برقی فاقد چسب‌خوردگی، لهیدگی و لخت‌شدگی عایق است؟" },
          { id: "pt2", text: "آیا دوشاخه برق دستگاه صنعتی و سالم بوده و از اتصال مستقیم سرسیم به پریز خودداری شده است؟" },
          { id: "pt3", text: "آیا گلند و مهار کشش فیزیکی کابل در ورودی دستگاه سالم است؟" }
        ]
      },
      {
        title: "حفاظت‌ها و ایمنی مکانیکی",
        items: [
          { id: "pt4", text: "آیا دستگاه دارای عایق دوبل یا اتصال ارت بدنه است؟" },
          { id: "pt5", text: "آیا کلید قطع اضطراری یا سوئیچ Dead-man دستگاه به درستی کار می‌کند؟" },
          { id: "pt6", text: "آیا حفاظ‌های مکانیکی (گارد سنگ فرز، قاب اره) نصب و محکم هستند؟" }
        ]
      }
    ]
  },
  elec_earthing: {
    id: "elec_earthing",
    title: "چک‌لیست ایمنی عمومی و ارتینگ محیطی",
    badge: "حفاظت عمومی",
    category: "electrical",
    sections: [
      {
        title: "چاه‌ها و شبکه‌های ارتینگ",
        items: [
          { id: "ge1", text: "آیا حوضچه‌های تست ارت در دسترس، تمیز و دارای پلاک شناسایی هستند؟" },
          { id: "ge2", text: "آیا مقاومت چاه‌های ارت زیر حد مجاز استاندارد (کمتر از ۲ اهم) تایید شده است؟" },
          { id: "ge3", text: "آیا همبندی سیستم ارت با سازه‌های فلزی و لوله‌ها برقرار است؟" }
        ]
      },
      {
        title: "تأسیسات محیطی و صاعقه‌گیر",
        items: [
          { id: "ge4", text: "آیا کابل‌ها روی سینی کابل استاندارد مهار شده و فاقد آویزان بودن هستند؟" },
          { id: "ge5", text: "آیا کلید و پریزهای محیط‌های باز و مرطوب از نوع ضدآب (IP44 به بالا) هستند؟" },
          { id: "ge6", text: "آیا سیستم صاعقه‌گیر و هادی‌های نزولی متصل به زمین سالم هستند؟" }
        ]
      }
    ]
  }
};

// --- ۳. متغیرها و شروع کار ---
let currentActiveChecklist = 'kitchen';
let statusChartInstance = null;
let categoryChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('insp_date');
  if (dateInput) dateInput.value = today;

  loadChecklistForm('kitchen');
  updateDashboardView();
});

// ناوبری تب‌ها
function switchMainTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('bg-sky-600', 'text-white');
    btn.classList.add('text-slate-300');
  });

  const activeContent = document.getElementById(`tab-${tabName}`);
  if (activeContent) activeContent.classList.remove('hidden');

  const activeBtn = document.getElementById(`nav-btn-${tabName}`);
  if (activeBtn) {
    activeBtn.classList.add('bg-sky-600', 'text-white');
    activeBtn.classList.remove('text-slate-300');
  }

  if (tabName === 'records') loadRecordsTable();
  if (tabName === 'dashboard') updateDashboardView();
}

// انتخاب چک‌لیست
function selectChecklist(key) {
  currentActiveChecklist = key;
  document.querySelectorAll('.checklist-selector-btn').forEach(btn => {
    btn.classList.remove('border-sky-500', 'bg-slate-800');
    btn.classList.add('border-slate-800', 'bg-slate-900');
  });
  const selectedBtn = document.getElementById(`btn-select-${key}`);
  if (selectedBtn) {
    selectedBtn.classList.remove('border-slate-800', 'bg-slate-900');
    selectedBtn.classList.add('border-sky-500', 'bg-slate-800');
  }
  loadChecklistForm(key);
}

// رندر داینامیک سوالات
function loadChecklistForm(key) {
  const config = CHECKLIST_CONFIGS[key];
  if (!config) return;

  document.getElementById('formTitle').innerText = config.title;
  document.getElementById('formBadge').innerText = config.badge;

  const container = document.getElementById('checklistItemsContainer');
  container.innerHTML = '';

  config.sections.forEach((sec, sIndex) => {
    const secEl = document.createElement('div');
    secEl.className = 'bg-slate-900 rounded-2xl p-4 md:p-5 border border-slate-700/60 shadow-lg';
    
    let itemsHtml = sec.items.map((item, iIndex) => `
      <div class="py-4 border-b border-slate-700/40 last:border-0">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <p class="text-sm md:text-base text-slate-100 font-medium leading-relaxed">
            <span class="inline-block w-6 h-6 rounded-full bg-slate-700 text-sky-400 text-xs text-center leading-6 font-bold ml-2">${sIndex + 1}.${iIndex + 1}</span>
            ${item.text}
          </p>
          <div class="flex items-center gap-2 self-end md:self-center shrink-0">
            <label class="cursor-pointer">
              <input type="radio" name="status_${item.id}" value="yes" class="peer sr-only radio-custom" checked>
