const authCallbackMessage = document.querySelector("#authCallbackMessage");
const authCallbackFallback = document.querySelector("#authCallbackFallback");

function callbackParams() {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(String(window.location.hash || "").replace(/^#/, ""));
  return { params, hashParams };
}

function setCallbackMessage(message, isError = false) {
  if (!authCallbackMessage) return;
  authCallbackMessage.textContent = message;
  authCallbackMessage.classList.toggle("error", Boolean(isError));
  if (authCallbackFallback) authCallbackFallback.hidden = !isError;
}

async function completeMagicLinkSignin() {
  const { params, hashParams } = callbackParams();
  const error = hashParams.get("error_description") || params.get("error_description") || hashParams.get("error") || params.get("error");
  if (error) {
    setCallbackMessage(error, true);
    return;
  }

  const accessToken = hashParams.get("access_token") || params.get("access_token");
  const refreshToken = hashParams.get("refresh_token") || params.get("refresh_token") || "";
  if (!accessToken) {
    setCallbackMessage("This verification link did not include a valid access token. Please request a new link.", true);
    return;
  }

  try {
    const response = await fetch("/api/auth-verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        mode: "magiclink",
        accessToken,
        refreshToken
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.ok || !data?.user || !data?.sessionToken) {
      const message = data?.message || "Your email was verified, but the tracker could not be opened.";
      localStorage.setItem("dividendAccessMessage", message);
      setCallbackMessage(message, Boolean(!data?.expired));
      setTimeout(() => {
        window.location.href = "signin.html";
      }, 1400);
      return;
    }

    const user = { ...data.user, sessionToken: data.sessionToken };
    localStorage.setItem("dividendProfileUser", JSON.stringify(user));
    localStorage.setItem("dividendAccessMessage", data.message || "Email verified. Opening your tracker...");
    setCallbackMessage(data.message || "Email verified. Opening your tracker...");
    window.history.replaceState({}, document.title, "auth-callback.html");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  } catch {
    setCallbackMessage("Could not complete verification right now. Please try again.", true);
  }
}

completeMagicLinkSignin();
