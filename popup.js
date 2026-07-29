const api = globalThis.browser ?? globalThis.chrome;
const ids = [
  "enabled",
  "azkarInterval",
  "duaInterval",
  "quranInterval",
  "hadithInterval",
  "morningTime",
  "eveningTime",
  "morningEveningEnabled",
  "prayerEnabled",
  "adhanSound",
  "adhanVoice",
  "calculationMethod",
];
const $ = (id) => document.getElementById(id);
const translations = {
  ar: {
    app: "رفيق المسلم",
    daily: "رفيقك اليومي",
    enable: "تفعيل الرفيق",
    location: "تحديث الموقع الآن",
    reminders: "التذكيرات الدورية",
    zero: "0 = إيقاف",
    zikr: "ذكر",
    dua: "دعاء",
    ayahOrder: "آية بالترتيب",
    hadith: "حديث شريف",
    minute: "دقيقة",
    morningEvening: "أذكار الصباح والمساء",
    autoOpen: "فتحها تلقائيًا",
    morning: "الصباح",
    evening: "المساء",
    timeHint: "اكتب الوقت بنظام 12 ساعة: 07:00 ص أو 07:00 AM",
    prayerAdhan: "الصلاة والأذان",
    prayerAlerts: "تنبيهات الصلوات",
    playAdhan: "تشغيل الأذان",
    muezzin: "صوت المؤذن",
    defaultAdhan: "الأذان الافتراضي",
    marwan: "محمد مروان بن قسّاس — الحرم المدني",
    nufais: "الشيخ أحمد النفيس",
    makkah: "أذان مكة المكرمة",
    aqsa: "أذان المسجد الأقصى",
    classic2: "أذان كلاسيكي ٢",
    classic3: "أذان كلاسيكي ٣",
    preview: "▶ استمع للمعاينة",
    calculation: "طريقة الحساب",
    egypt: "الهيئة المصرية العامة للمساحة",
    umm: "أم القرى",
    mwl: "رابطة العالم الإسلامي",
    save: "حفظ وتشغيل",
    zikrNow: "ذكر الآن",
    ayahNow: "آية الآن",
    hadithNow: "حديث الآن",
    library: "مؤذنون من المكتبة العالمية",
  },
  en: {
    app: "Muslim Companion",
    daily: "Your daily companion",
    enable: "Enable companion",
    location: "Update location",
    reminders: "Recurring reminders",
    zero: "0 = off",
    zikr: "Zikr",
    dua: "Dua",
    ayahOrder: "Ayah in order",
    hadith: "Hadith",
    minute: "minutes",
    morningEvening: "Morning & evening adhkar",
    autoOpen: "Send automatically",
    morning: "Morning",
    evening: "Evening",
    timeHint: "Use 12-hour time: 07:00 AM or 06:00 PM",
    prayerAdhan: "Prayer & adhan",
    prayerAlerts: "Prayer alerts",
    playAdhan: "Play adhan",
    muezzin: "Muezzin voice",
    defaultAdhan: "Default adhan",
    marwan: "Muhammad Marwan Qassas — Madinah",
    nufais: "Sh. Ahmed Al-Nufais",
    makkah: "Makkah adhan",
    aqsa: "Al-Aqsa adhan",
    classic2: "Classic adhan 2",
    classic3: "Classic adhan 3",
    preview: "▶ Preview sound",
    calculation: "Calculation method",
    egypt: "Egyptian General Authority of Survey",
    umm: "Umm al-Qura",
    mwl: "Muslim World League",
    save: "Save & start",
    zikrNow: "Zikr now",
    ayahNow: "Ayah now",
    hadithNow: "Hadith now",
    library: "Muezzins from global library",
  },
};
let language = "ar";
const t = (key) => translations[language][key] || key;
function applyLanguage(next) {
  language = next;
  document.documentElement.lang = next;
  document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  document.title = t("app");
  $("language").textContent = next === "ar" ? "English" : "العربية";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  const group = $("adhanVoice").querySelector("#global-muezzins");
  if (group) group.label = t("library");
}
function time12(value) {
  const match = String(value).match(/(\d{1,2}):(\d{2})\s*(AM|PM|ص|م)?/i);
  if (!match) return value;
  let hour = Number(match[1]);
  const minute = match[2];
  const suffix = match[3]?.toUpperCase();
  if (suffix === "PM" || suffix === "م") hour = hour === 12 ? 12 : hour + 12;
  else if (suffix === "AM" || suffix === "ص") hour = hour === 12 ? 0 : hour;
  return `${((hour + 11) % 12) + 1}:${minute} ${hour >= 12 ? "م" : "ص"}`;
}
function say(text) {
  $("status").textContent = text;
  setTimeout(() => {
    $("status").textContent = "";
  }, 3500);
}
async function message(data) {
  return api.runtime.sendMessage(data);
}
async function loadAllMuezzins(selectedVoice) {
  try {
    const response = await fetch("https://alfurqan.online/api/v1/athan/list");
    if (!response.ok) throw new Error();
    const { athans } = await response.json();
    const select = $("adhanVoice");
    select.querySelector("#global-muezzins")?.remove();
    const group = document.createElement("optgroup");
    group.id = "global-muezzins";
    group.label = t("library");
    athans.forEach((athan) => {
      const option = document.createElement("option");
      option.value = `af_${athan.id}`;
      option.textContent = `${athan.name} — ${athan.location || "غير محدد"}`;
      group.append(option);
    });
    select.append(group);
    if ([...select.options].some((option) => option.value === selectedVoice))
      select.value = selectedVoice;
  } catch (_) {
    /* تظل الأصوات المدمجة متاحة إذا تعذر الاتصال */
  }
}
async function load() {
  const result = await message({ type: "dashboard" });
  const s = result.settings;
  applyLanguage(s.language === "en" ? "en" : "ar");
  ids.forEach((id) => {
    const element = $(id);
    element.type === "checkbox"
      ? (element.checked = s[id])
      : (element.value = s[id]);
  });
  $("morningTime").value = time12(s.morningTime);
  $("eveningTime").value = time12(s.eveningTime);
  loadAllMuezzins(s.adhanVoice);
  const next = result.nextPrayer;
  $("prayer-status").textContent = next
    ? `الصلاة القادمة: ${next.name} — ${next.time}`
    : "حدّد موقعك لتظهر مواقيت الصلاة";
  $("location-status").textContent = s.location
    ? `الموقع: ${s.location.city || "تم تحديد الموقع تلقائيًا"}`
    : "جارٍ محاولة تحديد موقعك تلقائيًا…";
  if (!s.location) setTimeout(detectLocation, 250);
}
$("save").addEventListener("click", async () => {
  const settings = {};
  ids.forEach((id) => {
    const el = $(id);
    settings[id] =
      el.type === "checkbox"
        ? el.checked
        : el.type === "number"
          ? Number(el.value)
          : el.value;
  });
  const sendNow = [
    ["azkar", settings.azkarInterval],
    ["dua", settings.duaInterval],
    ["quran", settings.quranInterval],
    ["hadith", settings.hadithInterval],
  ]
    .filter(([, value]) => value >= 1)
    .map(([kind]) => kind);
  const r = await message({ type: "save", settings, sendNow });
  if (r.ok) say("تم الحفظ، وستظهر الرسالة في صفحة المتصفح.");
  else say(r.error);
  load();
});
let locating = false;
function detectLocation() {
  if (locating || !navigator.geolocation) {
    if (!navigator.geolocation) say("متصفحك لا يدعم تحديد الموقع.");
    return;
  }
  locating = true;
  $("location-status").textContent = "جارٍ تحديد الموقع تلقائيًا…";
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const r = await message({
        type: "location",
        location: {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        },
      });
      locating = false;
      say(r.ok ? "تم تحديد موقعك تلقائيًا وتحديث المواقيت." : r.error);
      setTimeout(load, 1000);
    },
    () => {
      locating = false;
      $("location-status").textContent =
        "اسمح بإذن الموقع ليتم الحساب تلقائيًا.";
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
  );
}
$("location").addEventListener("click", detectLocation);
$("language").addEventListener("click", async () => {
  applyLanguage(language === "ar" ? "en" : "ar");
  await api.storage.sync.set({ language });
});
$("previewAdhan").addEventListener("click", async () => {
  const r = await message({
    type: "preview-adhan",
    voice: $("adhanVoice").value,
  });
  say(r.ok ? "تعمل معاينة الأذان الآن." : r.error);
});
document.querySelectorAll("[data-test]").forEach((button) =>
  button.addEventListener("click", async () => {
    const r = await message({ type: "test", kind: button.dataset.test });
    if (r.ok) say("تم إرسال الرسالة إلى صفحة المتصفح.");
    else say(r.error);
  }),
);
load().catch(() => say("تعذر تحميل الإعدادات."));
