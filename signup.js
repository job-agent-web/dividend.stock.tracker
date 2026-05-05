const signupForm = document.querySelector("#signupForm");
const signinForm = document.querySelector("#signinForm");
const signupUsername = document.querySelector("#signupUsername");
const signupEmail = document.querySelector("#signupEmail");
const signupPassword = document.querySelector("#signupPassword");
const signupConfirmPassword = document.querySelector("#signupConfirmPassword");
const signupMessage = document.querySelector("#signupMessage");
const signupOtpForm = document.querySelector("#signupOtpForm");
const signupOtpCode = document.querySelector("#signupOtpCode");
const signupOtpHelp = document.querySelector("#signupOtpHelp");
const signupOtpMessage = document.querySelector("#signupOtpMessage");
const signupResendOtp = document.querySelector("#signupResendOtp");
const signinIdentity = document.querySelector("#signinIdentity");
const signinPassword = document.querySelector("#signinPassword");
const rememberSigninDetails = document.querySelector("#rememberSigninDetails");
const signinMessage = document.querySelector("#signinMessage");
const signinOtpForm = document.querySelector("#signinOtpForm");
const signinOtpCode = document.querySelector("#signinOtpCode");
const signinOtpHelp = document.querySelector("#signinOtpHelp");
const signinOtpMessage = document.querySelector("#signinOtpMessage");
const signinResendOtp = document.querySelector("#signinResendOtp");
const signinOpenPayment = document.querySelector("#signinOpenPayment");
const signinContactAdmin = document.querySelector("#signinContactAdmin");
const forgotPasswordToggle = document.querySelector("#forgotPasswordToggle");
const forgotPasswordForm = document.querySelector("#forgotPasswordForm");
const forgotPasswordCancel = document.querySelector("#forgotPasswordCancel");
const forgotEmail = document.querySelector("#forgotEmail");
const forgotNewPassword = document.querySelector("#forgotNewPassword");
const forgotConfirmPassword = document.querySelector("#forgotConfirmPassword");
const forgotPasswordMessage = document.querySelector("#forgotPasswordMessage");
const signinPaymentModal = document.querySelector("#signinPaymentModal");
const signinPaymentTitle = document.querySelector("#signinPaymentTitle");
const signinPaymentText = document.querySelector("#signinPaymentText");
const signinPaymentClose = document.querySelector("#signinPaymentClose");
const signinPaymentStatus = document.querySelector("#signinPaymentStatus");
const signinMonthlyPaymentCard = document.querySelector("#signinMonthlyPaymentCard");
const signinSixMonthPaymentCard = document.querySelector("#signinSixMonthPaymentCard");
const signinYearlyPaymentCard = document.querySelector("#signinYearlyPaymentCard");
const signinLifetimePaymentCard = document.querySelector("#signinLifetimePaymentCard");
const authPanel = document.querySelector("#authPanel");
const appInstallLinks = [...document.querySelectorAll("[data-install-platform]")];
const appInstallStatus = document.querySelector("[data-install-status]");
const usersStorageKey = "dividendRegisteredUsers";
const rememberedSigninKey = "dividendRememberedSignin";
const freeTrialDays = 7;
const adminContactEmail = "dividendstocktracker@gmail.com";
const otpMinutesValid = 10;
const usesHostedSharedAccounts = window.location.protocol !== "file:";
let paymentModalUser = null;
let pendingSignupEmail = "";
let pendingSigninUser = null;
let pendingSigninPassword = "";
let pendingSignupUser = null;
let deferredInstallPrompt = null;

function setAppInstallStatus(message) {
  if (appInstallStatus) appInstallStatus.textContent = message;
}

function registerAppServiceWorker() {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") return;
  navigator.serviceWorker.register("sw.js").catch(() => {
    setAppInstallStatus("Install is still available from your browser menu on the hosted site.");
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  setAppInstallStatus("Install is ready on this device. Choose Android or install from your browser menu.");
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  setAppInstallStatus("Dividend Stock Tracker has been installed on this device.");
});

async function handleAppInstall(event) {
  const link = event.currentTarget;
  const platform = link.dataset.installPlatform;
  if (platform === "pc") {
    event.preventDefault();
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      setAppInstallStatus("If the icon was not added, open your browser menu and choose Install app or Pin this site.");
      return;
    }
    setAppInstallStatus("On PC, open this page in Edge or Chrome, then use the browser menu to choose Install app, Apps > Install this site, or Pin this page to your taskbar.");
    return;
  }
  event.preventDefault();
  if (platform === "ios") {
    setAppInstallStatus("On iPhone or iPad, open this page in Safari, tap Share, then choose Add to Home Screen.");
    return;
  }
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    setAppInstallStatus("If the install did not finish, open Chrome menu and choose Install app or Add to Home screen.");
    return;
  }
  setAppInstallStatus("On Android, open this page in Chrome, tap the menu, then choose Install app or Add to Home screen.");
}

function selectedSignupCountries() {
  return [...document.querySelectorAll('input[name="profileCountry"]:checked')].map((input) => input.value);
}

async function hashPassword(password) {
  if (!crypto.subtle) {
    return btoa(unescape(encodeURIComponent(password))).split("").reverse().join("");
  }
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function looksLikeSha256(value) {
  return /^[a-f0-9]{64}$/i.test(String(value || ""));
}

function mainPageUrl() {
  return "index.html";
}

function signinPageUrl() {
  return "signin.html";
}

function showAccessMessage() {
  const message = localStorage.getItem("dividendAccessMessage");
  if (!message) return;
  const messageTarget = signinMessage || signupMessage;
  if (messageTarget) {
    messageTarget.textContent = message;
    messageTarget.classList.toggle("error", message.includes("expired"));
  }
  if (signinOpenPayment) signinOpenPayment.hidden = !message.includes("expired");
  localStorage.removeItem("dividendAccessMessage");
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function normalizeUserValue(value) {
  return String(value || "").trim().toLowerCase();
}

function registeredUsers() {
  const users = readJson(usersStorageKey, []);
  const currentUser = readJson("dividendProfileUser", null);
  const merged = Array.isArray(users) ? [...users] : [];
  if (currentUser?.email || currentUser?.username) {
    const currentEmail = normalizeUserValue(currentUser.email);
    const currentUsername = normalizeUserValue(currentUser.username);
    const alreadySaved = merged.some((user) =>
      normalizeUserValue(user.email) === currentEmail || normalizeUserValue(user.username) === currentUsername
    );
    if (!alreadySaved) merged.push(currentUser);
  }
  return merged;
}

function writeUsers(users) {
  localStorage.setItem(usersStorageKey, JSON.stringify(users));
}

async function postHostedJson(url, payload = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function loadRememberedSigninDetails() {
  if (!signinForm || !signinIdentity || !signinPassword || !rememberSigninDetails) return;
  const saved = readJson(rememberedSigninKey, null);
  if (!saved?.identity || !saved?.password) return;
  signinIdentity.value = saved.identity;
  signinPassword.value = saved.password;
  rememberSigninDetails.checked = true;
}

function saveRememberedSigninDetails(identity, password) {
  if (!rememberSigninDetails?.checked) {
    localStorage.removeItem(rememberedSigninKey);
    return;
  }
  localStorage.setItem(rememberedSigninKey, JSON.stringify({ identity, password }));
}

function generateOtpCode() {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return String(100000 + (values[0] % 900000));
  }
  return String(Math.floor(100000 + Math.random() * 900000));
}

function otpIsExpired(user) {
  const expiresAt = new Date(user?.otpExpiresAt || "");
  return !Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date();
}

function maskEmail(email) {
  const [name, domain] = String(email || "").split("@");
  if (!name || !domain) return email || "your email";
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(2, name.length - 2))}@${domain}`;
}

function setOtpHelp(target, user, code) {
  if (!target || !user) return;
  target.textContent = code
    ? `Enter the 6-digit OTP sent to ${maskEmail(user.email)}. Local test OTP: ${code}`
    : `Enter the 6-digit OTP sent to ${maskEmail(user.email)}.`;
}

async function requestHostedOtp(user) {
  if (window.location.protocol === "file:") return null;
  try {
    const response = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, username: user.username })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.ok || !data.otpHash || !data.otpExpiresAt) {
      return {
        ok: false,
        message: data?.reason || data?.message || "OTP could not be sent from the hosted site."
      };
    }
    return {
      ok: true,
      otpHash: data.otpHash,
      otpIssuedAt: data.otpIssuedAt || new Date().toISOString(),
      otpExpiresAt: data.otpExpiresAt,
      emailed: true
    };
  } catch {
    return {
      ok: false,
      message: "Could not reach the hosted OTP service right now."
    };
  }
}

async function issueOtpForUser(user) {
  const isLocalFile = window.location.protocol === "file:";
  const hostedOtp = await requestHostedOtp(user);
  if (!isLocalFile && !hostedOtp?.ok) {
    return {
      ok: false,
      user,
      code: "",
      message: hostedOtp?.message || "OTP could not be sent. Please contact admin or try again later."
    };
  }
  const code = hostedOtp?.ok ? "" : generateOtpCode();
  const updatedUser = {
    ...user,
    otpVerified: false,
    otpHash: hostedOtp?.otpHash || await hashPassword(code),
    otpIssuedAt: hostedOtp?.otpIssuedAt || new Date().toISOString(),
    otpExpiresAt: hostedOtp?.otpExpiresAt || new Date(Date.now() + otpMinutesValid * 60000).toISOString(),
    otpDelivery: hostedOtp?.emailed ? "email" : "local-test"
  };
  replaceRegisteredUser(updatedUser);
  return { ok: true, user: updatedUser, code };
}

async function verifyUserOtp(user, code) {
  if (!user) return { ok: false, message: "Create or find your account before entering an OTP." };
  if (otpIsExpired(user)) return { ok: false, message: "This OTP has expired. Please resend a new OTP." };
  const codeHash = await hashPassword(String(code || "").trim());
  const serverHash = looksLikeSha256(user.otpHash) ? user.otpHash.toLowerCase() : "";
  const expectedHash = serverHash || user.otpHash;
  if (!String(code || "").trim() || (serverHash ? codeHash !== expectedHash : codeHash !== user.otpHash)) {
    return { ok: false, message: "The OTP is incorrect. Please check the code and try again." };
  }
  const verifiedUser = {
    ...user,
    otpVerified: true,
    otpHash: "",
    otpVerifiedAt: new Date().toISOString()
  };
  replaceRegisteredUser(verifiedUser);
  return { ok: true, user: verifiedUser };
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
  if (!user) return 0;
  if (user.planType === "Lifetime") return Infinity;
  const until = new Date(user.paidUntil || user.accessUntil || "");
  if (!Number.isFinite(until.getTime())) return 0;
  return Math.max(0, Math.ceil((until - new Date()) / 86400000));
}

function accessLabel(user) {
  const days = daysLeftForUser(user);
  if (days === Infinity) return "Lifetime access";
  if (days <= 0) return "Expired";
  return `${days} ${days === 1 ? "day" : "days"} left`;
}

function showSigninPaymentModal(user) {
  paymentModalUser = user;
  if (signinOpenPayment) signinOpenPayment.hidden = false;
  if (signinPaymentTitle) signinPaymentTitle.textContent = "Choose a plan";
  if (signinPaymentText) signinPaymentText.textContent = "Choose the plan you want to use.";
  if (signinPaymentModal) {
    signinPaymentModal.hidden = false;
  }
  if (signinPaymentStatus) {
    signinPaymentStatus.className = "auth-status neutral";
    signinPaymentStatus.textContent = "Choose a monthly, 6-month, yearly, or lifetime plan.";
  }
  signinPaymentModal?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeSigninPaymentModal() {
  authPanel?.classList.remove("app-locked");
}

function contactAdminForPayment() {
  const user = paymentModalUser || findRegisteredUser(signinIdentity?.value || "");
  const subject = "Dividend Stock Tracker payment confirmation";
  const body = [
    "Hello Admin,",
    "",
    "I need access to my Dividend Stock Tracker account.",
    `Name: ${user?.username || "Investor"}`,
    `Email: ${user?.email || signinIdentity?.value || ""}`,
    `Current status: ${user ? accessLabel(user) : "Expired"}`,
    "",
    "Please confirm my payment and add access days to my account."
  ].join("\n");
  const url = `mailto:${adminContactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (signinPaymentStatus) signinPaymentStatus.textContent = "";
  window.location.href = url;
}

function paymentUserDetails() {
  const user = paymentModalUser || findRegisteredUser(signinIdentity?.value || "");
  const name = user?.username || "PLEASE replace this text with your email and username";
  const email = user?.email || signinIdentity?.value || "";
  return [name, email].filter(Boolean).join(" - ");
}

function buildRevolutUrl(amountPence, planName) {
  const note = paymentUserDetails() || "PLEASE replace this text with your email and username";
  return `https://revolut.me/valourex?currency=GBP&amount=${amountPence}&note=${encodeURIComponent(note)}`;
}

function openPaymentPlan(amountPence, planName) {
  if (signinPaymentStatus) {
    signinPaymentStatus.className = "auth-status neutral";
    signinPaymentStatus.textContent = "";
  }
  try {
    window.open(buildRevolutUrl(amountPence, planName), "_blank", "noopener,noreferrer");
  } catch (error) {
    window.location.href = buildRevolutUrl(amountPence, planName);
  }
}

function bindPaymentCard(card, amountPence, planName) {
  if (!card) return;
  const openPlan = () => openPaymentPlan(amountPence, planName);
  card.addEventListener("click", openPlan);
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openPlan();
  });
}

function contactAdminFromSignin() {
  const identity = signinIdentity?.value.trim() || "";
  const user = identity ? findRegisteredUser(identity) : null;
  const subject = "Dividend Stock Tracker account support";
  const body = [
    "Hello Admin,",
    "",
    "I need help with my Dividend Stock Tracker account.",
    `Username or email entered: ${identity || "Not provided"}`,
    `Registered name: ${user?.username || "Not confirmed"}`,
    `Registered email: ${user?.email || "Not confirmed"}`,
    `Current status: ${user ? accessLabel(ensureAccessFields(user)) : "Unknown"}`,
    "",
    "Please help me resolve my account access."
  ].join("\n");
  const url = `mailto:${adminContactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (signinMessage) signinMessage.textContent = "";
  window.location.assign(url);
}

function persistUpdatedUser(updatedUser) {
  const users = registeredUsers();
  const email = normalizeUserValue(updatedUser.email);
  const username = normalizeUserValue(updatedUser.username);
  const withoutUser = users.filter((user) =>
    normalizeUserValue(user.email) !== email && normalizeUserValue(user.username) !== username
  );
  writeUsers([...withoutUser, updatedUser]);
  localStorage.setItem("dividendProfileUser", JSON.stringify(updatedUser));
}

function findRegisteredUser(identity) {
  const key = normalizeUserValue(identity);
  return registeredUsers().find((user) =>
    normalizeUserValue(user.email) === key || normalizeUserValue(user.username) === key
  ) || null;
}

function verifiedOrLegacyUser(user) {
  return user?.otpVerified !== false;
}

function showSigninOtpGate(user, code = "") {
  pendingSigninUser = user;
  if (signinOtpForm) signinOtpForm.hidden = false;
  if (forgotPasswordForm) forgotPasswordForm.hidden = true;
  if (signinOtpMessage) {
    signinOtpMessage.classList.remove("error");
    signinOtpMessage.textContent = code
      ? "A new OTP has been generated. Enter it below to finish sign in."
      : "Verify your email before signing in.";
  }
  if (code) setOtpHelp(signinOtpHelp, user, code);
  signinOtpCode.value = "";
  signinOtpCode?.focus();
}

function showSignupOtpGate(user, code) {
  pendingSignupEmail = user.email;
  pendingSignupUser = user;
  if (signupOtpForm) signupOtpForm.hidden = false;
  if (signupMessage) signupMessage.textContent = "Sign up created. Verify your email with the OTP before signing in.";
  if (signupOtpMessage) {
    signupOtpMessage.classList.remove("error");
    signupOtpMessage.textContent = "Enter the OTP to activate your account.";
  }
  setOtpHelp(signupOtpHelp, user, code);
  signupOtpCode.value = "";
  signupOtpCode?.focus();
  signupOtpForm?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function showSignupMagicLinkNotice(user, message) {
  pendingSignupEmail = user.email;
  pendingSignupUser = user;
  if (signupOtpForm) signupOtpForm.hidden = true;
  if (signupMessage) {
    signupMessage.classList.remove("error");
    signupMessage.textContent = message || "Check your email and click the verification link to activate your account.";
  }
}

function showSigninMagicLinkNotice(user, message) {
  pendingSigninUser = user;
  if (signinOtpForm) signinOtpForm.hidden = true;
  if (signinMessage) {
    signinMessage.classList.remove("error");
    signinMessage.textContent = message || "Check your email and click the verification link to open your tracker.";
  }
}

function replaceRegisteredUser(updatedUser) {
  const users = registeredUsers();
  const email = normalizeUserValue(updatedUser.email);
  const username = normalizeUserValue(updatedUser.username);
  const nextUsers = users.filter((user) =>
    normalizeUserValue(user.email) !== email && normalizeUserValue(user.username) !== username
  );
  writeUsers([...nextUsers, updatedUser]);
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

function completeSignin(accessUser, identity, password) {
  const signedInUser = {
    ...accessUser,
    lastSignedInAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    signInCount: Number(accessUser.signInCount || 0) + 1
  };
  saveRememberedSigninDetails(identity, password);
  persistUpdatedUser(signedInUser);
  signinMessage.textContent = "Signed in. Opening your tracker...";
  window.location.href = mainPageUrl();
}

signupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const countries = selectedSignupCountries();
  const email = signupEmail.value.trim();
  const username = signupUsername.value.trim();
  signupMessage.classList.remove("error");
  const users = registeredUsers();
  if (!countries.length) {
    signupMessage.textContent = "Choose at least one country for your stock profile.";
    return;
  }
  if (signupPassword.value !== signupConfirmPassword.value) {
    signupMessage.textContent = "Both passwords must match before you can create a profile.";
    signupConfirmPassword.focus();
    return;
  }
  const lockedUser = users.find((user) =>
    user.isLocked && (
      normalizeUserValue(user.username) === normalizeUserValue(username) ||
      normalizeUserValue(user.email) === normalizeUserValue(email)
    )
  );
  if (lockedUser) {
    signupMessage.textContent = "This account is unavailable. Contact support for help.";
    return;
  }
  if (users.some((user) => normalizeUserValue(user.username) === normalizeUserValue(username))) {
    signupMessage.textContent = "This username is already registered. Choose a different username.";
    signupUsername.focus();
    return;
  }
  if (users.some((user) => normalizeUserValue(user.email) === normalizeUserValue(email))) {
    signupMessage.textContent = "This email address is already registered. Use a different email.";
    signupEmail.focus();
    return;
  }
  if (!isRealisticEmail(email)) {
    signupMessage.textContent = "Enter a real email address with a valid domain, for example name@gmail.com.";
    signupEmail.focus();
    return;
  }

  if (usesHostedSharedAccounts) {
    const passwordHash = await hashPassword(signupPassword.value);
    const { response, data } = await postHostedJson("/api/auth-signup", {
      username,
      email,
      passwordHash,
      countries
    });
    if (!response.ok || !data?.ok || !data?.user) {
      signupMessage.classList.add("error");
      signupMessage.textContent = data?.message || "Could not create your account right now.";
      if (data?.duplicateField === "username") signupUsername.focus();
      if (data?.duplicateField === "email") signupEmail.focus();
      return;
    }
    pendingSignupEmail = data.user.email;
    pendingSignupUser = data.user;
    if (data.magicLink) {
      showSignupMagicLinkNotice(data.user, data.message);
      return;
    }
    showSignupOtpGate(data.user, "");
    return;
  }

  const user = {
    username,
    email,
    passwordHash: await hashPassword(signupPassword.value),
    countries,
    createdAt: new Date().toISOString(),
    planType: "Free trial",
    accessDaysGranted: freeTrialDays,
    accessStartedAt: new Date().toISOString(),
    paidUntil: new Date(Date.now() + freeTrialDays * 86400000).toISOString(),
    paymentConfirmed: false,
    otpVerified: false
  };

  localStorage.removeItem("dividendProfileUser");
  const otp = await issueOtpForUser(user);
  if (!otp.ok) {
    signupMessage.classList.add("error");
    signupMessage.textContent = otp.message;
    pendingSignupUser = user;
    return;
  }
  writeUsers([...users, otp.user]);
  showSignupOtpGate(otp.user, otp.code);
});

signinForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const identity = signinIdentity.value.trim();
  const password = signinPassword.value;
  const passwordHash = await hashPassword(password);
  signinMessage.classList.remove("error");

  if (usesHostedSharedAccounts) {
    const { response, data } = await postHostedJson("/api/auth-signin", {
      identity,
      passwordHash
    });
    if (!response.ok || !data?.ok) {
      signinMessage.textContent = data?.message || "Could not sign in right now.";
      signinMessage.classList.add("error");
      if (data?.expired && data?.user) {
        if (signinOpenPayment) signinOpenPayment.hidden = false;
        showSigninPaymentModal(data.user);
      } else if (signinOpenPayment) {
        signinOpenPayment.hidden = true;
      }
      signinPassword.focus();
      return;
    }
    if (data.requiresOtp && data.user) {
      pendingSigninPassword = password;
      pendingSigninUser = { ...data.user, signInChallenge: data.challenge || "" };
      showSigninOtpGate(pendingSigninUser, "");
      signinMessage.textContent = data.message || "Your email is not verified. A new OTP has been generated.";
      return;
    }
    if (data.magicLink && data.user) {
      pendingSigninPassword = password;
      pendingSigninUser = data.user;
      showSigninMagicLinkNotice(data.user, data.message);
      return;
    }
    if (data.user && data.sessionToken) {
      completeSignin({ ...data.user, sessionToken: data.sessionToken }, identity, password);
      return;
    }
    signinMessage.textContent = data?.message || "Could not sign in right now.";
    signinMessage.classList.add("error");
    return;
  }

  const user = findRegisteredUser(identity);

  if (!user || user.passwordHash !== passwordHash) {
    signinMessage.textContent = "The username, email, or password is incorrect.";
    if (signinOpenPayment) signinOpenPayment.hidden = true;
    signinPassword.focus();
    return;
  }

  const accessUser = ensureAccessFields(user);
  if (accessUser.isLocked) {
    signinMessage.textContent = "This account is unavailable. Contact support for help.";
    if (signinOpenPayment) signinOpenPayment.hidden = true;
    return;
  }

  if (!verifiedOrLegacyUser(accessUser)) {
    pendingSigninPassword = password;
    const otp = await issueOtpForUser(accessUser);
    if (!otp.ok) {
      signinMessage.classList.add("error");
      signinMessage.textContent = otp.message;
      return;
    }
    showSigninOtpGate(otp.user, otp.code);
    signinMessage.textContent = "Your email is not verified. A new OTP has been generated.";
    return;
  }

  if (daysLeftForUser(accessUser) <= 0) {
    signinMessage.textContent = "Your access has expired. Please choose a plan below to regain access.";
    signinMessage.classList.add("error");
    if (signinOpenPayment) signinOpenPayment.hidden = false;
    showSigninPaymentModal(accessUser);
    return;
  }

  completeSignin(accessUser, identity, password);
});

signupOtpForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (usesHostedSharedAccounts) {
    const identity = pendingSignupEmail || signupEmail?.value || "";
    const { response, data } = await postHostedJson("/api/auth-verify-otp", {
      identity,
      code: signupOtpCode?.value || "",
      mode: "signup"
    });
    if (!response.ok || !data?.ok) {
      signupOtpMessage.classList.add("error");
      signupOtpMessage.textContent = data?.message || "Could not verify OTP right now.";
      signupOtpCode?.focus();
      return;
    }
    signupOtpMessage.classList.remove("error");
    signupOtpMessage.textContent = data.message || "Email verified. Opening sign in...";
    localStorage.setItem("dividendAccessMessage", "Email verified. Sign in to open your tracker.");
    window.location.href = signinPageUrl();
    return;
  }
  const user = findRegisteredUser(pendingSignupEmail || signupEmail?.value || "");
  const result = await verifyUserOtp(user, signupOtpCode?.value || "");
  if (!result.ok) {
    signupOtpMessage.classList.add("error");
    signupOtpMessage.textContent = result.message;
    signupOtpCode?.focus();
    return;
  }
  signupOtpMessage.classList.remove("error");
  signupOtpMessage.textContent = "Email verified. Opening sign in...";
  localStorage.setItem("dividendAccessMessage", "Email verified. Sign in to open your tracker.");
  window.location.href = signinPageUrl();
});

signupResendOtp?.addEventListener("click", async () => {
  if (usesHostedSharedAccounts) {
    const identity = pendingSignupEmail || signupEmail?.value || "";
    const { response, data } = await postHostedJson("/api/auth-resend-otp", { identity });
    if (!response.ok || !data?.ok || !data?.user) {
      signupOtpMessage.classList.add("error");
      signupOtpMessage.textContent = data?.message || "Could not resend OTP right now.";
      return;
    }
    pendingSignupEmail = data.user.email;
    pendingSignupUser = data.user;
    setOtpHelp(signupOtpHelp, data.user, "");
    signupOtpMessage.classList.remove("error");
    signupOtpMessage.textContent = data.message || "A new OTP has been generated. Enter it before it expires.";
    signupOtpCode.value = "";
    signupOtpCode?.focus();
    return;
  }
  const user = findRegisteredUser(pendingSignupEmail || signupEmail?.value || "") || pendingSignupUser;
  if (!user) {
    signupOtpMessage.classList.add("error");
    signupOtpMessage.textContent = "Create your profile before requesting another OTP.";
    return;
  }
  const otp = await issueOtpForUser(user);
  if (!otp.ok) {
    signupOtpMessage.classList.add("error");
    signupOtpMessage.textContent = otp.message;
    return;
  }
  pendingSignupEmail = otp.user.email;
  pendingSignupUser = otp.user;
  setOtpHelp(signupOtpHelp, otp.user, otp.code);
  signupOtpMessage.classList.remove("error");
  signupOtpMessage.textContent = "A new OTP has been generated. Enter it before it expires.";
  signupOtpCode.value = "";
  signupOtpCode?.focus();
});

signinOtpForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (usesHostedSharedAccounts) {
    const identity = signinIdentity?.value.trim() || pendingSigninUser?.email || "";
    const { response, data } = await postHostedJson("/api/auth-verify-otp", {
      identity,
      code: signinOtpCode?.value || "",
      mode: "signin",
      challenge: pendingSigninUser?.signInChallenge || ""
    });
    if (!response.ok || !data?.ok) {
      signinOtpMessage.classList.add("error");
      signinOtpMessage.textContent = data?.message || "Could not verify OTP right now.";
      if (data?.expired && data?.user) {
        showSigninPaymentModal(data.user);
      }
      signinOtpCode?.focus();
      return;
    }
    signinOtpMessage.classList.remove("error");
    signinOtpMessage.textContent = data.message || "Email verified. Opening your tracker...";
    completeSignin({ ...data.user, sessionToken: data.sessionToken }, identity, pendingSigninPassword || signinPassword?.value || "");
    return;
  }
  const identity = signinIdentity?.value.trim() || pendingSigninUser?.email || "";
  const user = pendingSigninUser || findRegisteredUser(identity);
  const result = await verifyUserOtp(user, signinOtpCode?.value || "");
  if (!result.ok) {
    signinOtpMessage.classList.add("error");
    signinOtpMessage.textContent = result.message;
    signinOtpCode?.focus();
    return;
  }
  const accessUser = ensureAccessFields(result.user);
  if (daysLeftForUser(accessUser) <= 0) {
    signinOtpMessage.classList.add("error");
    signinOtpMessage.textContent = "Email verified, but your access has expired. Please choose a plan below.";
    showSigninPaymentModal(accessUser);
    return;
  }
  signinOtpMessage.classList.remove("error");
  signinOtpMessage.textContent = "Email verified. Opening your tracker...";
  completeSignin(accessUser, identity, pendingSigninPassword || signinPassword?.value || "");
});

signinResendOtp?.addEventListener("click", async () => {
  if (usesHostedSharedAccounts) {
    const identity = pendingSigninUser?.email || signinIdentity?.value || "";
    const { response, data } = await postHostedJson("/api/auth-resend-otp", { identity });
    if (!response.ok || !data?.ok || !data?.user) {
      signinOtpMessage.classList.add("error");
      signinOtpMessage.textContent = data?.message || "Could not resend OTP right now.";
      return;
    }
    pendingSigninUser = { ...pendingSigninUser, ...data.user };
    setOtpHelp(signinOtpHelp, pendingSigninUser, "");
    signinOtpMessage.classList.remove("error");
    signinOtpMessage.textContent = data.message || "A new OTP has been generated. Enter it before it expires.";
    signinOtpCode.value = "";
    signinOtpCode?.focus();
    return;
  }
  const user = pendingSigninUser || findRegisteredUser(signinIdentity?.value || "");
  if (!user) {
    signinOtpMessage.classList.add("error");
    signinOtpMessage.textContent = "Enter your username or email first, then request another OTP.";
    return;
  }
  const otp = await issueOtpForUser(user);
  if (!otp.ok) {
    signinOtpMessage.classList.add("error");
    signinOtpMessage.textContent = otp.message;
    return;
  }
  pendingSigninUser = otp.user;
  setOtpHelp(signinOtpHelp, otp.user, otp.code);
  signinOtpMessage.classList.remove("error");
  signinOtpMessage.textContent = "A new OTP has been generated. Enter it before it expires.";
  signinOtpCode.value = "";
  signinOtpCode?.focus();
});

forgotPasswordToggle?.addEventListener("click", () => {
  if (forgotPasswordForm) forgotPasswordForm.hidden = false;
  if (signinMessage) signinMessage.textContent = "";
  if (signinOpenPayment) signinOpenPayment.hidden = true;
  forgotEmail.value = signinIdentity?.value.includes("@") ? signinIdentity.value : "";
  forgotEmail?.focus();
});

forgotPasswordCancel?.addEventListener("click", () => {
  if (forgotPasswordForm) forgotPasswordForm.hidden = true;
  if (forgotPasswordMessage) forgotPasswordMessage.textContent = "";
});

forgotPasswordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = forgotEmail.value.trim();
  forgotPasswordMessage.classList.remove("error");
  if (usesHostedSharedAccounts) {
    if (!isRealisticEmail(email)) {
      forgotPasswordMessage.textContent = "Enter the real email address used for this account.";
      forgotEmail.focus();
      return;
    }
    if (forgotNewPassword.value !== forgotConfirmPassword.value) {
      forgotPasswordMessage.textContent = "Both new passwords must match.";
      forgotConfirmPassword.focus();
      return;
    }
    const passwordHash = await hashPassword(forgotNewPassword.value);
    const { response, data } = await postHostedJson("/api/auth-reset-password", {
      email,
      passwordHash
    });
    if (!response.ok || !data?.ok) {
      forgotPasswordMessage.textContent = data?.message || "Could not reset password right now.";
      return;
    }
    forgotPasswordMessage.textContent = data.message || "Password reset. You can now sign in with the new password.";
    signinIdentity.value = email;
    signinPassword.value = "";
    signinPassword.focus();
    return;
  }
  const user = findRegisteredUser(email);
  if (!isRealisticEmail(email)) {
    forgotPasswordMessage.textContent = "Enter the real email address used for this account.";
    forgotEmail.focus();
    return;
  }
  if (!user || normalizeUserValue(user.email) !== normalizeUserValue(email)) {
    forgotPasswordMessage.textContent = "No account was found with that email address.";
    forgotEmail.focus();
    return;
  }
  if (user.isLocked) {
    forgotPasswordMessage.textContent = "This account is unavailable. Contact support for help.";
    return;
  }
  if (forgotNewPassword.value !== forgotConfirmPassword.value) {
    forgotPasswordMessage.textContent = "Both new passwords must match.";
    forgotConfirmPassword.focus();
    return;
  }
  const updatedUser = {
    ...user,
    passwordHash: await hashPassword(forgotNewPassword.value),
    lastPasswordResetAt: new Date().toISOString()
  };
  replaceRegisteredUser(updatedUser);
  localStorage.removeItem("dividendProfileUser");
  forgotPasswordMessage.textContent = "Password reset. You can now sign in with the new password.";
  signinIdentity.value = updatedUser.email;
  signinPassword.value = "";
  signinPassword.focus();
});

signinOpenPayment?.addEventListener("click", () => {
  const user = findRegisteredUser(signinIdentity?.value || "");
  showSigninPaymentModal(user ? ensureAccessFields(user) : null);
});
signinContactAdmin?.addEventListener("click", contactAdminFromSignin);
rememberSigninDetails?.addEventListener("change", () => {
  if (!rememberSigninDetails.checked) localStorage.removeItem(rememberedSigninKey);
});
bindPaymentCard(signinMonthlyPaymentCard, 1000, "monthly");
bindPaymentCard(signinSixMonthPaymentCard, 5000, "6-month");
bindPaymentCard(signinYearlyPaymentCard, 10000, "yearly");
bindPaymentCard(signinLifetimePaymentCard, 20000, "lifetime");
signinPaymentClose?.addEventListener("click", closeSigninPaymentModal);
appInstallLinks.forEach((link) => {
  link.addEventListener("click", handleAppInstall);
});

registerAppServiceWorker();
showAccessMessage();
loadRememberedSigninDetails();
