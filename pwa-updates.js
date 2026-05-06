(function initPwaUpdates() {
  if (window.location.protocol === "file:" || !("serviceWorker" in navigator)) return;

  const updateCheckIntervalMs = 5 * 60 * 1000;
  const signatureStorageKey = "dividendInstalledDeploymentSignature";
  const dismissedSignatureStorageKey = "dividendDismissedDeploymentSignature";
  const signatureAssets = [
    "index.html",
    "signin.html",
    "signup.html",
    "styles.css",
    "app.js",
    "signup.js",
    "pwa-updates.js",
    "sw.js"
  ];
  let registration = null;
  let banner = null;
  let messageNode = null;
  let actionButton = null;
  let dismissButton = null;
  let isRefreshing = false;
  let deployedSignature = "";
  let pendingSignature = "";

  function isInstalledAppView() {
    return window.matchMedia("(display-mode: standalone)").matches
      || window.matchMedia("(display-mode: fullscreen)").matches
      || window.matchMedia("(display-mode: minimal-ui)").matches
      || window.navigator.standalone === true
      || document.referrer.startsWith("android-app://");
  }

  function ensureBanner() {
    if (banner) return banner;
    banner = document.createElement("aside");
    banner.className = "pwa-update-banner";
    banner.hidden = true;
    banner.innerHTML = `
      <div class="pwa-update-copy">
        <strong>New version available</strong>
        <span id="pwaUpdateMessage">Refresh to load the latest changes on this device.</span>
      </div>
      <div class="pwa-update-actions">
        <button id="pwaUpdateAction" type="button" class="primary-button small">Refresh now</button>
        <button id="pwaUpdateDismiss" type="button" class="ghost-button small">Later</button>
      </div>
    `;
    document.body.appendChild(banner);
    messageNode = banner.querySelector("#pwaUpdateMessage");
    actionButton = banner.querySelector("#pwaUpdateAction");
    dismissButton = banner.querySelector("#pwaUpdateDismiss");
    actionButton?.addEventListener("click", applyUpdate);
    dismissButton?.addEventListener("click", dismissBanner);
    return banner;
  }

  function showBanner(message = "Refresh to load the latest changes on this device.", signature = "") {
    if (!isInstalledAppView()) return;
    pendingSignature = signature || pendingSignature;
    ensureBanner();
    if (messageNode) messageNode.textContent = message;
    banner.hidden = false;
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  function dismissBanner() {
    if (pendingSignature) {
      localStorage.setItem(dismissedSignatureStorageKey, pendingSignature);
    }
    hideBanner();
  }

  async function hashText(text) {
    if (window.crypto?.subtle) {
      const bytes = new TextEncoder().encode(text);
      const digest = await window.crypto.subtle.digest("SHA-256", bytes);
      return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    }
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
    }
    return String(hash);
  }

  async function assetSignature(path, index) {
    const separator = path.includes("?") ? "&" : "?";
    const response = await fetch(`${path}${separator}pwa-check=${Date.now()}-${index}`, {
      cache: "no-store",
      credentials: "same-origin"
    });
    const text = await response.text();
    const hash = await hashText(text);
    return `${path}:${text.length}:${hash}`;
  }

  async function fetchDeploymentSignature() {
    const parts = await Promise.all(signatureAssets.map(assetSignature));
    return hashText(parts.join("|"));
  }

  async function applyUpdate() {
    try {
      if (pendingSignature) {
        localStorage.setItem(signatureStorageKey, pendingSignature);
        localStorage.removeItem(dismissedSignatureStorageKey);
      }
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        showBanner("Updating now...");
        return;
      }
      if (registration) {
        await registration.update().catch(() => null);
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
          showBanner("Updating now...");
          return;
        }
      }
    } catch {}
    window.location.reload();
  }

  function wireInstallingWorker(worker) {
    if (!worker) return;
    worker.addEventListener("statechange", () => {
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        void checkForDeploymentUpdate();
      }
    });
  }

  async function checkForDeploymentUpdate() {
    if (document.hidden || !isInstalledAppView()) return;
    try {
      const nextSignature = await fetchDeploymentSignature();
      const storedSignature = localStorage.getItem(signatureStorageKey) || deployedSignature;
      const dismissedSignature = localStorage.getItem(dismissedSignatureStorageKey) || "";
      if (!storedSignature) {
        deployedSignature = nextSignature;
        localStorage.setItem(signatureStorageKey, nextSignature);
        return;
      }
      deployedSignature = storedSignature;
      if (nextSignature && nextSignature !== storedSignature && nextSignature !== dismissedSignature) {
        pendingSignature = nextSignature;
        await registration?.update().catch(() => null);
        showBanner("A new version is ready. Refresh to update the installed app.", nextSignature);
      }
    } catch {}
  }

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (isRefreshing) return;
    isRefreshing = true;
    window.location.reload();
  });

  window.addEventListener("load", async () => {
    try {
      if (!isInstalledAppView()) return;
      registration = await navigator.serviceWorker.register("sw.js");
      if (registration.installing) {
        wireInstallingWorker(registration.installing);
      }
      registration.addEventListener("updatefound", () => {
        wireInstallingWorker(registration.installing);
      });
      deployedSignature = localStorage.getItem(signatureStorageKey) || "";
      await checkForDeploymentUpdate();
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) void checkForDeploymentUpdate();
      });
      window.setInterval(() => {
        void checkForDeploymentUpdate();
      }, updateCheckIntervalMs);
    } catch {}
  });
})();
