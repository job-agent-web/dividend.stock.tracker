from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from datetime import date, timedelta
from io import BytesIO
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

try:
    from pypdf import PdfReader
except ModuleNotFoundError as exc:  # pragma: no cover - setup guidance for local runs
    raise SystemExit(
        "Missing dependency: pypdf. Install it with `python -m pip install pypdf` and rerun."
    ) from exc


USER_AGENT = "Mozilla/5.0 (compatible; DividendStockTracker/1.0; +https://dividendstocktracker.vercel.app)"
PDF_URL = "https://doclib.ngxgroup.com/DownloadsContent/DAILY%20SUMMARY%20FOR%20{day}.pdf"
MIN_CLOSES = 30
MAX_CALENDAR_DAYS = 120

COMMON_WORDS = re.compile(r"\b(PLC|LTD|LIMITED|COMPANY|NIGERIA|NIGERIAN|HOLDINGS?|GROUP)\b")
ROW_PATTERN = re.compile(
    r"^\s*\d+\s+(.*?)\s+([0-9,]+\.\d{2})\s+([0-9,]+\.\d{2})\s+(-|[0-9.-]+)\s*$"
)

MANUAL_ALIASES = {
    "ACCESS": "ACCESSCORP",
    "ACCESS HOLDINGS": "ACCESSCORP",
    "AIICO INSURANCE": "AIICO",
    "AIRTEL AFRICA": "AIRTELAFRI",
    "ARADEL": "ARADEL",
    "ARARADEL HOLDINGS": "ARADEL",
    "AXAMANSARD INSURANCE": "AXAMANSARD",
    "AXA MANSARD": "AXAMANSARD",
    "BERGER PAINTS": "BERGER",
    "BETA GLASS": "BETAGLAS",
    "BUA CEMENT": "BUACEMENT",
    "BUA FOODS": "BUAFOODS",
    "CADBURY": "CADBURY",
    "CENTRAL SECURITIES CLEARING SYSTEM": "CSCS",
    "CONOIL": "CONOIL",
    "CUSTODIAN INVESTMENT": "CUSTODIAN",
    "DANGOTE CEMENT": "DANGCEM",
    "DANGOTE SUGAR REFINERY": "DANGSUGAR",
    "ECOBANK TRANSNATIONAL INCORPORATED": "ETI",
    "ETRANZACT INTERNATIONAL": "ETRANZACT",
    "FIDELITY BANK": "FIDELITYBK",
    "FIDSON HEALTHCARE": "FIDSON",
    "FIRST HOLDCO": "FBNH",
    "FLOUR MILLS": "FLOURMILL",
    "GEREGU POWER": "GEREGU",
    "GUARANTY TRUST": "GTCO",
    "GUARANTY TRUST HOLDING": "GTCO",
    "MECURE INDUSTRIES": "MECURE",
    "MTN": "MTNN",
    "MTN COMMUNICATIONS": "MTNN",
    "N NIG FLOUR MILLS": "FLOURMILL",
    "NAHCO": "NAHCO",
    "NASCON ALLIED INDUSTRIES": "NASCON",
    "NESTLE": "NESTLE",
    "NIGERIAN AVIATION HANDLING": "NAHCO",
    "NIGERIAN BREW": "NB",
    "NIGERIAN EXCHANGE GROUP": "NGXGROUP",
    "OANDO": "OANDO",
    "OKOMU OIL PALM": "OKOMUOIL",
    "PRESCO": "PRESCO",
    "SEPLAT ENERGY": "SEPLAT",
    "STANBIC IBTC": "STANBIC",
    "THE INITIATES": "TIP",
    "TOTALENERGIES MARKETING": "TOTAL",
    "TRANSNATIONAL CORPORATION": "TRANSCORP",
    "TRANSCORP POWER": "TRANSPOWER",
    "U A C N": "UACN",
    "UBA": "UBA",
    "UNITED BANK FOR AFRICA": "UBA",
    "UNITED CAPITAL": "UCAP",
    "UNILEVER": "UNILEVER",
    "VITAFOAM": "VITAFOAM",
    "WEMA BANK": "WEMABANK",
    "ZENITH BANK": "ZENITHBANK",
}


def normalize_name(value: str) -> str:
    text = str(value or "").upper()
    text = re.sub(r"\([^)]*\)", " ", text)
    text = text.replace("&", " AND ")
    text = COMMON_WORDS.sub(" ", text)
    text = re.sub(r"[^A-Z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def build_aliases(stocks: list[dict]) -> dict[str, str]:
    aliases = {normalize_name(stock["name"]): stock["ticker"] for stock in stocks}
    aliases.update(MANUAL_ALIASES)
    return {key: value for key, value in aliases.items() if key}


def fetch_pdf_text(day_string: str) -> tuple[str | None, str]:
    url = PDF_URL.format(day=day_string)
    request = Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(request, timeout=30) as response:
            content = response.read()
    except HTTPError as exc:
        if exc.code == 404:
            return None, url
        raise
    except URLError:
        return None, url

    if not content.startswith(b"%PDF"):
        return None, url

    reader = PdfReader(BytesIO(content))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    return text, url


def resolve_ticker(company_name: str, aliases: dict[str, str]) -> str:
    normalized = normalize_name(company_name)
    if not normalized:
        return ""
    if normalized in aliases:
        return aliases[normalized]
    for alias, ticker in aliases.items():
        if alias and (alias in normalized or normalized in alias):
            return ticker
    return ""


def extract_rows(text: str, aliases: dict[str, str], targets: set[str]) -> dict[str, float]:
    rows = {}
    for raw_line in text.splitlines():
        match = ROW_PATTERN.match(raw_line)
        if not match:
            continue
        ticker = resolve_ticker(match.group(1), aliases)
        if not ticker or ticker not in targets or ticker in rows:
            continue
        price = float(match.group(3).replace(",", ""))
        if price > 0:
            rows[ticker] = price
    return rows


def build_history(stocks: list[dict]) -> dict:
    aliases = build_aliases(stocks)
    targets = {stock["ticker"] for stock in stocks}
    history = defaultdict(list)
    source_urls = defaultdict(list)
    available_docs = 0
    checked_days = 0

    cursor = date.today()
    while checked_days < MAX_CALENDAR_DAYS:
        day_string = cursor.strftime("%d-%m-%Y")
        checked_days += 1
        text, url = fetch_pdf_text(day_string)
        cursor -= timedelta(days=1)
        if not text:
            continue
        available_docs += 1
        rows = extract_rows(text, aliases, targets)
        iso_date = date.fromisoformat(f"{day_string[6:10]}-{day_string[3:5]}-{day_string[0:2]}").isoformat()
        for ticker, close in rows.items():
            history[ticker].append({"date": iso_date, "close": close})
            source_urls[ticker].append(url)

        if targets and all(len(history.get(ticker, [])) >= MIN_CLOSES for ticker in targets if ticker not in {"CSCS", "ETRANZACT"}):
            break

    output = {
        "generatedAt": date.today().isoformat(),
        "provider": "NGX official daily summary PDFs",
        "checkedDays": checked_days,
        "tradingDaysFound": available_docs,
        "data": {}
    }
    for stock in stocks:
        points = list(reversed(history.get(stock["ticker"], [])))
        if len(points) < 15:
            continue
        urls = list(dict.fromkeys(source_urls.get(stock["ticker"], [])))[:12]
        output["data"][f'Nigeria:{stock["ticker"]}'] = {
            "ticker": stock["ticker"],
            "market": "Nigeria",
            "name": stock["name"],
            "provider": "NGX official daily summary PDFs",
            "dailyHistory": [point["close"] for point in points[-60:]],
            "dailyLabels": [point["date"] for point in points[-60:]],
            "closesCount": len(points),
            "sourceUrls": urls,
        }
    return output


def main() -> None:
    payload = json.loads(sys.stdin.read() or "[]")
    if not isinstance(payload, list):
      raise SystemExit("Expected a JSON array of Nigeria stocks on stdin.")
    result = build_history(payload)
    sys.stdout.write(json.dumps(result))


if __name__ == "__main__":
    main()
