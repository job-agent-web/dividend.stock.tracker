window.MARKET_DIVIDEND_DATES = {
  _meta: {
    sourceName: "Free public Yahoo dividend-event history",
    sourceUrl: "https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=2y&interval=1mo&events=div",
    verifiedAt: "2026-05-05",
    note: "Free public dividend-event history usually provides dividend event date and amount, but not full record/payment dates. Use paid corporate-actions APIs or official company/exchange notices for complete future payment schedules."
  },
  "US:AAPL": {
    company: "Apple Inc.",
    amount: 0.26,
    qualificationDate: "2026-02-09",
    history: [
      { exDate: "2026-02-09", amount: 0.26 },
      { exDate: "2025-11-10", amount: 0.26 },
      { exDate: "2025-08-11", amount: 0.26 },
      { exDate: "2025-05-12", amount: 0.26 }
    ]
  },
  "US:MSFT": {
    company: "Microsoft Corporation",
    amount: 0.91,
    qualificationDate: "2026-02-19",
    history: [
      { exDate: "2026-02-19", amount: 0.91 },
      { exDate: "2025-11-20", amount: 0.91 },
      { exDate: "2025-08-21", amount: 0.83 },
      { exDate: "2025-05-15", amount: 0.83 }
    ]
  },
  "US:KO": {
    company: "Coca-Cola",
    amount: 0.53,
    qualificationDate: "2026-03-13",
    history: [
      { exDate: "2026-03-13", amount: 0.53 },
      { exDate: "2025-12-01", amount: 0.51 },
      { exDate: "2025-09-15", amount: 0.51 },
      { exDate: "2025-06-13", amount: 0.51 }
    ]
  },
  "US:JPM": {
    company: "JPMorgan Chase",
    amount: 1.5,
    qualificationDate: "2026-04-06",
    history: [
      { exDate: "2026-04-06", amount: 1.5 },
      { exDate: "2026-01-06", amount: 1.5 },
      { exDate: "2025-10-06", amount: 1.5 },
      { exDate: "2025-07-03", amount: 1.4 }
    ]
  },
  "US:XOM": {
    company: "Exxon Mobil",
    amount: 1.03,
    qualificationDate: "2026-02-12",
    history: [
      { exDate: "2026-02-12", amount: 1.03 },
      { exDate: "2025-11-14", amount: 1.03 },
      { exDate: "2025-08-15", amount: 0.99 },
      { exDate: "2025-05-15", amount: 0.99 }
    ]
  },
  "UK:SHEL": {
    company: "Shell PLC",
    amount: 27.869999,
    qualificationDate: "2026-02-19",
    currency: "GBp",
    history: [
      { exDate: "2026-02-19", amount: 27.869999 },
      { exDate: "2025-11-13", amount: 26.85 },
      { exDate: "2025-08-14", amount: 26.62 },
      { exDate: "2025-05-15", amount: 26.409998 }
    ]
  },
  "UK:BP": {
    company: "BP PLC",
    amount: 6.226,
    qualificationDate: "2026-02-19",
    currency: "GBp",
    history: [
      { exDate: "2026-02-19", amount: 6.226 },
      { exDate: "2025-11-13", amount: 6.2394 },
      { exDate: "2025-08-14", amount: 6.1942 },
      { exDate: "2025-05-15", amount: 5.8993 }
    ]
  },
  "UK:HSBA": {
    company: "HSBC Holdings",
    amount: 33.3016,
    qualificationDate: "2026-03-12",
    currency: "GBp",
    history: [
      { exDate: "2026-03-12", amount: 33.3016 },
      { exDate: "2025-11-06", amount: 7.5079 },
      { exDate: "2025-08-14", amount: 7.3562 },
      { exDate: "2025-05-08", amount: 7.3666997 }
    ]
  },
  "UK:ULVR": {
    company: "Unilever PLC",
    amount: 40.52,
    qualificationDate: "2026-02-26",
    currency: "GBp",
    history: [
      { exDate: "2026-02-26", amount: 40.52 },
      { exDate: "2025-11-06", amount: 44.190002 },
      { exDate: "2025-08-14", amount: 44.055 },
      { exDate: "2025-05-15", amount: 43.728798 }
    ]
  },
  "Canada:RY": {
    company: "Royal Bank of Canada",
    amount: 1.64,
    qualificationDate: "2026-04-23",
    history: [
      { exDate: "2026-04-23", amount: 1.64 },
      { exDate: "2026-01-26", amount: 1.64 },
      { exDate: "2025-10-27", amount: 1.54 },
      { exDate: "2025-07-24", amount: 1.54 }
    ]
  },
  "Canada:TD": {
    company: "Toronto-Dominion Bank",
    amount: 1.08,
    qualificationDate: "2026-04-09",
    history: [
      { exDate: "2026-04-09", amount: 1.08 },
      { exDate: "2026-01-09", amount: 1.08 },
      { exDate: "2025-10-10", amount: 1.05 },
      { exDate: "2025-07-10", amount: 1.05 }
    ]
  },
  "Canada:ENB": {
    company: "Enbridge",
    amount: 0.97,
    qualificationDate: "2026-02-17",
    history: [
      { exDate: "2026-02-17", amount: 0.97 },
      { exDate: "2025-11-14", amount: 0.943 },
      { exDate: "2025-08-15", amount: 0.943 },
      { exDate: "2025-05-15", amount: 0.943 }
    ]
  },
  "Europe:TTE": {
    company: "TotalEnergies",
    amount: 0.85,
    qualificationDate: "2026-03-31",
    history: [
      { exDate: "2026-03-31", amount: 0.85 },
      { exDate: "2025-12-31", amount: 0.85 },
      { exDate: "2025-10-01", amount: 0.85 },
      { exDate: "2025-06-19", amount: 0.85 }
    ]
  },
  "Asia:TM": {
    company: "Toyota Motor",
    amount: 50,
    qualificationDate: "2026-03-30",
    history: [
      { exDate: "2026-03-30", amount: 50 },
      { exDate: "2025-09-29", amount: 45 },
      { exDate: "2025-03-28", amount: 50 },
      { exDate: "2024-09-27", amount: 40 }
    ]
  },
  "Zimbabwe:DLTA": {
    company: "Delta Corporation Zimbabwe",
    sourceName: "StockAnalysis Zimbabwe dividend history",
    sourceUrl: "https://stockanalysis.com/quote/zmse/DLTA/dividend/",
    amount: 6.44921,
    currency: "US cents",
    qualificationDate: "2025-11-27",
    recordDate: "2025-11-28",
    paymentDate: "2025-12-11",
    history: [
      { exDate: "2025-11-27", recordDate: "2025-11-28", payDate: "2025-12-11", amount: 6.44921 },
      { exDate: "2025-06-05", recordDate: "2025-06-06", payDate: "2025-06-18", amount: 7.41871 },
      { exDate: "2024-11-27", recordDate: "2024-11-29", payDate: "2024-12-10", amount: 3.22585 },
      { exDate: "2024-05-29", recordDate: "2024-05-31", payDate: "2024-06-26", amount: 6.44921 }
    ]
  },
  "Zimbabwe:ECO": {
    company: "Econet Wireless Zimbabwe",
    sourceName: "StockAnalysis Zimbabwe dividend history",
    sourceUrl: "https://stockanalysis.com/quote/zmse/ECO/dividend/",
    amount: 1.9665,
    currency: "US cents",
    qualificationDate: "2026-03-19",
    recordDate: "2026-03-20",
    paymentDate: "2026-03-25",
    history: [
      { exDate: "2026-03-19", recordDate: "2026-03-20", payDate: "2026-03-25", amount: 1.9665 },
      { exDate: "2025-12-31", recordDate: "2026-01-02", payDate: "2026-01-07", amount: 1.93401 },
      { exDate: "2025-09-18", recordDate: "2025-09-19", payDate: "2025-09-24", amount: 1.93401 },
      { exDate: "2025-06-19", recordDate: "2025-06-20", payDate: "2025-06-25", amount: 2.03146 }
    ]
  },
  "Zimbabwe:CBZ": {
    company: "CBZ Holdings",
    sourceName: "StockAnalysis Zimbabwe dividend history",
    sourceUrl: "https://stockanalysis.com/quote/zmse/CBZ/dividend/",
    amount: 1.28934,
    currency: "US cents",
    qualificationDate: "2025-11-13",
    recordDate: "2025-11-14",
    paymentDate: "2025-11-21",
    history: [
      { exDate: "2025-11-13", recordDate: "2025-11-14", payDate: "2025-11-21", amount: 1.28934 },
      { exDate: "2025-05-08", recordDate: "2025-05-09", payDate: "2025-05-15", amount: 5.19235 },
      { exDate: "2024-07-17", recordDate: "2024-07-19", payDate: "2024-07-31", amount: 2.58118 },
      { exDate: "2023-10-18", recordDate: "2023-10-20", payDate: "2023-10-27", amount: 1.55421 }
    ]
  },
  "Zimbabwe:BAT": {
    company: "British American Tobacco Zimbabwe",
    sourceName: "StockAnalysis Zimbabwe dividend history",
    sourceUrl: "https://stockanalysis.com/quote/zmse/BAT/dividend/",
    amount: 67.72542,
    currency: "US cents",
    qualificationDate: "2025-10-23",
    recordDate: "2025-10-24",
    paymentDate: "2025-11-10",
    history: [
      { exDate: "2025-10-23", recordDate: "2025-10-24", payDate: "2025-11-10", amount: 67.72542 },
      { exDate: "2025-07-24", recordDate: "2025-07-25", payDate: "2025-08-28", amount: 64.49957 },
      { exDate: "2024-04-16", recordDate: "2024-04-19", payDate: "2024-05-31", amount: 1186.6991 },
      { exDate: "2023-04-26", recordDate: "2023-04-28", payDate: "2023-05-30", amount: 88.34989 }
    ]
  },
  "Zimbabwe:SIM": {
    company: "Simbisa Brands",
    sourceName: "Simbisa Brands investor relations",
    sourceUrl: "https://ir.simbisabrands.com/simbisa-brands-declares-an-interim-dividend-of-0934-us-cents-per-share/",
    amount: 0.934,
    currency: "US cents",
    qualificationDate: "2026-03-12",
    recordDate: "2026-03-13",
    paymentDate: "2026-03-20",
    history: [
      { exDate: "2026-03-12", recordDate: "2026-03-13", payDate: "2026-03-20", amount: 0.934, currency: "US cents" },
      { exDate: "2025-10-16", recordDate: "2025-10-17", payDate: "2025-11-07", amount: 0.453, currency: "US cents" },
      { exDate: "2024-10-16", recordDate: "2024-10-18", payDate: "2024-11-07", amount: 0.392, currency: "US cents" },
      { exDate: "2023-11-08", recordDate: "2023-11-10", payDate: "2023-11-16", amount: 0.433, currency: "US cents" }
    ]
  }
};
