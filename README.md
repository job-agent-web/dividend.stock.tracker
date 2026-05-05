# Dividend Stock Tracker

A standalone browser app for tracking dividend-paying stocks in Nigeria, the US, and UK ISA accounts.

Open `index.html` in a browser to use it.

## What It Includes

- Expanded dividend-paying stock universe grouped by market and category
- Online-imported dividend universe screened down to the best 1,500 dividend stock rows
- Buy score beside each stock name, based on dividend growth streak, payout-ratio health, investment safety/size, and yield quality
- Buy, hold, and sell signals with reasons
- Qualification dates, record days, and payment days
- Canvas price history graphs with cursor hover values and price-change percentages
- Live/delayed price refresh for supported public quote endpoints, plus automatic refresh while the page is open
- Vercel serverless quote proxy at `api/market-data.js` so hosted deployments can refresh prices/charts without browser CORS blocking
- Upcoming IPO pane with selected-country filtering, participation steps, and hosted `/api/ipo-calendar` support
- Platform suggestions for each stock
- UK stock suggestions focused on Stocks & Shares ISA platforms
- Nigerian app suggestions including Bamboo, InvestNaija, Chaka, Trove, and Risevest where relevant

## Data Note

The app uses a curated April 2026 dividend universe in `app.js`, plus an imported 1,500-row online dataset saved in `online-dividend-universe.js`. The import is screened to remove obvious red flags such as extreme yields, extreme payout ratios, tiny market caps, acquisition/warrant-style names, and weak quality scores. DividendRanks states it tracks 3,500+ dividend stocks and 2,000+ ETFs, while UK and Nigeria rows are curated from public dividend-yield/dividend-calendar sources. Full exchange-grade coverage for every dividend-paying security requires licensed market data. Before investing, confirm live stock prices, declared dividend dates, platform availability, FX rates, fees, tax rules, and your own suitability.

Nigeria dividend dates that are publicly available for free are stored in `nigeria-dividends.js`. The file is loaded before `app.js` so Nigerian stocks can use verified qualification dates, closure-of-register periods, payment dates, dividend amount, registrar, and source notes where the public NGX Pulse tracker has data. Stocks without a public entry still use the curated fallback schedule until you add a verified record or connect a paid corporate-actions API.

Fresh Nigerian dividend updates from public pages are written to `nigeria-dividends-scraped.js` by `scripts/scrape_nigeria_dividends_public.js`. Run `npm run update:nigeria-dividends` from this folder to fetch the live NGX Pulse 2026 dividend table, attach official NGX disclosure links from the NGX SharePoint news feed, and refresh the Nigerian update file. The scraper also writes `nigeria-dividends-scraped.json` with audit coverage so you can see what changed before deploying.

Non-Nigerian dividend event history that is publicly available for free is stored in `market-dividends.js` and refreshed on the hosted site through `/api/market-data` where Yahoo dividend events are available. Free Yahoo event history usually confirms qualification/ex-dividend events and dividend amounts, but it does not reliably provide full record or payment dates. Zimbabwe rows with public payment-date history are also stored in this file where a public source was available. The website therefore labels those rows as event history unless a configured corporate-actions provider returns complete future dates.

Additional non-Nigerian public dividend page updates can now be written to `market-dividends-scraped.js` by `scripts/scrape_market_dividends.js`. Run `npm run update:market-dividends` from this folder to scrape public dividend pages for supported US, UK, Canada, Europe, Asia, and Zimbabwe stocks. The script prefers public StockAnalysis dividend pages and now also uses `DividendHistory.org` payout pages where needed for additional real ex-dividend and payout coverage. It also writes `market-dividends-scraped.json` with audit coverage and failures so you can see which tickers produced real qualification, record, and payment dates from public pages.

Run `npm run update:all-dividends` to refresh both Nigerian and non-Nigerian scraped dividend snapshots in one step before uploading or committing.

## Hosted Live Updates

When deployed to Vercel, the app calls `/api/market-data` every minute on weekdays for the visible stocks. The endpoint fetches delayed Stooq/Yahoo quotes server-side and returns prices plus history for chart updates. It can also verify dividend history and declared qualification/record/payment dates when one or more corporate-actions API keys are configured.

The hosted page now refreshes dividend data in three ways:

- it loads the uploaded `nigeria-dividends-scraped.js` and `market-dividends-scraped.js` files on page load
- it polls the matching `.json` snapshot files every 5 minutes so newly uploaded dividend files can repaint the open hosted page without a manual browser refresh
- it runs a slower rotating dividend sweep every 20 minutes across the currently selected markets so newly released public dividend declarations can flow into the dividend calendar, alerts, stock details, and dividend history panes over time

Dividend-date verification is on demand. The website does not verify every stock on login; when a user opens or clicks a stock, it calls `/api/verify-dividend` for that one ticker after about one second. Once that ticker has been checked in the browser, the result is cached by market/ticker and later clicks reuse the same verified dividend data instead of verifying again. The cache is refreshed only after both the verified qualification date and payment date have passed, so the next click can look for the next declared dividend cycle. The verifier first checks static scraped files, then scrapes supported public dividend pages server-side, including the live NGX Pulse dividend table for Nigeria, the official NGX disclosure feed for supporting Nigeria evidence, and supported public dividend pages such as StockAnalysis and DividendHistory.org for non-Nigerian stocks, then checks configured market-data providers, then optionally asks a rotating AI checker to parse/check only the supplied evidence. AI output is never treated as the evidence source. Without an AI key, the verifier still uses the source/provider evidence directly.

The AI checker rotates through configured providers until one returns usable dividend JSON. Add any one provider key, or add several for failover:

- `GEMINI_API_KEY` with optional `GEMINI_MODEL=gemini-2.5-flash-lite`
- `HF_TOKEN` with optional `GPT_OSS_MODEL=openai/gpt-oss-120b:fastest`
- `HF_TOKEN` with optional `HF_CHAT_MODEL=meta-llama/Llama-3.1-8B-Instruct`
- `CF_ACCOUNT_ID`, `CF_API_TOKEN`, and optional `CF_WORKERS_AI_MODEL=@cf/meta/llama-3.1-8b-instruct`

Optional rotation controls: `AI_PROVIDER_ORDER=gemini,gptoss,cloudflare,huggingface`, `AI_PROVIDER_CYCLES=3`, and `AI_PROVIDER_TIMEOUT_MS=8500`.

For stronger dividend-date accuracy, add at least one of these Vercel environment variables:

- `FMP_API_KEY` - Financial Modeling Prep dividend data
- `ALPHAVANTAGE_API_KEY` - Alpha Vantage DIVIDENDS endpoint
- `POLYGON_API_KEY` - Polygon dividend reference data
- `TWELVE_DATA_API_KEY` - Twelve Data dividends endpoint

Without these keys, the app can still scrape supported public dividend pages plus free Yahoo dividend-event history, but it will still fall back to curated dates where the public web does not expose reliable future payment schedules. Full exchange-grade accuracy for every country and every security still requires a licensed data provider plus confirmation from the relevant exchange, company investor-relations announcement, registrar, or broker.

The app also calls `/api/ipo-calendar` for upcoming IPOs. Free IPO sources are best for major US exchanges; for Nigeria, UK, Canada, Europe, Asia, and Zimbabwe, always verify with the official exchange, the company prospectus, and the broker/platform before applying.

## Scheduled Snapshot Refresh

The repository includes `.github/workflows/refresh-dividend-data.yml`. Once GitHub Actions is enabled on the repo, it runs every 6 hours and can also be started manually from the GitHub Actions tab. The workflow runs `npm run update:all-dividends`, commits any changed scraped dividend files, and pushes them back to the repo. If Vercel is connected to the repo, that push triggers a redeploy so the hosted site automatically picks up the fresher dividend snapshot files.

## Hosted OTP Emails

The sign-up and sign-in OTP flow calls `/api/send-otp` on hosted deployments. To send real OTP emails on Vercel, add these environment variables:

- `RESEND_API_KEY` - your Resend API key
- `OTP_FROM_EMAIL` - optional verified sender, defaults to `Dividend Stock Tracker <onboarding@resend.dev>` if not set
- `RESEND_FROM_EMAIL` - optional fallback sender name used by the Job Agent project
- `APP_NAME` - optional email heading

If the app is opened locally with `file://`, the OTP appears on the page as a local test code. Hosted deployments do not show fallback OTPs: users must receive the OTP by email through Resend before they can verify or sign in. Use `dividendstocktracker@gmail.com` as the reply-to/support inbox, and use a Resend-allowed sender address for `OTP_FROM_EMAIL`.

## Shared Accounts Across Phone And Desktop

Hosted deployments can now use a shared Supabase-backed user store instead of per-device `localStorage`. That means:

- a user created on desktop can sign in on phone
- the installed phone app can see the same username/email/password as the browser version
- admin actions now work against the same shared hosted users
- watchlist, visible markets, saved holdings, compare stocks, and dashboard state can sync back to the hosted account

Add these Vercel environment variables for the project that serves your live site:

- `SUPABASE_URL` - your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - the server-side service role key for that project
- `SUPABASE_USERS_TABLE` - optional, defaults to `dividend_users`

Then open the Supabase SQL editor and run:

- `supabase/dividend_users.sql`

That creates the shared `dividend_users` table used by:

- `/api/auth-signup`
- `/api/auth-signin`
- `/api/auth-verify-otp`
- `/api/auth-resend-otp`
- `/api/auth-reset-password`
- `/api/auth-session-user`
- `/api/auth-sync-profile`
- `/api/admin-users`
- `/api/admin-user-action`

When the website is opened locally with `file://`, it still falls back to local browser storage so you can test without a backend. On the hosted site, once Supabase is configured, the phone install and desktop browser will use the same shared account data.
