(() => {
  if (globalThis.__muslimCompanionToastInjected) return;
  globalThis.__muslimCompanionToastInjected = true;
  const api = globalThis.browser ?? globalThis.chrome;
  let host;
  let currentToastId = null;

  function removeToast() {
    host?.remove();
    host = null;
    currentToastId = null;
  }

  async function render(toast) {
    if (!toast?.id) return;
    const { dismissedToastId } = await api.storage.local.get({
      dismissedToastId: null,
    });
    if (dismissedToastId === toast.id) return;
    removeToast();
    currentToastId = toast.id;
    host = document.createElement("div");
    host.id = "muslim-companion-toast";
    host.style.cssText =
      "all:initial;position:fixed;z-index:2147483647;left:24px;bottom:24px;direction:rtl;font-family:Tahoma,Arial,sans-serif;";
    const shadow = host.attachShadow({ mode: "closed" });
    shadow.innerHTML = `<style>
      *{box-sizing:border-box}.toast{width:330px;max-width:calc(100vw - 36px);background:#fffefa;border:1px solid #c9dfcc;border-right:4px solid #2f8059;border-radius:14px;box-shadow:0 13px 38px #123c2c3b;color:#244937;overflow:hidden;animation:in .28s ease-out}.top{align-items:center;background:#f0f7ef;display:flex;gap:9px;padding:10px 12px}.moon{align-items:center;background:#28734f;border-radius:9px;color:#fff8db;display:flex;font:22px Georgia;height:30px;justify-content:center;width:30px}.title{flex:1;font-size:13px;font-weight:bold}.close{background:transparent;border:0;border-radius:7px;color:#597666;cursor:pointer;font-size:21px;height:28px;line-height:23px;width:28px}.close:hover{background:#dcebdd}.body{font-size:13px;line-height:1.9;max-height:65vh;overflow-y:auto;padding:12px 14px;white-space:pre-line}.hint{border-top:1px solid #edf1eb;color:#819287;font-size:10px;padding:7px 14px}@keyframes in{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}
    </style><aside class="toast" role="status" aria-live="polite"><div class="top"><span class="moon">☾</span><span class="title"></span><button class="close" aria-label="إغلاق">×</button></div><div class="body"></div><div class="hint">رفيق المسلم</div></aside>`;
    shadow.querySelector(".title").textContent = toast.title;
    shadow.querySelector(".body").textContent = toast.message;
    shadow
      .querySelector(".close")
      .addEventListener("click", () =>
        api.storage.local.set({ dismissedToastId: toast.id }),
      );
    document.documentElement.append(host);
  }

  api.storage.local
    .get({ activeToast: null })
    .then(({ activeToast }) => render(activeToast));
  api.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.activeToast) render(changes.activeToast.newValue);
    if (
      changes.dismissedToastId &&
      changes.dismissedToastId.newValue === currentToastId
    )
      removeToast();
  });
})();
