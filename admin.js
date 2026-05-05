const adminSummary = document.querySelector("#adminSummary");
const adminUsersTable = document.querySelector("#adminUsersTable");
const adminUserCount = document.querySelector("#adminUserCount");
const adminEmptyState = document.querySelector("#adminEmptyState");
const exportUsersCsv = document.querySelector("#exportUsersCsv");
const adminGate = document.querySelector("#adminGate");
const adminDashboard = document.querySelector("#adminDashboard");
const adminGateForm = document.querySelector("#adminGateForm");
const adminPin = document.querySelector("#adminPin");
const adminGateMessage = document.querySelector("#adminGateMessage");
const adminSignOut = document.querySelector("#adminSignOut");
const adminCreateUserForm = document.querySelector("#adminCreateUserForm");
const adminCreateUsername = document.querySelector("#adminCreateUsername");
const adminCreateEmail = document.querySelector("#adminCreateEmail");
const adminCreatePassword = document.querySelector("#adminCreatePassword");
const adminCreateConfirmPassword = document.querySelector("#adminCreateConfirmPassword");
const adminCreateUserMessage = document.querySelector("#adminCreateUserMessage");
const adminMessageForm = document.querySelector("#adminMessageForm");
const adminMessageBody = document.querySelector("#adminMessageBody");
const adminSelectAllUsers = document.querySelector("#adminSelectAllUsers");
const adminMessageRecipients = document.querySelector("#adminMessageRecipients");
const adminMessageStatus = document.querySelector("#adminMessageStatus");
const usersStorageKey = "dividendRegisteredUsers";
const freeTrialDays = 7;
const usesHostedSharedAccounts = window.location.protocol !== "file:";
let hostedUsersCache = [];
let hostedUsersLoaded = false;
const planOptions = {
  trial: { label: "Free week", days: 7 },
  month: { label: "1 month", days: 30 },
  sixMonths: { label: "6 months", days: 183 },
  year: { label: "1 year", days: 365 },
  lifetime: { label: "Lifetime", days: Infinity },
  custom: { label: "Custom days", days: 30 }
};

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

async function hashPassword(password) {
  if (!crypto.subtle) {
    return btoa(unescape(encodeURIComponent(password))).split("").reverse().join("");
  }
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function showAdminDashboard() {
  if (adminGate) adminGate.hidden = true;
  if (adminDashboard) adminDashboard.hidden = false;
  void renderUsers(true);
}

function lockAdminDashboard() {
  if (adminDashboard) adminDashboard.hidden = true;
  if (adminGate) adminGate.hidden = false;
  if (adminPin) adminPin.value = "";
  adminPin?.focus();
}

async function postJson(url, payload = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    credentials: "same-origin",
    body: JSON.stringify(payload)
  });
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  return { response, data };
}

function adminApiFailureMessage(response, data, fallback) {
  if (response?.status === 404) {
    return "Secure admin API is not deployed yet. Upload the admin API files and redeploy Vercel.";
  }
  if (response?.status === 500) {
    return data?.message || "Secure admin login is not configured on this deployment.";
  }
  if (response?.status === 401) {
    return data?.message || "The admin passkey is incorrect.";
  }
  return data?.message || fallback;
}

async function checkAdminSession() {
  try {
    const response = await fetch("/api/admin?action=session", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin"
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data?.ok) {
      if (adminGateMessage) adminGateMessage.textContent = "";
      showAdminDashboard();
      return true;
    }
    if (adminGateMessage && response.status !== 200) {
      adminGateMessage.textContent = adminApiFailureMessage(
        response,
        data,
        "Secure admin session check failed."
      );
    } else if (adminGateMessage) {
      adminGateMessage.textContent = "";
    }
  } catch {
    if (adminGateMessage) {
      adminGateMessage.textContent = "Could not reach the secure admin session service.";
    }
  }
  lockAdminDashboard();
  return false;
}

async function loginAdminWithPin() {
  const pin = adminPin?.value || "";
  if (adminGateMessage) adminGateMessage.textContent = "Checking secure admin access...";
  try {
    const { response, data } = await postJson("/api/admin?action=login", { pin });
    if (!response.ok || !data?.ok) {
      if (adminGateMessage) {
        adminGateMessage.textContent = adminApiFailureMessage(
          response,
          data,
          "The admin passkey could not be checked."
        );
      }
      adminPin?.focus();
      return;
    }
    if (adminGateMessage) adminGateMessage.textContent = "";
    showAdminDashboard();
  } catch {
    if (adminGateMessage) adminGateMessage.textContent = "Could not reach the secure admin login service.";
    adminPin?.focus();
  }
}

async function logoutAdmin() {
  try {
    await fetch("/api/admin?action=logout", {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin"
    });
  } catch {}
  lockAdminDashboard();
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

async function getJson(url) {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin"
  });
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  return { response, data };
}

async function loadUsers(force = false) {
  if (!usesHostedSharedAccounts) return uniqueUsers();
  if (hostedUsersLoaded && !force) return hostedUsersCache;
  const { response, data } = await getJson("/api/admin?action=users");
  if (!response.ok || !Array.isArray(data?.users)) {
    throw new Error(adminApiFailureMessage(response, data, "Could not load shared users."));
  }
  hostedUsersCache = data.users.map(ensureAccessFields);
  hostedUsersLoaded = true;
  return hostedUsersCache;
}

function selectedAdminCountries() {
  return [...document.querySelectorAll('input[name="adminCreateCountry"]:checked')].map((input) => input.value);
}

function isRealisticEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  const blockedDomains = new Set([
    "example.com",
    "example.org",
    "example.net",
    "test.com",
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com"
  ]);
  if (email.length > 254 || /\s/.test(email)) return false;
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(email)) return false;
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain || localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) return false;
  if (blockedDomains.has(domain)) return false;
  const labels = domain.split(".");
  if (labels.some((label) => !label || label.startsWith("-") || label.endsWith("-"))) return false;
  const tld = labels.at(-1);
  return /^[a-z]{2,24}$/i.test(tld);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/London"
  }).format(date);
}

function uniqueUsers() {
  if (usesHostedSharedAccounts) {
    return hostedUsersCache.map((user) => ensureAccessFields(user));
  }
  const storedUsers = readJson(usersStorageKey, []);
  const currentUser = readJson("dividendProfileUser", null);
  const byKey = new Map();
  [...(Array.isArray(storedUsers) ? storedUsers : []), currentUser]
    .filter(Boolean)
    .forEach((user) => {
      const key = normalize(user.email) || normalize(user.username) || `user-${byKey.size}`;
      byKey.set(key, { ...byKey.get(key), ...user });
    });
  const users = [...byKey.values()].map(ensureAccessFields);
  persistUsers(users);
  return users;
}

function messageEligibleUsers(users = uniqueUsers()) {
  return users.filter((user) => isRealisticEmail(user.email));
}

function userMarkets(user) {
  return Array.isArray(user.visibleMarkets) && user.visibleMarkets.length
    ? user.visibleMarkets
    : Array.isArray(user.countries)
      ? user.countries
      : [];
}

function countObjectItems(value) {
  return value && typeof value === "object" ? Object.keys(value).length : 0;
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 86400000);
}

function ensureAccessFields(user) {
  const createdAt = user.createdAt || new Date().toISOString();
  const hasAccessDate = Boolean(user.paidUntil || user.accessUntil);
  const next = {
    ...user,
    createdAt,
    planType: user.planType || "Free trial",
    accessDaysGranted: Number(user.accessDaysGranted || freeTrialDays),
    accessStartedAt: user.accessStartedAt || createdAt,
    paymentConfirmed: Boolean(user.paymentConfirmed)
  };
  next.paidUntil = hasAccessDate
    ? user.paidUntil || user.accessUntil
    : addDays(new Date(createdAt), freeTrialDays).toISOString();
  return next;
}

function daysLeftForUser(user) {
  if (user.planType === "Lifetime") return Infinity;
  const until = new Date(user.paidUntil || user.accessUntil || "");
  if (!Number.isFinite(until.getTime())) return 0;
  return Math.max(0, Math.ceil((until - new Date()) / 86400000));
}

function accessLabel(user) {
  const days = daysLeftForUser(user);
  if (days === Infinity) return "Lifetime";
  if (days <= 0) return "Expired";
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function accessStatus(user) {
  if (user.isLocked) return "Locked";
  return daysLeftForUser(user) > 0 ? "Active" : "Expired";
}

function persistUsers(users) {
  localStorage.setItem(usersStorageKey, JSON.stringify(users));
  const currentUser = readJson("dividendProfileUser", null);
  if (currentUser?.email) {
    const updatedCurrent = users.find((user) => normalize(user.email) === normalize(currentUser.email));
    if (updatedCurrent) {
      localStorage.setItem("dividendProfileUser", JSON.stringify(updatedCurrent));
    }
  }
}

async function createUserFromAdmin() {
  const username = adminCreateUsername.value.trim();
  const email = adminCreateEmail.value.trim();
  const countries = selectedAdminCountries();
  const users = usesHostedSharedAccounts ? await loadUsers() : uniqueUsers();

  if (!countries.length) {
    adminCreateUserMessage.textContent = "Choose at least one country for this user.";
    return;
  }
  if (adminCreatePassword.value !== adminCreateConfirmPassword.value) {
    adminCreateUserMessage.textContent = "Both passwords must match.";
    adminCreateConfirmPassword.focus();
    return;
  }
  if (!isRealisticEmail(email)) {
    adminCreateUserMessage.textContent = "Enter a real email address with a valid domain.";
    adminCreateEmail.focus();
    return;
  }
  if (users.some((user) => normalize(user.username) === normalize(username))) {
    adminCreateUserMessage.textContent = "This username is already registered.";
    adminCreateUsername.focus();
    return;
  }
  if (users.some((user) => normalize(user.email) === normalize(email))) {
    adminCreateUserMessage.textContent = "This email address is already registered.";
    adminCreateEmail.focus();
    return;
  }

  if (usesHostedSharedAccounts) {
    const { response, data } = await postJson("/api/admin?action=user-action", {
      type: "createUser",
      username,
      email,
      passwordHash: await hashPassword(adminCreatePassword.value),
      countries
    });
    if (!response.ok || !data?.ok) {
      adminCreateUserMessage.textContent = adminApiFailureMessage(
        response,
        data,
        "Could not create this shared user."
      );
      return;
    }
    hostedUsersLoaded = false;
  } else {
    const now = new Date();
    const user = {
      username,
      email,
      passwordHash: await hashPassword(adminCreatePassword.value),
      countries,
      visibleMarkets: countries,
      createdAt: now.toISOString(),
      createdByAdminAt: now.toISOString(),
      planType: "Free trial",
      accessDaysGranted: freeTrialDays,
      accessStartedAt: now.toISOString(),
      paidUntil: addDays(now, freeTrialDays).toISOString(),
      paymentConfirmed: false,
      signInCount: 0
    };
    persistUsers([...users, user]);
  }
  adminCreateUserForm.reset();
  adminCreateUserMessage.textContent = "User created successfully.";
  await renderUsers(true);
}

function planSelect(user) {
  const daysLeft = daysLeftForUser(user);
  const customValue = daysLeft === Infinity ? 999999 : Math.max(0, daysLeft || 0);
  const currentPlanKey = Object.entries(planOptions).find(([, plan]) => plan.label === user.planType)?.[0]
    || (user.planType === "Lifetime" ? "lifetime" : "trial");
  return `
    <select class="admin-plan-select" data-email="${escapeHtml(user.email || "")}" aria-label="Choose access plan">
      ${Object.entries(planOptions).map(([key, plan]) => `<option value="${key}" ${key === currentPlanKey ? "selected" : ""}>${escapeHtml(plan.label)}</option>`).join("")}
    </select>
    <input class="admin-custom-days" type="number" min="0" step="1" value="${escapeHtml(customValue)}" aria-label="Access days">
  `;
}

function renderSummary(users) {
  const expiredUsers = users.filter((user) => !user.isLocked && daysLeftForUser(user) <= 0).length;
  adminSummary.innerHTML = [
    ["Registered users", users.length],
    ["Active users", users.filter((user) => !user.isLocked && daysLeftForUser(user) > 0).length],
    ["Expired users", expiredUsers],
    ["Locked users", users.filter((user) => user.isLocked).length],
    ["Lifetime users", users.filter((user) => user.planType === "Lifetime").length]
  ].map(([label, value]) => `
    <div class="metric admin-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join("");
}

function renderMessageRecipients(users = uniqueUsers()) {
  if (!adminMessageRecipients) return;
  const recipients = messageEligibleUsers(users);
  if (!recipients.length) {
    adminMessageRecipients.innerHTML = '<p class="empty-state">No users with valid email addresses are available yet.</p>';
    return;
  }
  adminMessageRecipients.innerHTML = recipients.map((user) => `
    <label class="admin-message-recipient">
      <input type="checkbox" name="adminMessageRecipient" value="${escapeHtml(user.email || "")}">
      <span><strong>${escapeHtml(user.username || "Investor")}</strong><small>${escapeHtml(user.email || "")}</small></span>
    </label>
  `).join("");
  updateMessageRecipientState();
}

function updateMessageRecipientState() {
  const disableRecipients = Boolean(adminSelectAllUsers?.checked);
  adminMessageRecipients?.querySelectorAll('input[name="adminMessageRecipient"]').forEach((input) => {
    input.disabled = disableRecipients;
  });
}

function selectedMessageEmails() {
  const recipients = messageEligibleUsers();
  if (adminSelectAllUsers?.checked) {
    return recipients.map((user) => user.email);
  }
  return [...document.querySelectorAll('input[name="adminMessageRecipient"]:checked')]
    .map((input) => input.value)
    .filter((email) => isRealisticEmail(email));
}

function openMailClientForUsers() {
  const message = adminMessageBody?.value.trim() || "";
  const emails = [...new Set(selectedMessageEmails())];
  if (!message) {
    if (adminMessageStatus) adminMessageStatus.textContent = "Type a message first.";
    adminMessageBody?.focus();
    return;
  }
  if (!emails.length) {
    if (adminMessageStatus) adminMessageStatus.textContent = "Select at least one user or tick send to all users.";
    return;
  }
  const subject = "Message from Dividend Stock Tracker admin";
  const recipientList = emails.join(",");
  const mailto = `mailto:${recipientList}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  if (adminMessageStatus) {
    adminMessageStatus.textContent = `Opening your email app for ${emails.length} recipient${emails.length === 1 ? "" : "s"}.`;
  }
  window.location.href = mailto;
}

async function renderUsers(force = false) {
  let users = [];
  try {
    users = usesHostedSharedAccounts ? await loadUsers(force) : uniqueUsers();
  } catch (error) {
    if (adminGateMessage) adminGateMessage.textContent = error.message || "Could not load admin users.";
    adminEmptyState.hidden = false;
    adminUsersTable.innerHTML = "";
    return;
  }
  adminUserCount.textContent = `${users.length} ${users.length === 1 ? "user" : "users"}`;
  adminEmptyState.hidden = users.length > 0;
  renderSummary(users);
  renderMessageRecipients(users);
  adminUsersTable.innerHTML = users.map((user) => `
    <tr>
      <td><strong>${escapeHtml(user.username || "Investor")}</strong></td>
      <td>${escapeHtml(user.email || "Not available")}</td>
      <td>${escapeHtml(user.planType || "Free trial")}</td>
      <td><strong>${escapeHtml(user.isLocked ? "Locked" : accessLabel(user))}</strong></td>
      <td>${escapeHtml(formatDate(user.createdAt))}</td>
      <td>${escapeHtml(formatDate(user.lastSignedInAt))}</td>
      <td>${escapeHtml(user.signInCount || 0)}</td>
      <td>${escapeHtml(formatDate(user.lastSeenAt))}</td>
      <td>
        <div class="grant-access admin-action-stack">
          ${planSelect(user)}
          <button class="mini-action grant-access-btn" type="button" data-email="${escapeHtml(user.email || "")}">Give user</button>
          <button class="mini-action danger lock-user-btn" type="button" data-email="${escapeHtml(user.email || "")}" data-locked="${user.isLocked ? "true" : "false"}">${user.isLocked ? "Unlock" : "Lock"}</button>
          <input class="admin-password-input" type="password" minlength="6" placeholder="New password" aria-label="New password for ${escapeHtml(user.username || user.email || "user")}">
          <button class="mini-action set-password-btn" type="button" data-email="${escapeHtml(user.email || "")}">Set password</button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function grantAccess(email, planKey, customDays = 30) {
  const plan = planOptions[planKey] || planOptions.month;
  const parsedDays = Number(customDays);
  const adjustedDayCount = Number.isFinite(parsedDays) ? Math.max(0, parsedDays) : Math.max(0, Number(plan.days || 30));
  if (usesHostedSharedAccounts) {
    const { response, data } = await postJson("/api/admin?action=user-action", {
      type: "grantAccess",
      email,
      planKey,
      customDays: adjustedDayCount
    });
    if (!response.ok || !data?.ok) {
      window.alert(adminApiFailureMessage(response, data, "Could not update this user's access."));
      return;
    }
    hostedUsersLoaded = false;
  } else {
    const grantedDays = planKey === "lifetime"
      ? Infinity
      : adjustedDayCount;
    const users = uniqueUsers().map((user) => {
      if (normalize(user.email) !== normalize(email)) return user;
      const now = new Date();
      const planLabel = planKey === "lifetime"
        ? "Lifetime"
        : plan.label;
      return {
        ...user,
        isLocked: false,
        lockedAt: "",
        lockedByAdminAt: "",
        lockReason: "",
        planType: planLabel,
        accessDaysGranted: grantedDays === Infinity ? 999999 : grantedDays,
        accessStartedAt: now.toISOString(),
        paidUntil: grantedDays === Infinity ? "9999-12-31T23:59:59.000Z" : addDays(now, grantedDays).toISOString(),
        paymentConfirmed: planKey !== "trial",
        paymentConfirmedAt: now.toISOString()
      };
    });
    persistUsers(users);
  }
  await renderUsers(true);
}

async function setUserLocked(email, shouldLock) {
  if (usesHostedSharedAccounts) {
    const { response, data } = await postJson("/api/admin?action=user-action", {
      type: "setLockState",
      email,
      shouldLock
    });
    if (!response.ok || !data?.ok) {
      window.alert(adminApiFailureMessage(response, data, "Could not update this user's lock state."));
      return;
    }
    hostedUsersLoaded = false;
  } else {
    const now = new Date().toISOString();
    const users = uniqueUsers().map((user) => {
      if (normalize(user.email) !== normalize(email)) return user;
      return {
        ...user,
        isLocked: shouldLock,
        lockedAt: shouldLock ? now : "",
        lockedByAdminAt: shouldLock ? now : "",
        unlockedAt: shouldLock ? "" : now,
        lockReason: shouldLock ? "Account unavailable" : ""
      };
    });
    persistUsers(users);

    const currentUser = readJson("dividendProfileUser", null);
    if (shouldLock && normalize(currentUser?.email) === normalize(email)) {
      localStorage.setItem("dividendAccessMessage", "This account is unavailable. Contact support for help.");
      localStorage.removeItem("dividendProfileUser");
    }
  }

  await renderUsers(true);
}

async function setUserPassword(email, password) {
  if (!password || password.length < 6) {
    window.alert("Enter a new password with at least 6 characters.");
    return;
  }
  const passwordHash = await hashPassword(password);
  if (usesHostedSharedAccounts) {
    const { response, data } = await postJson("/api/admin?action=user-action", {
      type: "setPassword",
      email,
      passwordHash
    });
    if (!response.ok || !data?.ok) {
      window.alert(adminApiFailureMessage(response, data, "Could not change this user's password."));
      return;
    }
    hostedUsersLoaded = false;
  } else {
    const now = new Date().toISOString();
    const users = uniqueUsers().map((user) => {
      if (normalize(user.email) !== normalize(email)) return user;
      return {
        ...user,
        passwordHash,
        passwordChangedByAdminAt: now,
        lastPasswordResetAt: now
      };
    });
    persistUsers(users);
  }
  window.alert("Password updated for this user.");
  await renderUsers(true);
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadUsersCsv() {
  const users = uniqueUsers();
  const rows = [
    ["Username", "Email", "Plan", "Access status", "Days left", "Registered", "Last sign in", "Sign-ins", "Last seen"]
  ];
  users.forEach((user) => {
    rows.push([
      user.username || "Investor",
      user.email || "",
      user.planType || "Free trial",
      accessStatus(user),
      accessLabel(user),
      formatDate(user.createdAt),
      formatDate(user.lastSignedInAt),
      user.signInCount || 0,
      formatDate(user.lastSeenAt)
    ]);
  });
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "dividend-registered-users.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

exportUsersCsv?.addEventListener("click", downloadUsersCsv);
adminGateForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await loginAdminWithPin();
});
adminSignOut?.addEventListener("click", logoutAdmin);
adminCreateUserForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await createUserFromAdmin();
});
adminMessageForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  openMailClientForUsers();
});
adminMessageBody?.addEventListener("input", () => {
  if (adminMessageStatus) adminMessageStatus.textContent = "";
});
adminSelectAllUsers?.addEventListener("change", () => {
  if (adminMessageStatus) adminMessageStatus.textContent = "";
  updateMessageRecipientState();
});
adminMessageRecipients?.addEventListener("change", () => {
  if (adminMessageStatus) adminMessageStatus.textContent = "";
});

adminUsersTable?.addEventListener("click", async (event) => {
    const grantButton = event.target.closest(".grant-access-btn");
    if (grantButton) {
      const email = grantButton.dataset.email || "";
      const select = grantButton.closest(".grant-access")?.querySelector(".admin-plan-select");
      const customDays = grantButton.closest(".grant-access")?.querySelector(".admin-custom-days")?.value || 30;
      await grantAccess(email, select?.value || "month", customDays);
      return;
    }

  const passwordButton = event.target.closest(".set-password-btn");
  if (passwordButton) {
    const email = passwordButton.dataset.email || "";
    const passwordInput = passwordButton.closest(".grant-access")?.querySelector(".admin-password-input");
    await setUserPassword(email, passwordInput?.value || "");
    return;
  }

    const lockButton = event.target.closest(".lock-user-btn");
    if (!lockButton) return;
    const email = lockButton.dataset.email || "";
    const shouldLock = lockButton.dataset.locked !== "true";
    await setUserLocked(email, shouldLock);
});
adminUsersTable?.addEventListener("change", (event) => {
  const select = event.target.closest(".admin-plan-select");
  if (!select) return;
  const plan = planOptions[select.value] || planOptions.month;
  const customDaysInput = select.closest(".grant-access")?.querySelector(".admin-custom-days");
  if (!customDaysInput) return;
  customDaysInput.value = plan.days === Infinity ? 999999 : plan.days;
});
checkAdminSession();
