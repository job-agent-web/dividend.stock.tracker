(function initPwaUpdates() {
  if (window.location.protocol === "file:" || !("serviceWorker" in navigator)) return;

  const updateCheckIntervalMs = 5 * 60 * 1000;
  let registration = null;
  let banner = null;
  let messageNode = null;
  let actionButton = null;
  let dismissButton = null;
  let isRefreshing = false;
  let deployedSignature = "";

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
    dismissButton?.addEventListener("click", hideBanner);
    return banner;
  }

  function showBanner(message = "Refresh to load the latest changes on this device.") {
    ensureBanner();
    if (messageNode) messageNode.textContent = message;
    banner.hidden = false;
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  function currentSignature(response) {
    return [
      response.headers.get("x-vercel-id"),
      response.headers.get("etag"),
      response.headers.get("last-modified")
    ].filter(Boolean).join("|");
  }

  async function fetchDeploymentSignature() {
    const target = window.location.pathname || "/";
    const response = await fetch(target, {
      method: "HEAD",
      cache: "no-store",
      credentials: "same-origin"
    });
    return currentSignature(response);
  }

  async function applyUpdate() {
    try {
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
        showBanner();
      }
    });
  }

  async function checkForDeploymentUpdate() {
    if (document.hidden) return;
    try {
      await registration?.update().catch(() => null);
      if (registration?.waiting) {
        showBanner();
        return;
      }
      const nextSignature = await fetchDeploymentSignature();
      if (!deployedSignature) {
        deployedSignature = nextSignature;
        return;
      }
      if (nextSignature && deployedSignature && nextSignature !== deployedSignature) {
        showBanner();
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
      registration = await navigator.serviceWorker.register("sw.js");
      if (registration.waiting) {
        showBanner();
      }
      if (registration.installing) {
        wireInstallingWorker(registration.installing);
      }
      registration.addEventListener("updatefound", () => {
        wireInstallingWorker(registration.installing);
      });
      deployedSignature = await fetchDeploymentSignature().catch(() => "");
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) void checkForDeploymentUpdate();
      });
      window.setInterval(() => {
        void checkForDeploymentUpdate();
      }, updateCheckIntervalMs);
    } catch {}
  });
})();
