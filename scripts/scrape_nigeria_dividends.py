#!/usr/bin/env python3
"""Refresh Nigerian dividend dates from public web sources.

The script is intentionally dependency-light. If BeautifulSoup is installed it
uses it for cleaner text extraction; otherwise it falls back to Python's stdlib
HTMLParser. It writes:

- nigeria-dividends-scraped.js   browser-readable updates for the website
- nigeria-dividends-scraped.json audit data and source coverage
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
APP_JS = ROOT / "app.js"
BASE_DIVIDENDS = ROOT / "nigeria-dividends.js"
OUTPUT_JS = ROOT / "nigeria-dividends-scraped.js"
OUTPUT_JSON = ROOT / "nigeria-dividends-scraped.json"

SOURCES = {
    "ngx_corporate_disclosures": {
        "name": "NGX corporate disclosures",
        "url": "https://ngxgroup.com/exchange/data/corporate-disclosures/",
        "confidence": 92,
    },
    "ngx_release_calendar": {
        "name": "NGX release calendar",
        "url": "https://ngxgroup.com/exchange/raise-capital/release-calendar/",
        "confidence": 88,
    },
    "africanfinancials": {
        "name": "AfricanFinancials dividends",
        "url": "https://africanfinancials.com/dividends/",
        "confidence": 82,
    },
    "investing_ngxgroup": {
        "name": "Investing.com NGXGROUP dividends",
        "url": "https://www.investing.com/equities/nigerian-exchange-dividends",
        "confidence": 72,
    },
    "african_markets": {
        "name": "African Markets NGSE dividends",
        "url": "https://www.african-markets.com/en/stock-markets/ngse/dividends",
        "confidence": 78,
    },
    "zikoko_2026": {
        "name": "Zikoko Nigerian stocks paying dividends 2026",
        "url": "https://www.zikoko.com/money/nigerian-stocks-paying-dividends-2026/",
        "confidence": 74,
    },
}

MANUAL_COMPANY_TO_TICKER = {
    "ACCESS HOLDINGS": "ACCESSCORP",
    "ACCESS HOLDINGS PLC": "ACCESSCORP",
    "MTN NIGERIA COMMUNICATIONS": "MTNN",
    "MTN NIGERIA COMMUNICATIONS PLC": "MTNN",
    "MTN NIGERIA": "MTNN",
    "NIGERIAN EXCHANGE GROUP": "NGXGROUP",
    "NGX GROUP": "NGXGROUP",
    "BUA CEMENT": "BUACEMENT",
    "DANGOTE CEMENT": "DANGCEM",
    "UNITED CAPITAL": "UCAP",
    "NASCON ALLIED INDUSTRIES": "NASCON",
    "MECURE INDUSTRIES": "MECURE",
    "UNILEVER NIGERIA": "UNILEVER",
    "ZENITH BANK": "ZENITHBANK",
    "GUARANTY TRUST HOLDING COMPANY": "GTCO",
    "GTCO": "GTCO",
    "FIDELITY BANK": "FIDELITYBK",
    "FIDSON HEALTHCARE": "FIDSON",
    "CUSTODIAN INVESTMENT": "CUSTODIAN",
    "UNITED BANK FOR AFRICA": "UBA",
    "LAFARGE AFRICA": "WAPCO",
    "TOTALENERGIES MARKETING NIGERIA": "TOTAL",
    "TOTAL ENERGIES MARKETING NIGERIA": "TOTAL",
    "THE INITIATES": "TIP",
}

DATE_FORMATS = (
    "%Y-%m-%d",
    "%b %d, %Y",
    "%B %d, %Y",
    "%d %b %Y",
    "%d %B %Y",
    "%d-%b-%Y",
    "%d-%B-%Y",
)

TYPE_LABELS = {
    "F": "Final",
    "I": "Interim",
    "12M": "Annual",
    "6M": "Semi-annual",
    "3M": "Quarterly",
    "1M": "Monthly",
    "B": "Bonus",
    "O": "Other",
}


class TextExtractor(HTMLParser):
    block_tags = {
        "br",
        "p",
        "div",
        "li",
        "tr",
        "td",
        "th",
        "h1",
        "h2",
        "h3",
        "h4",
        "section",
        "article",
    }

    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in self.block_tags:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in self.block_tags:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        text = html.unescape(data).strip()
        if text:
            self.parts.append(text)
            self.parts.append(" ")

    def text(self) -> str:
        raw = "".join(self.parts)
        raw = re.sub(r"[ \t]+", " ", raw)
        raw = re.sub(r"\n\s+", "\n", raw)
        raw = re.sub(r"\n{3,}", "\n\n", raw)
        return raw.strip()


@dataclass
class SourceRecord:
    ticker: str
    company: str = ""
    amount: float | None = None
    currency: str = "NGN"
    type: str = ""
    qualificationDate: str = ""
    recordDate: str = ""
    paymentDate: str = ""
    closureOfRegister: str = ""
    agmDate: str = ""
    registrar: str = ""
    sourceName: str = ""
    sourceUrl: str = ""
    confidence: int = 0
    note: str = ""
    history: list[dict[str, Any]] = field(default_factory=list)


def clean_ws(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(value or "")).strip()


def normalize_name(value: str) -> str:
    value = clean_ws(value).upper()
    value = re.sub(r"\[[^\]]+\]", "", value)
    value = re.sub(r"\([^)]*\)", "", value)
    value = value.replace("&", " AND ")
    value = re.sub(r"\b(PLC|PLC\.|LIMITED|LTD|NIGERIA|NIGERIAN|COMPANY|CO\.|THE)\b", " ", value)
    return re.sub(r"[^A-Z0-9]+", " ", value).strip()


def parse_amount(value: str) -> tuple[float | None, str]:
    text = clean_ws(value)
    currency = "NGN" if "\u20a6" in text or "NGN" in text.upper() else ""
    match = re.search(r"[-+]?\d+(?:,\d{3})*(?:\.\d+)?", text)
    if not match:
        return None, currency or "NGN"
    return float(match.group(0).replace(",", "")), currency or "NGN"


def parse_date(value: str) -> str:
    text = clean_ws(value)
    if not text or re.search(r"\b(to be|tbc|communicated|n/?a)\b", text, re.I):
        return text
    text = re.sub(r"(\d{4})\s+-\s*(\d{2})-(\d{2})", r"\1-\2-\3", text)
    text = re.sub(r"(\d{4})\s*-\s*(\d{2})\s*-\s*(\d{2})", r"\1-\2-\3", text)
    text = re.sub(r"(\d+)(st|nd|rd|th)", r"\1", text, flags=re.I)
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            pass
    match = re.search(r"\d{4}-\d{2}-\d{2}", text)
    if match:
        return match.group(0)
    match = re.search(r"[A-Z][a-z]{2,8}\s+\d{1,2},\s+\d{4}", text)
    if match:
        return parse_date(match.group(0))
    return text


def date_is_iso(value: str) -> bool:
    return bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", value or ""))


def fetch_url(url: str, pause: float = 0.8) -> tuple[str, str]:
    req = Request(
        url,
        headers={
            "User-Agent": "DividendStockTracker/1.0 (+https://example.com; dividend research)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    )
    time.sleep(pause)
    try:
        with urlopen(req, timeout=25) as response:
            return response.read().decode("utf-8", errors="replace"), ""
    except (HTTPError, URLError, TimeoutError) as exc:
        return "", f"{type(exc).__name__}: {exc}"


def html_to_text(markup: str) -> str:
    try:
        from bs4 import BeautifulSoup  # type: ignore

        return BeautifulSoup(markup, "html.parser").get_text("\n", strip=True)
    except Exception:
        parser = TextExtractor()
        parser.feed(markup)
        return parser.text()


def load_nigeria_universe() -> tuple[set[str], dict[str, str]]:
    text = APP_JS.read_text(encoding="utf-8")
    tickers: set[str] = set()
    aliases: dict[str, str] = dict(MANUAL_COMPANY_TO_TICKER)

    for ticker, company in re.findall(r'\["Nigeria",\s*"[^"]+",\s*"([^"]+)",\s*"([^"]+)"', text):
        tickers.add(ticker)
        aliases[normalize_name(company)] = ticker

    for block in re.findall(r"\{[^{}]*market:\s*\"Nigeria\"[^{}]*\}", text, flags=re.S):
        ticker_match = re.search(r'ticker:\s*"([^"]+)"', block)
        name_match = re.search(r'name:\s*"([^"]+)"', block)
        if ticker_match:
            ticker = ticker_match.group(1)
            tickers.add(ticker)
            if name_match:
                aliases[normalize_name(name_match.group(1))] = ticker

    return tickers, aliases


def match_ticker(company: str, aliases: dict[str, str], tickers: set[str]) -> str:
    cleaned = normalize_name(company)
    if cleaned in tickers:
        return cleaned
    if cleaned in aliases:
        return aliases[cleaned]
    for alias, ticker in aliases.items():
        if alias and (alias in cleaned or cleaned in alias):
            return ticker
    return ""


def parse_zikoko(text: str) -> list[SourceRecord]:
    source = SOURCES["zikoko_2026"]
    heading_matches = list(re.finditer(
        r"(?m)^\s*(?:##\s*)?\d+\.\s+(.+?)\s*\(([A-Z0-9.]+)\)\s*$",
        text,
    ))
    if not heading_matches:
        compact = re.sub(r"\s+", " ", text)
        heading_matches = list(re.finditer(
            r"(?:^|\s)\d+\.\s+([A-Z][A-Za-z0-9 &'.,\-]+?)\s*\(([A-Z0-9.]+)\)",
            compact,
        ))
        text = compact

    records: list[SourceRecord] = []
    for index, match in enumerate(heading_matches):
        next_start = heading_matches[index + 1].start() if index + 1 < len(heading_matches) else len(text)
        section = text[match.end():next_start]
        company = clean_ws(match.group(1))
        ticker = match.group(2).strip().upper()
        amount_text = re.search(r"Dividend per share:\s*([^\n]+)", section, flags=re.I)
        if not amount_text:
            amount_text = re.search(r"Dividend per share:\s*(.+?)(?: Qualification date:| Payment date:| Registrar:| Bonus issue:|$)", section, flags=re.I)
        qualification = re.search(r"Qualification date:\s*([^\n]+)", section, flags=re.I)
        if not qualification:
            qualification = re.search(r"Qualification date:\s*(.+?)(?: Payment date:| Registrar:| Bonus issue:|$)", section, flags=re.I)
        payment = re.search(r"Payment date:\s*([^\n]+)", section, flags=re.I)
        if not payment:
            payment = re.search(r"Payment date:\s*(.+?)(?: Registrar:| Bonus issue:|$)", section, flags=re.I)
        registrar = re.search(r"Registrar:\s*([^\n]+)", section, flags=re.I)
        if not registrar:
            registrar = re.search(r"Registrar:\s*(.+?)(?: Bonus issue:|$)", section, flags=re.I)
        amount, currency = parse_amount(amount_text.group(1) if amount_text else "")
        records.append(SourceRecord(
            ticker=ticker,
            company=company,
            amount=amount,
            currency=currency,
            type="Final" if amount_text and "final" in amount_text.group(1).lower() else "",
            qualificationDate=parse_date(qualification.group(1)) if qualification else "",
            paymentDate=parse_date(payment.group(1)) if payment else "",
            registrar=clean_ws(registrar.group(1)).replace(" Limited", "") if registrar else "",
            sourceName=source["name"],
            sourceUrl=source["url"],
            confidence=source["confidence"],
            note="Article states figures/dates were sourced from NGX corporate action filings and company announcements.",
        ))
    return records


def parse_investing_ngxgroup(text: str) -> list[SourceRecord]:
    source = SOURCES["investing_ngxgroup"]
    table_region = text[text.find("Ex-Dividend Date"):]
    pattern = re.compile(
        r"([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})\s+"
        r"([0-9.,]+)\s+"
        r"([A-Z0-9]+)\s+"
        r"([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})",
        re.S,
    )
    history: list[dict[str, Any]] = []
    for ex_date, amount_text, dtype, pay_date in pattern.findall(table_region):
        amount, currency = parse_amount(amount_text)
        history.append({
            "exDate": parse_date(ex_date),
            "payDate": parse_date(pay_date),
            "amount": amount or 0,
            "currency": currency,
            "label": TYPE_LABELS.get(dtype, dtype),
        })
    if not history:
        return []
    latest = history[0]
    return [SourceRecord(
        ticker="NGXGROUP",
        company="Nigerian Exchange Group",
        amount=latest.get("amount") or None,
        currency=latest.get("currency") or "NGN",
        type=latest.get("label") or "",
        qualificationDate=latest.get("exDate", ""),
        paymentDate=latest.get("payDate", ""),
        history=history[:8],
        sourceName=source["name"],
        sourceUrl=source["url"],
        confidence=source["confidence"],
    )]


def parse_africanfinancials(text: str) -> list[SourceRecord]:
    source = SOURCES["africanfinancials"]
    pattern = re.compile(
        r"([A-Z0-9 &'.,\-]+?)\s+\(([A-Z0-9.\-]+)\.ng\)\s+"
        r"([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})\s+"
        r"([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})\s+"
        r"([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})\s+"
        r"([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})\s+"
        r"([0-9.,]+)\s*([A-Z]{3})",
        re.S,
    )
    records: list[SourceRecord] = []
    for company, ticker, _, record_date, ex_date, pay_date, amount_text, currency in pattern.findall(text):
        amount, _ = parse_amount(amount_text)
        records.append(SourceRecord(
            ticker=ticker.upper(),
            company=clean_ws(company),
            amount=amount,
            currency=currency,
            qualificationDate=parse_date(ex_date),
            recordDate=parse_date(record_date),
            paymentDate=parse_date(pay_date),
            history=[{
                "exDate": parse_date(ex_date),
                "recordDate": parse_date(record_date),
                "payDate": parse_date(pay_date),
                "amount": amount or 0,
                "currency": currency,
                "label": "AfricanFinancials dividend record",
            }],
            sourceName=source["name"],
            sourceUrl=source["url"],
            confidence=source["confidence"],
        ))
    return records


def parse_ngx_release_calendar(text: str, aliases: dict[str, str], tickers: set[str]) -> list[SourceRecord]:
    source = SOURCES["ngx_release_calendar"]
    records: list[SourceRecord] = []
    compact = re.sub(r"\s+", " ", text)
    pattern = re.compile(
        r"([A-Z0-9][A-Za-z0-9 .,&'’\-]+?)\s+Corporate Actions\s+Corporate Actions\s+"
        r"(.{0,220}?dividend.{0,220}?)\s+(\d{4})\s*-\s*(\d{2})\s*-\s*(\d{2})",
        re.I,
    )
    for match in pattern.finditer(compact):
        company = clean_ws(match.group(1))
        rest = clean_ws(match.group(2))
        if "--" in company or len(company) > 90 or re.search(r"\d{4}\s*-\s*\d{2}", company):
            continue
        if "payment" not in rest.lower():
            continue
        ticker = match_ticker(company, aliases, tickers)
        if not ticker:
            continue
        event_date = f"{match.group(3)}-{match.group(4)}-{match.group(5)}"
        if event_date < date.today().isoformat():
            continue
        dtype = "Interim" if "interim" in rest.lower() else "Final" if "final" in rest.lower() else ""
        record = SourceRecord(
            ticker=ticker,
            company=clean_ws(company),
            type=dtype,
            sourceName=source["name"],
            sourceUrl=source["url"],
            confidence=source["confidence"],
            note="Official NGX release-calendar corporate-action event.",
        )
        record.paymentDate = event_date
        records.append(record)
    return records


def merge_records(records: list[SourceRecord], tickers: set[str]) -> dict[str, dict[str, Any]]:
    grouped: dict[str, list[SourceRecord]] = {}
    for record in records:
        if record.ticker and record.ticker in tickers:
            grouped.setdefault(record.ticker, []).append(record)

    merged: dict[str, dict[str, Any]] = {}
    field_names = (
        "company",
        "amount",
        "currency",
        "type",
        "qualificationDate",
        "recordDate",
        "paymentDate",
        "closureOfRegister",
        "agmDate",
        "registrar",
        "note",
    )
    for ticker, ticker_records in grouped.items():
        ticker_records.sort(key=lambda item: item.confidence, reverse=True)
        entry: dict[str, Any] = {"sources": []}
        field_confidence: dict[str, int] = {}
        histories: list[dict[str, Any]] = []
        for record in ticker_records:
            entry["sources"].append({
                "name": record.sourceName,
                "url": record.sourceUrl,
                "confidence": record.confidence,
            })
            for field_name in field_names:
                value = getattr(record, field_name)
                if value in ("", None):
                    continue
                current_confidence = field_confidence.get(field_name, -1)
                if record.confidence >= current_confidence:
                    entry[field_name] = value
                    field_confidence[field_name] = record.confidence
            histories.extend(record.history)
        if histories:
            unique_history: dict[tuple[str, str, str], dict[str, Any]] = {}
            for row in histories:
                key = (row.get("exDate", ""), row.get("payDate", ""), str(row.get("amount", "")))
                unique_history[key] = row
            entry["history"] = sorted(
                unique_history.values(),
                key=lambda row: row.get("exDate") or row.get("payDate") or "",
                reverse=True,
            )[:12]
        if entry.get("sources"):
            entry["sourceName"] = " / ".join(dict.fromkeys(source["name"] for source in entry["sources"]))
            entry["sourceUrl"] = entry["sources"][0]["url"]
            entry["verifiedAt"] = date.today().isoformat()
        merged[ticker] = entry
    return merged


def write_outputs(payload: dict[str, Any]) -> None:
    OUTPUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    js = "window.NIGERIA_DIVIDEND_UPDATES = "
    js += json.dumps(payload["records"], indent=2, ensure_ascii=False)
    js += ";\n"
    OUTPUT_JS.write_text(js, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--offline", action="store_true", help="Use built-in seed rows without fetching websites.")
    args = parser.parse_args()

    tickers, aliases = load_nigeria_universe()
    source_status: dict[str, dict[str, str]] = {}
    all_records: list[SourceRecord] = []

    for key, source in SOURCES.items():
        markup = ""
        error = ""
        if not args.offline:
            markup, error = fetch_url(source["url"])
        if error:
            source_status[key] = {"status": "error", "message": error, "url": source["url"]}
            continue
        text = html_to_text(markup) if markup else ""
        if "Verifying that you are not a robot" in text:
            source_status[key] = {"status": "blocked", "message": "Bot verification page returned", "url": source["url"]}
            continue

        before = len(all_records)
        if key == "zikoko_2026":
            all_records.extend(parse_zikoko(text))
        elif key == "investing_ngxgroup":
            all_records.extend(parse_investing_ngxgroup(text))
        elif key == "africanfinancials":
            all_records.extend(parse_africanfinancials(text))
        elif key == "ngx_release_calendar":
            all_records.extend(parse_ngx_release_calendar(text, aliases, tickers))
        elif key == "ngx_corporate_disclosures":
            if "Company Disclosures Date Submitted" in text:
                source_status[key] = {"status": "no_rows", "message": "Public page returned only the delayed disclosure shell; detailed rows are loaded dynamically.", "url": source["url"]}
                continue
        source_status[key] = {
            "status": "ok",
            "records": str(len(all_records) - before),
            "url": source["url"],
        }

    merged = merge_records(all_records, tickers)
    payload = {
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "records": {
            "_meta": {
                "sourceName": "Scraped Nigerian dividend sources",
                "sourceUrl": ", ".join(source["url"] for source in SOURCES.values()),
                "verifiedAt": date.today().isoformat(),
                "note": "Generated from public Nigerian dividend pages. Blocked or dynamic sources are recorded in nigeria-dividends-scraped.json. Confirm with official company/registrar before trading.",
            },
            **merged,
        },
        "coverage": {
            "nigeriaTickersInWebsite": len(tickers),
            "tickersWithScrapedRows": len(merged),
            "missingTickers": sorted(tickers - set(merged.keys())),
        },
        "sourceStatus": source_status,
    }
    write_outputs(payload)
    print(f"Wrote {OUTPUT_JS.name} with {len(merged)} ticker updates from {len(all_records)} scraped records.")
    print(f"Coverage: {len(merged)}/{len(tickers)} Nigerian tickers.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
