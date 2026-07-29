// محتوى إسلامي من Islamic-Api: https://github.com/itsSamBz/Islamic-Api
const api = globalThis.browser ?? globalThis.chrome;
const RAW = "https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main";
const DATA_URLS = {
  azkar: `${RAW}/adkar.json`,
  hadith: `${RAW}/hadith/bukhari.json`,
  quran: `${RAW}/Quran-json/hafs.json`,
};
const ADHAN_VOICES = {
  default:
    "https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/Athan/azan.mp3",
  azan2: "https://www.islamcan.com/audio/adhan/azan2.mp3",
  azan3: "https://www.islamcan.com/audio/adhan/azan3.mp3",
  ahmedAlNufais:
    "https://raw.githubusercontent.com/DBChoco/Salawat/main/src/main/resources/io/github/dbchoco/Salawat/audio/Adhan%20-%20Ahmed%20Al-Nufais.mp3",
  makkah:
    "https://raw.githubusercontent.com/DBChoco/Salawat/main/src/main/resources/io/github/dbchoco/Salawat/audio/Adhan%20-%20Mecca.mp3",
  alAqsa:
    "https://raw.githubusercontent.com/DBChoco/Salawat/main/src/main/resources/io/github/dbchoco/Salawat/audio/Adhan%20-%20al-Aqsa.mp3",
};
const defaults = {
  enabled: true,
  azkarInterval: 30,
  duaInterval: 0,
  quranInterval: 0,
  hadithInterval: 0,
  morningTime: "07:00 AM",
  eveningTime: "06:00 PM",
  morningEveningEnabled: true,
  prayerEnabled: true,
  adhanSound: true,
  adhanVoice: "default",
  customAdhanUrl: "",
  calculationMethod: 5,
  location: null,
  quranPosition: 0,
  azkarPosition: 0,
  hadithPosition: 0,
};

const periodic = [
  ["azkar", "azkarInterval"],
  ["dua", "duaInterval"],
  ["quran", "quranInterval"],
  ["hadith", "hadithInterval"],
];

async function settings() {
  return { ...defaults, ...(await api.storage.sync.get(defaults)) };
}
async function fetchData(kind) {
  const key = `cache-${kind}`;
  // صحيح البخاري والقرآن الكاملان يتجاوزان مساحة التخزين في بعض المتصفحات
  // عند تمثيل JSON داخليًا؛ الاحتفاظ بهما في الذاكرة أثناء الإشعار فقط.
  if (kind === "hadith" || kind === "quran") {
    await api.storage.local.remove(key);
    const response = await fetch(DATA_URLS[kind]);
    if (!response.ok) throw new Error(`Could not load ${kind}`);
    return response.json();
  }
  const stored = await api.storage.local.get(key);
  if (stored[key]) return stored[key];
  const response = await fetch(DATA_URLS[kind]);
  if (!response.ok) throw new Error(`Could not load ${kind}`);
  const data = await response.json();
  await api.storage.local.set({ [key]: data });
  return data;
}
async function notify(title, message) {
  const id = `islamic-${Date.now()}-${Math.random()}`;
  // رسالة هادئة داخل صفحة المتصفح بدل إشعار نظام مزعج.
  await api.storage.local.set({
    activeToast: { id, title, message, at: Date.now() },
    lastDelivery: { title, message, at: Date.now() },
  });
  // حقن مباشر في التبويب النشط، ولا ننتظر إعادة تحميل الصفحة.
  if (!api.scripting || !api.tabs)
    throw new Error("متصفحك لا يسمح بعرض الرسالة داخل الصفحة.");
  const [tab] = await api.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab || !/^https?:/i.test(tab.url || ""))
    throw new Error(
      "افتح أي موقع عادي أولًا؛ لا يمكن العرض داخل صفحات chrome:// أو صفحة الإضافة.",
    );
  await api.scripting.executeScript({
    target: { tabId: tab.id },
    func: paintBrowserToast,
    args: [{ id, title, message }],
  });
  return id;
}

// تعمل داخل صفحة الموقع نفسها، وبالتالي لا تعتمد على تحميل ملفات الإضافة مسبقًا.
function paintBrowserToast(toast) {
  document.getElementById("muslim-companion-toast")?.remove();
  const host = document.createElement("div");
  host.id = "muslim-companion-toast";
  host.style.cssText =
    "all:initial;position:fixed;z-index:2147483647;left:24px;bottom:24px;direction:rtl;font-family:Tahoma,Arial,sans-serif;";
  const shadow = host.attachShadow({ mode: "closed" });
  shadow.innerHTML = `<style>*{box-sizing:border-box}.toast{width:330px;max-width:calc(100vw - 36px);background:#fffefa;border:1px solid #c9dfcc;border-right:4px solid #2f8059;border-radius:14px;box-shadow:0 13px 38px #123c2c3b;color:#244937;overflow:hidden;animation:in .28s ease-out}.top{align-items:center;background:#f0f7ef;display:flex;gap:9px;padding:10px 12px}.moon{align-items:center;background:#28734f;border-radius:9px;color:#fff8db;display:flex;font:22px Georgia;height:30px;justify-content:center;width:30px}.title{flex:1;font-size:13px;font-weight:bold}.close{background:transparent;border:0;border-radius:7px;color:#597666;cursor:pointer;font-size:21px;height:28px;line-height:23px;width:28px}.close:hover{background:#dcebdd}.body{font-size:13px;line-height:1.9;max-height:65vh;overflow-y:auto;padding:12px 14px;white-space:pre-line}.hint{border-top:1px solid #edf1eb;color:#819287;font-size:10px;padding:7px 14px}@keyframes in{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}</style><aside class="toast" role="status"><div class="top"><span class="moon">☾</span><span class="title"></span><button class="close" aria-label="إغلاق">×</button></div><div class="body"></div><div class="hint">رفيق المسلم</div></aside>`;
  shadow.querySelector(".title").textContent = toast.title;
  shadow.querySelector(".body").textContent = toast.message;
  shadow.querySelector(".close").onclick = () => host.remove();
  document.documentElement.append(host);
}

async function sendAzkar(category = null) {
  const all = await fetchData("azkar");
  const chosen = category
    ? all.filter((item) => item.category === category)
    : all;
  const store = await api.storage.sync.get({ azkarPosition: 0 });
  const index = store.azkarPosition % chosen.length;
  const item = chosen[index];
  await api.storage.sync.set({ azkarPosition: index + 1 });
  const title = category || "ذكر";
  const message = `${item.text}${item.count > 1 ? `\nالتكرار: ${item.count}` : ""}`;
  await notify(title, message);
  return { title, message };
}
async function sendDua() {
  const all = await fetchData("azkar");
  const duas = all.filter((item) => /دعاء|النوم|الاستيقاظ/.test(item.category));
  const item = (duas.length ? duas : all)[
    Math.floor(Math.random() * (duas.length || all.length))
  ];
  const title = "دعاء";
  const message = item.text;
  await notify(title, message);
  return { title, message };
}
async function sendQuran() {
  const quran = await fetchData("quran");
  const store = await api.storage.sync.get({ quranPosition: 0 });
  const position = store.quranPosition % quran.length;
  const ayah = quran[position];
  await api.storage.sync.set({ quranPosition: position + 1 });
  const title = `القرآن الكريم — ${ayah.sura_name_ar} (${ayah.aya_no})`;
  const message = ayah.aya_text;
  await notify(title, message);
  return { title, message };
}
async function sendHadith() {
  const source = await fetchData("hadith");
  const hadiths = source.hadiths || source;
  const store = await api.storage.sync.get({ hadithPosition: 0 });
  const position = store.hadithPosition % hadiths.length;
  const hadith = hadiths[position];
  await api.storage.sync.set({ hadithPosition: position + 1 });
  const title = `حديث شريف — صحيح البخاري (${hadith.hadith_number || position + 1})`;
  const message = hadith.text;
  await notify(title, message);
  return { title, message };
}

async function schedulePeriodic() {
  const s = await settings();
  for (const [name, field] of periodic) {
    await api.alarms.clear(`periodic-${name}`);
    const minutes = Number(s[field]);
    if (s.enabled && minutes >= 1)
      api.alarms.create(`periodic-${name}`, {
        delayInMinutes: minutes,
        periodInMinutes: minutes,
      });
  }
}
function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
function parseTime(time) {
  const match = String(time).match(/(\d{1,2}):(\d{2})\s*(AM|PM|ص|م)?/i);
  if (!match) return [7, 0];
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const suffix = match[3]?.toUpperCase();
  if (suffix === "PM" || suffix === "م") hour = hour === 12 ? 12 : hour + 12;
  else if (suffix === "AM" || suffix === "ص") hour = hour === 12 ? 0 : hour;
  return [hour, minute];
}
function formatTime12(time) {
  const [hour, minute] = parseTime(time);
  const suffix = hour >= 12 ? "م" : "ص";
  return `${((hour + 11) % 12) + 1}:${String(minute).padStart(2, "0")} ${suffix}`;
}
function atTime(time, tomorrow = false) {
  const [hour, minute] = parseTime(time);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  if (tomorrow || date <= new Date()) date.setDate(date.getDate() + 1);
  return date;
}
async function scheduleDailyAzkar() {
  const s = await settings();
  for (const [name, time] of [
    ["morning", s.morningTime],
    ["evening", s.eveningTime],
  ]) {
    await api.alarms.clear(`daily-${name}`);
    if (s.enabled && s.morningEveningEnabled)
      api.alarms.create(`daily-${name}`, { when: atTime(time).getTime() });
  }
}
async function getPrayerTimes(force = false) {
  const s = await settings();
  if (!s.location) return null;
  const cache = await api.storage.local.get({ prayerTimes: null });
  if (!force && cache.prayerTimes?.date === dateKey()) return cache.prayerTimes;
  const { latitude, longitude } = s.location;
  const url = `https://api.aladhan.com/v1/timings/${dateKey()}?latitude=${latitude}&longitude=${longitude}&method=${s.calculationMethod}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const response = await fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(timeout),
  );
  if (!response.ok) throw new Error("Prayer times unavailable");
  const data = await response.json();
  const timings = data.data.timings;
  const result = {
    date: dateKey(),
    city: s.location.city || "موقعك الحالي",
    timings,
  };
  await api.storage.local.set({ prayerTimes: result });
  return result;
}
function prayerDate(time) {
  const [h, m] = time.match(/\d+/g).map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}
async function schedulePrayers() {
  const s = await settings();
  await api.alarms.clearAll();
  await schedulePeriodic();
  await scheduleDailyAzkar();
  if (!s.enabled || !s.prayerEnabled || !s.location) return;
  const prayers = await getPrayerTimes(true);
  for (const name of ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]) {
    const when = prayerDate(prayers.timings[name]);
    if (when > new Date())
      api.alarms.create(`prayer-${name}`, { when: when.getTime() });
  }
  // يتحقق كل ليلة من مواقيت اليوم التالي.
  api.alarms.create("refresh-prayers", { when: atTime("00:05").getTime() });
}
async function playAdhan(voice = "default", customUrl = "") {
  if (!api.offscreen)
    throw new Error("تشغيل المعاينة الصوتية غير مدعوم في هذا المتصفح.");
  const audioUrl =
    voice === "marwanQassas"
      ? api.runtime.getURL("adhan-muhammad-marwan-qassas.mp3")
      : voice.startsWith("af_")
        ? `https://alfurqan.online/api/v1/athan/${voice.slice(3)}`
        : voice === "custom" &&
            /^https:\/\/.+\.mp3(?:[?#].*)?$/i.test(customUrl)
          ? customUrl
          : ADHAN_VOICES[voice] || ADHAN_VOICES.default;
  const hasDocument = await api.offscreen.hasDocument();
  if (!hasDocument)
    await api.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play the adhan at prayer time",
    });
  await api.runtime.sendMessage({ type: "play-adhan", audioUrl });
}
async function nextPrayer() {
  const prayer = await getPrayerTimes();
  if (!prayer) return null;
  const list = [
    ["الفجر", "Fajr"],
    ["الظهر", "Dhuhr"],
    ["العصر", "Asr"],
    ["المغرب", "Maghrib"],
    ["العشاء", "Isha"],
  ];
  const now = new Date();
  const next = list.find(([, key]) => prayerDate(prayer.timings[key]) > now);
  return next
    ? { name: next[0], time: formatTime12(prayer.timings[next[1]]) }
    : { name: "الفجر", time: "غدًا" };
}

api.alarms.onAlarm.addListener(async ({ name }) => {
  try {
    if (name === "periodic-azkar") await sendAzkar();
    else if (name === "periodic-dua") await sendDua();
    else if (name === "periodic-quran") await sendQuran();
    else if (name === "periodic-hadith") await sendHadith();
    else if (name === "daily-morning") {
      await sendAzkar("أذكار الصباح");
      await scheduleDailyAzkar();
    } else if (name === "daily-evening") {
      await sendAzkar("أذكار المساء");
      await scheduleDailyAzkar();
    } else if (name === "refresh-prayers") await schedulePrayers();
    else if (name.startsWith("prayer-")) {
      const s = await settings();
      // الصوت مستقل عن رسالة الصفحة؛ يعمل حتى لو كان التبويب صفحة متصفح محمية.
      if (s.adhanSound) await playAdhan(s.adhanVoice, s.customAdhanUrl);
      await notify("حان الآن وقت الصلاة", "حي على الصلاة، حي على الفلاح").catch(
        () => {},
      );
    }
  } catch (_) {
    /* إعادة المحاولة في المهمة التالية؛ لا نعرض خطأ للمستخدم دون طلبه */
  }
});
api.runtime.onInstalled.addListener(async () => {
  await api.storage.local.remove(["cache-hadith", "cache-quran"]);
  const old = await api.storage.sync.get();
  if (!Object.keys(old).length) await api.storage.sync.set(defaults);
  await schedulePrayers();
});
api.runtime.onStartup.addListener(schedulePrayers);
api.runtime.onMessage.addListener((message, _sender, respond) => {
  (async () => {
    if (message.type === "save") {
      await api.storage.sync.set(message.settings);
      await schedulePrayers();
      const delivered = [];
      for (const kind of message.sendNow || [])
        delivered.push(
          await {
            azkar: sendAzkar,
            dua: sendDua,
            quran: sendQuran,
            hadith: sendHadith,
          }[kind](),
        );
      respond({ ok: true, delivered });
    } else if (message.type === "location") {
      await api.storage.sync.set({ location: message.location });
      schedulePrayers().catch(() => {}); // لا نعلّق واجهة المستخدم بسبب الشبكة
      respond({ ok: true });
    } else if (message.type === "dashboard") {
      const s = await settings();
      const local = await api.storage.local.get({ lastDelivery: null });
      respond({
        settings: s,
        nextPrayer: await nextPrayer(),
        prayerTimes: await getPrayerTimes(),
        lastDelivery: local.lastDelivery,
      });
    } else if (message.type === "preview-adhan") {
      await playAdhan(message.voice, message.customUrl);
      respond({ ok: true });
    } else if (message.type === "test") {
      const delivered = await (
        {
          azkar: sendAzkar,
          dua: sendDua,
          quran: sendQuran,
          hadith: sendHadith,
        }[message.kind] || sendAzkar
      )();
      respond({ ok: true, delivered: [delivered] });
    }
  })().catch((error) => respond({ ok: false, error: error.message }));
  return true;
});
