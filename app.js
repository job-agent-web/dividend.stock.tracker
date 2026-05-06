const dividendUniverseLimit = 5000;

const stocks = [
  {
    market: "Nigeria",
    category: "Telecoms",
    ticker: "MTNN",
    name: "MTN Nigeria",
    currency: "NGN",
    price: 255.4,
    dividendYield: 6.2,
    payoutRatio: 63,
    divGrowth: 9,
    safety: 82,
    valuation: "Fair",
    signal: "Buy",
    exDate: "2026-08-12",
    recordDate: "2026-08-15",
    payDate: "2026-09-06",
    history: [198, 204, 212, 218, 221, 230, 237, 244, 240, 248, 253, 255],
    platforms: [
      ["Bamboo", "Nigerian equities access where available; verify current ticker coverage."],
      ["InvestNaija", "Useful for NGX exposure and local-currency funding."],
      ["Trove", "Can support Nigerian and global assets depending on account status."]
    ],
    reasons: [
      "Telecom cash generation is defensive and supports recurring dividend capacity.",
      "Yield is above many cash alternatives while payout ratio is not stretched for the sector.",
      "Buy on pullbacks near support or after dividend confirmation; sell if FX debt costs or regulatory charges materially pressure free cash flow."
    ]
  },
  {
    market: "Nigeria",
    category: "Banks",
    ticker: "GTCO",
    name: "Guaranty Trust Holding Company",
    currency: "NGN",
    price: 58.2,
    dividendYield: 8.4,
    payoutRatio: 38,
    divGrowth: 7,
    safety: 78,
    valuation: "Cheap",
    signal: "Buy",
    exDate: "2026-07-18",
    recordDate: "2026-07-22",
    payDate: "2026-08-09",
    history: [39, 42, 45, 47, 49, 52, 55, 53, 56, 57, 59, 58],
    platforms: [
      ["Bamboo", "Check NGX availability and fees before trading."],
      ["InvestNaija", "Good fit for local Nigerian dividend names."],
      ["Chaka", "May support local and foreign securities with NGN funding routes."]
    ],
    reasons: [
      "Strong capital base and high return profile give dividends room even through cycles.",
      "Low payout ratio leaves a margin of safety if earnings normalize.",
      "Sell or reduce if non-performing loans spike or dividend cover falls below 1.5x."
    ]
  },
  {
    market: "Nigeria",
    category: "Banks",
    ticker: "ZENITHBANK",
    name: "Zenith Bank",
    currency: "NGN",
    price: 45.7,
    dividendYield: 10.1,
    payoutRatio: 42,
    divGrowth: 6,
    safety: 76,
    valuation: "Cheap",
    signal: "Buy",
    exDate: "2026-05-14",
    recordDate: "2026-05-17",
    payDate: "2026-06-03",
    history: [31, 34, 36, 38, 40, 41, 44, 43, 45, 47, 46, 46],
    platforms: [
      ["InvestNaija", "Suitable for NGX dividend portfolios."],
      ["Bamboo", "Confirm if direct NGX trading is enabled for your account."],
      ["Trove", "Check live supported assets list."]
    ],
    reasons: [
      "Double-digit yield with solid dividend cover is attractive for income investors.",
      "Bank earnings are helped by higher rates, though credit-cycle risk must be watched.",
      "Take profit or hold off new buying after sharp rallies if yield compresses below 6%."
    ]
  },
  {
    market: "Nigeria",
    category: "Energy",
    ticker: "SEPLAT",
    name: "Seplat Energy",
    currency: "NGN",
    price: 3180,
    dividendYield: 5.1,
    payoutRatio: 55,
    divGrowth: 4,
    safety: 66,
    valuation: "Fair",
    signal: "Hold",
    exDate: "2026-11-06",
    recordDate: "2026-11-10",
    payDate: "2026-12-01",
    history: [2500, 2620, 2750, 2890, 3040, 2980, 3100, 3220, 3160, 3240, 3190, 3180],
    platforms: [
      ["Bamboo", "Verify local energy stock support and settlement terms."],
      ["InvestNaija", "Use local NGX access for NGN dividends where available."],
      ["Chaka", "Check asset availability before funding."]
    ],
    reasons: [
      "Dividend is useful, but commodity prices can swing cash flow quickly.",
      "Current price already reflects part of the energy recovery.",
      "Buy only after oil-price weakness creates a better yield; sell if production disruption or debt rises."
    ]
  },
  {
    market: "Nigeria",
    category: "Environmental Services",
    ticker: "TIP",
    name: "The Initiates Plc",
    currency: "NGN",
    price: 30.6,
    marketCap: 27233000000,
    annualDividend: 0.3,
    dividendYield: 1.0,
    payoutRatio: 8,
    divGrowth: 88,
    safety: 72,
    valuation: "Fair",
    signal: "Hold",
    exDate: "2026-04-08",
    recordDate: "2026-04-07",
    payDate: "2026-05-04",
    history: [4.25, 5.2, 7.1, 9.4, 12.8, 15.6, 18.4, 19.9, 21.7, 24.6, 27.85, 30.6],
    verifiedDividendHistory: [
      { exDate: "2026-04-08", recordDate: "2026-04-07", payDate: "2026-05-04", amount: 0.3 },
      { exDate: "2025-04-07", recordDate: "2025-04-04", payDate: "2025-04-28", amount: 0.1 },
      { exDate: "2024-07-08", recordDate: "2024-07-05", payDate: "2024-07-26", amount: 0.06 }
    ],
    dividendDataStatus: "StockAnalysis/NGX disclosure check: recent dividend history and 2026 payment date verified.",
    dividendDataNote: "The latest listed final dividend is NGN 0.30 per share with payment dated 04 May 2026; confirm new declarations with NGX/company announcements before trading.",
    platforms: [
      ["InvestNaija", "Useful for NGX dividend shares and local-currency funding."],
      ["Bamboo", "Confirm current NGX ticker availability and trading fees."],
      ["Chaka", "Check local-market access before funding."]
    ],
    reasons: [
      "The Initiates Plc provides waste management, industrial cleaning, recycling, and decontamination services, giving it a distinct industrial-services niche on NGX.",
      "The 2026 dividend history is positive, but the current yield is modest, so it fits better as a growth-plus-income watchlist stock than a high-yield income stock.",
      "Buy only after confirming fresh earnings momentum and liquidity; reduce if profit growth slows sharply or the dividend is not sustained."
    ]
  },
  {
    market: "US",
    category: "Dividend Aristocrats",
    ticker: "KO",
    name: "Coca-Cola",
    currency: "USD",
    price: 62.8,
    dividendYield: 3.1,
    payoutRatio: 68,
    divGrowth: 5,
    safety: 84,
    valuation: "Fair",
    signal: "Hold",
    exDate: "2026-06-13",
    recordDate: "2026-06-14",
    payDate: "2026-07-01",
    history: [58, 59, 60, 61, 60, 62, 63, 64, 63, 62, 63, 63],
    platforms: [
      ["Bamboo", "Common route for Nigerians buying US stocks; expect FX and withholding-tax considerations."],
      ["Chaka", "Supports US equities for Nigerian residents where account checks pass."],
      ["Trove", "US fractional shares may be available; confirm dividend handling."]
    ],
    reasons: [
      "Durable consumer brand and long dividend history make it a quality income holding.",
      "Payout ratio is acceptable but leaves less room than faster-growing dividend names.",
      "Buy on weakness when yield improves; sell only if earnings quality weakens or valuation becomes excessive."
    ]
  },
  {
    market: "US",
    category: "REITs",
    ticker: "O",
    name: "Realty Income",
    currency: "USD",
    price: 55.4,
    dividendYield: 5.7,
    payoutRatio: 74,
    divGrowth: 3,
    safety: 71,
    valuation: "Cheap",
    signal: "Buy",
    exDate: "2026-05-31",
    recordDate: "2026-06-01",
    payDate: "2026-06-15",
    history: [49, 51, 52, 50, 53, 54, 55, 57, 56, 55, 56, 55],
    platforms: [
      ["Bamboo", "US REIT dividends may have withholding tax; compare fees."],
      ["Chaka", "Check US REIT availability and dividend payment process."],
      ["Risevest", "May offer US real-estate or stock products, but confirm direct-stock availability."]
    ],
    reasons: [
      "Monthly dividend profile is attractive for income planning.",
      "Higher yield suggests valuation is not demanding if rates stabilize.",
      "Sell or avoid if debt costs keep rising faster than rental growth."
    ]
  },
  {
    market: "US",
    category: "Healthcare",
    ticker: "JNJ",
    name: "Johnson & Johnson",
    currency: "USD",
    price: 151.6,
    dividendYield: 3.3,
    payoutRatio: 49,
    divGrowth: 6,
    safety: 88,
    valuation: "Fair",
    signal: "Buy",
    exDate: "2026-08-25",
    recordDate: "2026-08-26",
    payDate: "2026-09-10",
    history: [144, 146, 149, 150, 148, 151, 153, 152, 150, 151, 152, 152],
    platforms: [
      ["Bamboo", "Simple route for Nigerian investors seeking US dividend stocks."],
      ["Chaka", "Compare FX spread, custody, and withdrawal fees."],
      ["Trove", "Confirm fractional share and dividend reinvestment options."]
    ],
    reasons: [
      "Healthcare demand and balance-sheet quality support dividend resilience.",
      "Moderate payout ratio gives space for dividend growth.",
      "Sell if litigation or pipeline setbacks permanently reduce cash generation."
    ]
  },
  {
    market: "UK",
    category: "Energy",
    ticker: "SHEL",
    name: "Shell",
    currency: "GBP",
    price: 27.9,
    dividendYield: 4.0,
    payoutRatio: 34,
    divGrowth: 5,
    safety: 73,
    valuation: "Fair",
    signal: "Hold",
    exDate: "2026-05-15",
    recordDate: "2026-05-16",
    payDate: "2026-06-23",
    history: [24.2, 25.1, 25.8, 26.4, 27.0, 27.6, 28.1, 27.4, 27.8, 28.2, 27.7, 27.9],
    platforms: [
      ["Trading 212", "Popular UK route for dividend shares; confirm dealing spread and available order types."],
      ["Freetrade", "Check platform pricing, dividend handling, and reinvestment options."],
      ["Hargreaves Lansdown", "Broad UK coverage; compare dealing fees for portfolio size."]
    ],
    reasons: [
      "Low payout ratio protects the dividend through commodity cycles.",
      "Energy exposure adds volatility, so do not chase after strong oil-led rallies.",
      "Buy below fair value or when yield expands; sell if capex or debt crowds out shareholder returns."
    ]
  },
  {
    market: "UK",
    category: "Consumer Staples",
    ticker: "ULVR",
    name: "Unilever",
    currency: "GBP",
    price: 41.3,
    dividendYield: 3.6,
    payoutRatio: 61,
    divGrowth: 4,
    safety: 81,
    valuation: "Fair",
    signal: "Buy",
    exDate: "2026-08-08",
    recordDate: "2026-08-09",
    payDate: "2026-09-12",
    history: [37.8, 38.4, 39.1, 39.6, 40.0, 40.8, 41.2, 40.7, 41.0, 41.4, 41.1, 41.3],
    platforms: [
      ["Trading 212", "Low-friction UK route; confirm spread and execution quality."],
      ["AJ Bell", "Good for long-term dividend portfolios; compare custody charges."],
      ["Interactive Investor", "Flat-fee model can suit larger portfolios."]
    ],
    reasons: [
      "Global brands and defensive demand support reliable dividends.",
      "Yield plus steady growth can work well in a long-term UK income portfolio.",
      "Sell if margin recovery stalls and dividend growth falls below inflation for several years."
    ]
  },
  {
    market: "UK",
    category: "Financials",
    ticker: "LGEN",
    name: "Legal & General",
    currency: "GBP",
    price: 2.42,
    dividendYield: 8.2,
    payoutRatio: 72,
    divGrowth: 3,
    safety: 62,
    valuation: "Cheap",
    signal: "Hold",
    exDate: "2026-04-24",
    recordDate: "2026-04-25",
    payDate: "2026-06-05",
    history: [2.18, 2.24, 2.31, 2.29, 2.35, 2.38, 2.45, 2.41, 2.39, 2.44, 2.46, 2.42],
    platforms: [
      ["Freetrade", "Wide UK access with a simple app experience for dividend investors."],
      ["Hargreaves Lansdown", "Wide UK market access with research tools."],
      ["AJ Bell", "Compare dealing cost if buying regularly."]
    ],
    reasons: [
      "High yield is attractive but also signals market concern about sustainability.",
      "Payout ratio is elevated, so dividend cover needs monitoring.",
      "Buy only when comfortable with insurer balance-sheet risk; sell if the dividend is cut or solvency weakens."
    ]
  },
  {
    market: "UK",
    category: "Banks",
    ticker: "HSBA",
    name: "HSBC Holdings",
    currency: "GBP",
    price: 7.18,
    dividendYield: 6.6,
    payoutRatio: 51,
    divGrowth: 6,
    safety: 74,
    valuation: "Cheap",
    signal: "Buy",
    exDate: "2026-08-14",
    recordDate: "2026-08-15",
    payDate: "2026-09-26",
    history: [5.9, 6.1, 6.3, 6.5, 6.7, 6.9, 7.0, 7.2, 7.1, 7.3, 7.2, 7.18],
    platforms: [
      ["Trading 212", "Easy access to UK-listed dividend shares; compare pricing and execution quality."],
      ["Interactive Investor", "Flat monthly pricing may suit larger dividend portfolios."],
      ["Hargreaves Lansdown", "Strong UK share coverage; watch dealing fees."]
    ],
    reasons: [
      "Dividend yield is strong and payout ratio is reasonable for a bank.",
      "Asia exposure and buybacks can support total return if credit conditions remain stable.",
      "Sell if rate cuts compress margins faster than costs fall or credit losses rise materially."
    ]
  }
];

const moreDividendStocks = [
  ["Nigeria", "Telecoms", "AIRTELAFRI", "Airtel Africa", "NGN", 2195, 3.4, 54, 7, 70, "Fair"],
  ["Nigeria", "Cement", "DANGCEM", "Dangote Cement", "NGN", 591, 5.1, 48, 8, 79, "Fair"],
  ["Nigeria", "Cement", "WAPCO", "Lafarge Africa", "NGN", 72, 4.2, 36, 6, 72, "Fair"],
  ["Nigeria", "Consumer Staples", "BUAFOODS", "BUA Foods", "NGN", 415, 3.8, 58, 9, 74, "Fair"],
  ["Nigeria", "Consumer Staples", "NESTLE", "Nestle Nigeria", "NGN", 1220, 2.8, 68, 3, 68, "Hold"],
  ["Nigeria", "Consumer Staples", "FLOURMILL", "Flour Mills of Nigeria", "NGN", 58, 4.4, 42, 5, 67, "Fair"],
  ["Nigeria", "Consumer Staples", "DANGSUGAR", "Dangote Sugar Refinery", "NGN", 52, 4.1, 46, 4, 64, "Fair"],
  ["Nigeria", "Consumer Staples", "NASCON", "NASCON Allied Industries", "NGN", 63, 3.9, 44, 5, 62, "Fair"],
  ["Nigeria", "Consumer Staples", "CADBURY", "Cadbury Nigeria", "NGN", 31, 2.5, 52, 2, 56, "Hold"],
  ["Nigeria", "Consumer Staples", "UACN", "UAC of Nigeria", "NGN", 24, 3.2, 39, 4, 60, "Fair"],
  ["Nigeria", "Consumer Staples", "UNILEVER", "Unilever Nigeria", "NGN", 72, 3.1, 55, 3, 62, "Fair"],
  ["Nigeria", "Brewers", "NB", "Nigerian Breweries", "NGN", 39, 2.1, 75, 1, 45, "Expensive"],
  ["Nigeria", "Brewers", "GUINNESS", "Guinness Nigeria", "NGN", 64, 2.9, 61, 2, 53, "Fair"],
  ["Nigeria", "Agriculture", "PRESCO", "Presco", "NGN", 812, 5.6, 41, 10, 76, "Fair"],
  ["Nigeria", "Agriculture", "OKOMUOIL", "Okomu Oil Palm", "NGN", 522, 5.2, 43, 8, 73, "Fair"],
  ["Nigeria", "Energy", "TOTAL", "TotalEnergies Marketing Nigeria", "NGN", 674, 6.8, 47, 6, 72, "Cheap"],
  ["Nigeria", "Energy", "CONOIL", "Conoil", "NGN", 142, 4.7, 40, 5, 63, "Fair"],
  ["Nigeria", "Energy", "OANDO", "Oando", "NGN", 16, 1.4, 29, 0, 39, "Expensive"],
  ["Nigeria", "Financials", "UCAP", "United Capital", "NGN", 16, 6.1, 51, -2, 68, "Cheap"],
  ["Nigeria", "Financials", "NGXGROUP", "Nigerian Exchange Group", "NGN", 166, 1.3, 77, 12, 54, "Fair"],
  ["Nigeria", "Financials", "CUSTODIAN", "Custodian Investment", "NGN", 20.8, 6.2, 42, 6, 68, "Cheap"],
  ["Nigeria", "Banks", "UBA", "United Bank for Africa", "NGN", 34, 9.2, 35, 8, 75, "Cheap"],
  ["Nigeria", "Banks", "ACCESSCORP", "Access Holdings", "NGN", 22, 8.8, 37, 7, 70, "Cheap"],
  ["Nigeria", "Banks", "FBNH", "FBN Holdings", "NGN", 31, 6.4, 34, 6, 65, "Cheap"],
  ["Nigeria", "Banks", "STANBIC", "Stanbic IBTC Holdings", "NGN", 71, 6.7, 43, 6, 74, "Fair"],
  ["Nigeria", "Banks", "FIDELITYBK", "Fidelity Bank", "NGN", 12, 7.6, 32, 7, 67, "Cheap"],
  ["Nigeria", "Insurance", "AIICO", "AIICO Insurance", "NGN", 1.4, 5.4, 45, 3, 54, "Fair"],
  ["Nigeria", "Healthcare", "FIDSON", "Fidson Healthcare", "NGN", 18.5, 3.7, 43, 5, 63, "Fair"],
  ["Nigeria", "Aviation Services", "NAHCO", "Nigerian Aviation Handling Company", "NGN", 63, 5.5, 50, 8, 68, "Fair"],
  ["Nigeria", "Industrial", "BETAGLAS", "Beta Glass", "NGN", 98, 3.5, 38, 5, 62, "Fair"],
  ["US", "Technology", "AAPL", "Apple", "USD", 184, 0.5, 15, 5, 86, "Fair"],
  ["US", "Technology", "MSFT", "Microsoft", "USD", 417, 0.8, 25, 9, 91, "Fair"],
  ["US", "Technology", "AVGO", "Broadcom", "USD", 1320, 1.7, 49, 12, 82, "Fair"],
  ["US", "Technology", "TXN", "Texas Instruments", "USD", 171, 3.1, 68, 5, 77, "Fair"],
  ["US", "Technology", "CSCO", "Cisco Systems", "USD", 49, 3.2, 47, 3, 75, "Fair"],
  ["US", "Technology", "QCOM", "Qualcomm", "USD", 169, 2.0, 38, 6, 78, "Fair"],
  ["US", "Energy", "XOM", "Exxon Mobil", "USD", 119, 3.3, 43, 4, 80, "Fair"],
  ["US", "Energy", "CVX", "Chevron", "USD", 161, 4.0, 52, 5, 79, "Fair"],
  ["US", "Consumer Staples", "PG", "Procter & Gamble", "USD", 164, 2.4, 61, 5, 87, "Fair"],
  ["US", "Consumer Staples", "PEP", "PepsiCo", "USD", 173, 3.0, 66, 6, 83, "Fair"],
  ["US", "Consumer Staples", "WMT", "Walmart", "USD", 61, 1.4, 35, 4, 82, "Fair"],
  ["US", "Consumer Staples", "CL", "Colgate-Palmolive", "USD", 91, 2.2, 58, 4, 80, "Fair"],
  ["US", "Consumer Staples", "KMB", "Kimberly-Clark", "USD", 128, 3.8, 71, 2, 69, "Fair"],
  ["US", "Consumer Staples", "GIS", "General Mills", "USD", 66, 3.6, 55, 3, 72, "Fair"],
  ["US", "Restaurants", "MCD", "McDonald's", "USD", 288, 2.3, 57, 7, 82, "Fair"],
  ["US", "Retail", "HD", "Home Depot", "USD", 352, 2.5, 54, 6, 79, "Fair"],
  ["US", "Retail", "LOW", "Lowe's", "USD", 232, 2.0, 38, 10, 78, "Fair"],
  ["US", "Retail", "TGT", "Target", "USD", 143, 3.1, 50, 3, 67, "Cheap"],
  ["US", "Healthcare", "ABBV", "AbbVie", "USD", 178, 3.5, 53, 6, 80, "Fair"],
  ["US", "Healthcare", "MRK", "Merck", "USD", 126, 2.5, 44, 6, 82, "Fair"],
  ["US", "Healthcare", "PFE", "Pfizer", "USD", 28, 6.0, 79, 1, 55, "Cheap"],
  ["US", "Telecoms", "T", "AT&T", "USD", 17, 6.3, 47, 1, 59, "Cheap"],
  ["US", "Telecoms", "VZ", "Verizon", "USD", 41, 6.5, 58, 2, 64, "Cheap"],
  ["US", "Industrials", "IBM", "IBM", "USD", 185, 3.6, 65, 2, 69, "Fair"],
  ["US", "Industrials", "MMM", "3M", "USD", 92, 6.4, 82, 0, 48, "Expensive"],
  ["US", "Industrials", "CAT", "Caterpillar", "USD", 347, 1.6, 28, 8, 78, "Fair"],
  ["US", "Industrials", "DE", "Deere", "USD", 389, 1.5, 23, 9, 77, "Fair"],
  ["US", "Financials", "JPM", "JPMorgan Chase", "USD", 196, 2.3, 31, 6, 84, "Fair"],
  ["US", "Financials", "BAC", "Bank of America", "USD", 38, 2.8, 34, 5, 72, "Fair"],
  ["US", "Financials", "WFC", "Wells Fargo", "USD", 57, 2.5, 32, 6, 70, "Fair"],
  ["US", "Financials", "BLK", "BlackRock", "USD", 812, 2.6, 51, 7, 81, "Fair"],
  ["US", "REITs", "SPG", "Simon Property Group", "USD", 149, 5.2, 66, 4, 69, "Fair"],
  ["US", "REITs", "DLR", "Digital Realty Trust", "USD", 145, 3.4, 72, 4, 68, "Fair"],
  ["US", "REITs", "AMT", "American Tower", "USD", 195, 3.3, 67, 5, 72, "Fair"],
  ["US", "Utilities", "NEE", "NextEra Energy", "USD", 64, 3.1, 59, 7, 76, "Fair"],
  ["US", "Utilities", "SO", "Southern Company", "USD", 72, 4.0, 69, 3, 74, "Fair"],
  ["US", "Utilities", "DUK", "Duke Energy", "USD", 98, 4.2, 72, 2, 71, "Fair"],
  ["UK", "Energy", "BP", "BP", "GBP", 4.92, 4.7, 39, 4, 70, "Fair"],
  ["UK", "Healthcare", "GSK", "GSK", "GBP", 16.4, 3.8, 58, 4, 77, "Fair"],
  ["UK", "Healthcare", "AZN", "AstraZeneca", "GBP", 118.3, 2.0, 47, 6, 83, "Fair"],
  ["UK", "Consumer Staples", "DGE", "Diageo", "GBP", 28.7, 3.2, 61, 3, 76, "Fair"],
  ["UK", "Consumer Staples", "TSCO", "Tesco", "GBP", 3.05, 4.1, 52, 4, 73, "Fair"],
  ["UK", "Consumer Staples", "SBRY", "Sainsbury's", "GBP", 2.58, 4.8, 57, 2, 64, "Fair"],
  ["UK", "Tobacco", "BATS", "British American Tobacco", "GBP", 24.9, 9.4, 64, 2, 63, "Cheap"],
  ["UK", "Tobacco", "IMB", "Imperial Brands", "GBP", 18.7, 8.0, 59, 2, 64, "Cheap"],
  ["UK", "Mining", "RIO", "Rio Tinto", "GBP", 53.8, 6.2, 62, 1, 67, "Fair"],
  ["UK", "Mining", "BHP", "BHP Group", "GBP", 22.4, 5.8, 60, 1, 66, "Fair"],
  ["UK", "Mining", "GLEN", "Glencore", "GBP", 4.36, 5.0, 55, 1, 60, "Fair"],
  ["UK", "Utilities", "NG", "National Grid", "GBP", 10.4, 5.5, 70, 3, 73, "Fair"],
  ["UK", "Utilities", "SSE", "SSE", "GBP", 17.1, 4.2, 62, 4, 72, "Fair"],
  ["UK", "Utilities", "UU", "United Utilities", "GBP", 10.5, 4.5, 68, 3, 70, "Fair"],
  ["UK", "Utilities", "SVT", "Severn Trent", "GBP", 25.2, 4.4, 69, 3, 70, "Fair"],
  ["UK", "Insurance", "AV", "Aviva", "GBP", 4.82, 7.1, 54, 5, 72, "Cheap"],
  ["UK", "Insurance", "MNG", "M&G", "GBP", 2.08, 9.6, 76, 1, 55, "Cheap"],
  ["UK", "Insurance", "PHNX", "Phoenix Group", "GBP", 5.12, 10.2, 82, 1, 50, "Cheap"],
  ["UK", "Banks", "LLOY", "Lloyds Banking Group", "GBP", 0.52, 5.9, 44, 5, 68, "Cheap"],
  ["UK", "Banks", "BARC", "Barclays", "GBP", 1.92, 4.8, 36, 6, 67, "Cheap"],
  ["UK", "Banks", "NWG", "NatWest Group", "GBP", 2.74, 6.4, 42, 5, 70, "Cheap"],
  ["UK", "Telecoms", "VOD", "Vodafone", "GBP", 0.72, 10.7, 88, -2, 39, "Expensive"],
  ["UK", "Telecoms", "BT.A", "BT Group", "GBP", 1.28, 5.8, 59, 1, 57, "Fair"],
  ["UK", "Financials", "LSEG", "London Stock Exchange Group", "GBP", 92.5, 1.6, 37, 8, 82, "Fair"],
  ["UK", "Real Estate", "LAND", "Land Securities", "GBP", 6.2, 6.1, 71, 1, 59, "Cheap"],
  ["UK", "Real Estate", "BLND", "British Land", "GBP", 3.9, 5.9, 69, 1, 57, "Cheap"],
  ["UK", "Consumer Healthcare", "SN", "Smith & Nephew", "GBP", 11.1, 3.0, 52, 3, 67, "Fair"],
  ["UK", "Consumer Staples", "RKT", "Reckitt Benckiser", "GBP", 55.2, 3.4, 61, 4, 76, "Fair"],
  ["UK", "Utilities", "CNA", "Centrica", "GBP", 1.39, 3.8, 36, 6, 65, "Fair"]
];

const extraPlatformDividendStocks = [
  ["Canada", "Banks", "RY", "Royal Bank of Canada", "CAD", 176, 3.7, 45, 12, 84, "Fair"],
  ["Canada", "Banks", "TD", "Toronto-Dominion Bank", "CAD", 105, 4.1, 35, 10, 78, "Fair"],
  ["Canada", "Banks", "BNS", "Bank of Nova Scotia", "CAD", 73, 6.0, 56, 9, 74, "Cheap"],
  ["Canada", "Banks", "BMO", "Bank of Montreal", "CAD", 136, 4.8, 47, 10, 76, "Fair"],
  ["Canada", "Energy", "ENB", "Enbridge", "CAD", 52, 6.5, 88, 5, 66, "Fair"],
  ["Canada", "Energy", "CNQ", "Canadian Natural Resources", "CAD", 45, 4.3, 44, 8, 78, "Fair"],
  ["Canada", "Utilities", "FTS", "Fortis", "CAD", 58, 4.1, 73, 7, 77, "Fair"],
  ["Canada", "Insurance", "MFC", "Manulife Financial", "CAD", 41, 4.0, 39, 8, 74, "Fair"],
  ["Canada", "Insurance", "SLF", "Sun Life Financial", "CAD", 78, 4.3, 47, 7, 76, "Fair"],
  ["Europe", "Healthcare", "NVS", "Novartis", "CHF", 94, 2.2, 58, 5, 82, "Fair"],
  ["Europe", "Technology", "SAP", "SAP", "EUR", 168, 1.5, 44, 6, 78, "Fair"],
  ["Europe", "Energy", "TTE", "TotalEnergies", "EUR", 68, 4.3, 69, 2, 72, "Fair"],
  ["Europe", "Financials", "SAN", "Banco Santander", "EUR", 4.4, 3.8, 42, 4, 68, "Fair"],
  ["Europe", "Financials", "UBS", "UBS Group", "CHF", 28, 2.6, 49, 3, 70, "Fair"],
  ["Asia", "Autos", "TM", "Toyota Motor", "JPY", 2950, 2.4, 31, 4, 76, "Fair"],
  ["Asia", "Financials", "MUFG", "Mitsubishi UFJ Financial Group", "JPY", 1700, 2.3, 38, 5, 72, "Fair"],
  ["Asia", "Technology", "TSM", "Taiwan Semiconductor Manufacturing", "USD", 175, 1.6, 36, 9, 86, "Fair"],
  ["Asia", "Financials", "HDB", "HDFC Bank", "USD", 59, 1.4, 33, 5, 70, "Fair"],
  ["Zimbabwe", "Consumer Staples", "DLTA", "Delta Corporation Zimbabwe", "ZWL", 520, 4.8, 45, 5, 66, "Fair"],
  ["Zimbabwe", "Telecoms", "ECO", "Econet Wireless Zimbabwe", "ZWL", 180, 3.2, 50, 4, 58, "Fair"],
  ["Zimbabwe", "Banks", "CBZ", "CBZ Holdings", "ZWL", 230, 5.1, 42, 5, 62, "Fair"],
  ["Zimbabwe", "Consumer Staples", "INN", "Innscor Africa", "ZWL", 380, 4.0, 48, 4, 64, "Fair"],
  ["Zimbabwe", "Restaurants", "SIM", "Simbisa Brands", "ZWL", 310, 3.4, 44, 5, 61, "Fair"],
  ["Zimbabwe", "Tobacco", "BAT", "British American Tobacco Zimbabwe", "ZWL", 900, 6.5, 62, 2, 59, "Fair"]
];

const highProfileDividendStocks = [
  ["US", "Financial Services", "JPM", "JPMorgan Chase", "USD", 196, 2.3, 31, 6, 84, "Fair"],
  ["US", "Consumer Defensive", "PG", "Procter & Gamble", "USD", 164, 2.9, 62, 22, 87, "Fair"],
  ["US", "Consumer Defensive", "KO", "Coca-Cola", "USD", 79, 2.7, 67, 10, 84, "Fair"],
  ["US", "Consumer Defensive", "PEP", "PepsiCo", "USD", 155, 3.7, 89, 8, 76, "Fair"],
  ["US", "Energy", "XOM", "Exxon Mobil", "USD", 119, 3.3, 43, 4, 80, "Fair"],
  ["US", "Energy", "CVX", "Chevron", "USD", 192, 3.6, 74, 20, 77, "Fair"],
  ["US", "Healthcare", "JNJ", "Johnson & Johnson", "USD", 151, 3.3, 49, 12, 88, "Fair"],
  ["US", "Healthcare", "ABBV", "AbbVie", "USD", 205, 3.3, 75, 12, 80, "Fair"],
  ["US", "Communication Services", "VZ", "Verizon Communications", "USD", 46, 6.0, 67, 21, 64, "Cheap"],
  ["UK", "Energy", "SHEL", "Shell", "GBP", 27.9, 4.0, 34, 5, 73, "Fair"],
  ["UK", "Energy", "BP", "BP", "GBP", 4.92, 4.7, 39, 4, 70, "Fair"],
  ["UK", "Banks", "HSBA", "HSBC Holdings", "GBP", 7.18, 6.6, 51, 6, 74, "Cheap"],
  ["UK", "Consumer Staples", "ULVR", "Unilever", "GBP", 41.3, 3.6, 61, 4, 81, "Fair"],
  ["UK", "Healthcare", "GSK", "GSK", "GBP", 16.4, 3.8, 58, 4, 77, "Fair"],
  ["UK", "Healthcare", "AZN", "AstraZeneca", "GBP", 118.3, 2.0, 47, 6, 83, "Fair"],
  ["UK", "Utilities", "NG", "National Grid", "GBP", 10.4, 5.5, 70, 3, 73, "Fair"],
  ["UK", "Asset Management", "EMG", "Man Group", "GBP", 2.35, 7.9, 58, 5, 67, "Cheap"],
  ["UK", "Asset Management", "SDR", "Schroders", "GBP", 3.65, 5.7, 63, 4, 71, "Fair"],
  ["UK", "Financials", "INVP", "Investec Group", "GBP", 6.05, 5.4, 45, 7, 72, "Fair"],
  ["UK", "Insurance", "ADM", "Admiral Group", "GBP", 27.8, 4.9, 71, 5, 73, "Fair"],
  ["UK", "Insurance", "LGEN", "Legal & General", "GBP", 2.36, 8.3, 67, 4, 70, "Cheap"],
  ["UK", "Insurance", "PRU", "Prudential", "GBP", 7.45, 2.4, 38, 5, 68, "Fair"],
  ["UK", "Financials", "STJ", "St. James's Place", "GBP", 6.95, 4.7, 59, 2, 58, "Fair"],
  ["UK", "Real Estate", "LMP", "LondonMetric Property", "GBP", 1.92, 5.1, 68, 4, 67, "Fair"],
  ["UK", "Real Estate", "SGRO", "SEGRO", "GBP", 8.35, 3.5, 61, 5, 74, "Fair"],
  ["UK", "Industrials", "BUNZL", "Bunzl", "GBP", 33.6, 2.2, 54, 6, 80, "Fair"],
  ["UK", "Industrials", "HLMA", "Halma", "GBP", 22.4, 1.1, 38, 7, 82, "Fair"],
  ["UK", "Information Services", "REL", "RELX", "GBP", 34.8, 1.7, 55, 8, 84, "Fair"],
  ["UK", "Consumer Staples", "ABF", "Associated British Foods", "GBP", 24.2, 2.8, 41, 6, 75, "Fair"],
  ["UK", "Consumer Staples", "SMIN", "Smiths Group", "GBP", 17.5, 2.6, 49, 5, 73, "Fair"],
  ["UK", "Consumer Staples", "CPG", "Compass Group", "GBP", 22.3, 2.1, 50, 7, 78, "Fair"],
  ["UK", "Homebuilders", "PSN", "Persimmon", "GBP", 13.1, 4.5, 52, 2, 60, "Fair"],
  ["UK", "Homebuilders", "TW", "Taylor Wimpey", "GBP", 1.42, 6.0, 66, 2, 58, "Cheap"],
  ["UK", "Homebuilders", "BDEV", "Barratt Developments", "GBP", 4.75, 4.8, 59, 2, 60, "Fair"],
  ["UK", "Financials", "III", "3i Group", "GBP", 30.2, 1.8, 35, 8, 78, "Fair"],
  ["UK", "Infrastructure", "HICL", "HICL Infrastructure", "GBP", 1.25, 6.8, 78, 2, 62, "Cheap"],
  ["Canada", "Banks", "RY", "Royal Bank of Canada", "CAD", 176, 3.7, 45, 12, 84, "Fair"],
  ["Canada", "Banks", "TD", "Toronto-Dominion Bank", "CAD", 105, 4.1, 35, 10, 78, "Fair"],
  ["Canada", "Banks", "BNS", "Bank of Nova Scotia", "CAD", 73, 6.0, 56, 9, 74, "Cheap"],
  ["Canada", "Energy", "ENB", "Enbridge", "CAD", 52, 6.5, 88, 5, 66, "Fair"],
  ["Canada", "Energy", "CNQ", "Canadian Natural Resources", "CAD", 45, 4.3, 44, 8, 78, "Fair"],
  ["Canada", "Utilities", "FTS", "Fortis", "CAD", 58, 4.1, 73, 7, 77, "Fair"],
  ["Canada", "Insurance", "MFC", "Manulife Financial", "CAD", 41, 4.0, 39, 8, 74, "Fair"],
  ["Canada", "Banks", "BMO", "Bank of Montreal", "CAD", 136, 4.8, 47, 10, 76, "Fair"],
  ["Canada", "Banks", "CM", "Canadian Imperial Bank of Commerce", "CAD", 67, 5.1, 49, 9, 74, "Cheap"],
  ["Canada", "Banks", "NA", "National Bank of Canada", "CAD", 116, 3.7, 42, 10, 78, "Fair"],
  ["Canada", "Insurance", "SLF", "Sun Life Financial", "CAD", 78, 4.3, 47, 7, 76, "Fair"],
  ["Canada", "Financials", "POW", "Power Corporation of Canada", "CAD", 43, 5.2, 52, 6, 72, "Fair"],
  ["Canada", "Pipelines", "TRP", "TC Energy", "CAD", 54, 6.5, 70, 4, 70, "Fair"],
  ["Canada", "Telecoms", "T", "TELUS", "CAD", 23, 6.2, 85, 6, 62, "Cheap"],
  ["Canada", "Telecoms", "BCE", "BCE", "CAD", 45, 7.5, 95, 2, 54, "Cheap"],
  ["Canada", "Utilities", "EMA", "Emera", "CAD", 49, 5.9, 79, 4, 66, "Fair"],
  ["Canada", "Utilities", "CU", "Canadian Utilities", "CAD", 33, 5.5, 74, 3, 69, "Fair"],
  ["Canada", "Utilities", "BEPC", "Brookfield Renewable", "CAD", 38, 5.0, 78, 5, 66, "Fair"],
  ["Canada", "Infrastructure", "BIPC", "Brookfield Infrastructure", "CAD", 52, 4.5, 70, 8, 73, "Fair"],
  ["Canada", "Railways", "CNR", "Canadian National Railway", "CAD", 164, 2.1, 32, 11, 83, "Fair"],
  ["Canada", "Railways", "CP", "Canadian Pacific Kansas City", "CAD", 112, 0.9, 24, 9, 78, "Fair"],
  ["Canada", "Consumer Staples", "MRU", "Metro", "CAD", 78, 1.6, 33, 8, 80, "Fair"],
  ["Canada", "Consumer Staples", "L", "Loblaw Companies", "CAD", 154, 1.4, 31, 9, 82, "Fair"],
  ["Canada", "Consumer Staples", "ATD", "Alimentation Couche-Tard", "CAD", 78, 0.9, 22, 11, 84, "Fair"],
  ["Canada", "Industrial", "WCN", "Waste Connections", "CAD", 235, 0.7, 28, 12, 83, "Fair"],
  ["Canada", "Industrial", "TFII", "TFI International", "CAD", 205, 1.2, 24, 10, 78, "Fair"],
  ["Canada", "Real Estate", "CAR.UN", "Canadian Apartment Properties REIT", "CAD", 45, 3.3, 63, 3, 67, "Fair"],
  ["Europe", "Healthcare", "NVS", "Novartis", "CHF", 94, 2.2, 58, 5, 82, "Fair"],
  ["Europe", "Technology", "SAP", "SAP", "EUR", 168, 1.5, 44, 6, 78, "Fair"],
  ["Europe", "Energy", "TTE", "TotalEnergies", "EUR", 68, 4.3, 69, 2, 72, "Fair"],
  ["Europe", "Consumer Defensive", "UL", "Unilever PLC ADR", "USD", 57, 4.1, 61, 3, 78, "Fair"],
  ["Europe", "Basic Materials", "RIO", "Rio Tinto", "GBP", 53.8, 6.2, 62, 1, 67, "Fair"],
  ["Europe", "Technology", "ASML", "ASML Holding", "EUR", 640, 1.1, 33, 5, 82, "Fair"],
  ["Asia", "Technology", "TSM", "Taiwan Semiconductor Manufacturing", "USD", 175, 1.6, 36, 9, 86, "Fair"],
  ["Asia", "Autos", "TM", "Toyota Motor", "JPY", 2950, 2.4, 31, 4, 76, "Fair"],
  ["Asia", "Financial Services", "MUFG", "Mitsubishi UFJ Financial Group", "JPY", 1700, 2.3, 38, 5, 72, "Fair"],
  ["Asia", "Financial Services", "HDB", "HDFC Bank", "USD", 59, 1.4, 33, 5, 70, "Fair"],
  ["Asia", "Technology", "INFY", "Infosys", "USD", 18, 2.5, 58, 6, 74, "Fair"],
  ["Nigeria", "Banks", "UBA", "United Bank for Africa", "NGN", 34, 9.2, 35, 8, 75, "Cheap"],
  ["Nigeria", "Banks", "GTCO", "Guaranty Trust Holding Company", "NGN", 58.2, 8.4, 38, 7, 78, "Cheap"],
  ["Nigeria", "Banks", "ZENITHBANK", "Zenith Bank", "NGN", 45.7, 10.1, 42, 6, 76, "Cheap"],
  ["Nigeria", "Telecoms", "MTNN", "MTN Nigeria", "NGN", 255.4, 6.2, 63, 9, 82, "Fair"],
  ["Nigeria", "Energy", "SEPLAT", "Seplat Energy", "NGN", 3180, 5.1, 55, 4, 66, "Fair"],
  ["Nigeria", "Energy", "ARADEL", "Aradel Holdings", "NGN", 1406.9, 2.35, 35, 2, 76, "Fair"],
  ["Nigeria", "Cement", "BUACEMENT", "BUA Cement", "NGN", 93.5, 2.1, 52, 5, 72, "Fair"],
  ["Nigeria", "Healthcare", "MECURE", "Mecure Industries", "NGN", 10.4, 3.8, 41, 3, 64, "Fair"],
  ["Nigeria", "Industrials", "TRANSCORP", "Transnational Corporation", "NGN", 45.5, 2.7, 34, 6, 66, "Fair"],
  ["Nigeria", "Utilities", "TRANSPOWER", "Transcorp Power", "NGN", 365.0, 4.2, 48, 4, 69, "Fair"],
  ["Nigeria", "Banks", "WEMABANK", "Wema Bank", "NGN", 10.8, 7.8, 37, 7, 67, "Cheap"],
  ["Nigeria", "Banks", "ETI", "Ecobank Transnational Incorporated", "NGN", 32.1, 5.2, 33, 6, 65, "Cheap"],
  ["Nigeria", "Technology", "ETRANZACT", "eTranzact International", "NGN", 6.5, 4.6, 45, 5, 61, "Fair"],
  ["Nigeria", "Financials", "CSCS", "Central Securities Clearing System", "NGN", 26.2, 6.5, 58, 4, 68, "Fair"],
  ["Nigeria", "Utilities", "GEREGU", "Geregu Power", "NGN", 1150.0, 1.8, 42, 4, 70, "Fair"],
  ["Nigeria", "Basic Materials", "BERGER", "Berger Paints Nigeria", "NGN", 20.0, 3.6, 39, 4, 59, "Fair"],
  ["Nigeria", "Insurance", "AXAMANSARD", "AXA Mansard Insurance", "NGN", 7.4, 5.7, 40, 6, 63, "Cheap"],
  ["Nigeria", "Consumer Goods", "VITAFOAM", "Vitafoam Nigeria", "NGN", 26.8, 6.1, 44, 5, 64, "Cheap"],
  ["Zimbabwe", "Consumer Staples", "DLTA", "Delta Corporation Zimbabwe", "ZWL", 520, 4.8, 45, 5, 66, "Fair"],
  ["Zimbabwe", "Telecoms", "ECO", "Econet Wireless Zimbabwe", "ZWL", 180, 3.2, 50, 4, 58, "Fair"],
  ["Zimbabwe", "Banks", "CBZ", "CBZ Holdings", "ZWL", 230, 5.1, 42, 5, 62, "Fair"],
  ["Zimbabwe", "Consumer Staples", "INN", "Innscor Africa", "ZWL", 380, 4.0, 48, 4, 64, "Fair"]
];

moreDividendStocks.push(...extraPlatformDividendStocks, ...highProfileDividendStocks);

// Verified on 2026-05-02 against Yahoo Finance 2-year dividend-event history.
const usRecentDividendExclusions = new Set([
  "ARIS",
  "CALY",
  "FIG",
  "RJET"
]);

function deterministicHistory(base, ticker) {
  const seed = [...ticker].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: 12 }, (_, index) => {
    const wave = Math.sin((seed + index * 17) / 13) * 0.07;
    const trend = (index - 5.5) * ((seed % 9) - 3) * 0.006;
    return Number((base * (1 + wave + trend)).toFixed(base > 100 ? 0 : 2));
  });
}

function expectedDividendDates(ticker) {
  const seed = [...ticker].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const month = (seed % 9) + 4;
  const day = (seed % 18) + 7;
  const exDate = new Date(Date.UTC(2026, month - 1, day));
  const recordDate = new Date(exDate);
  recordDate.setUTCDate(exDate.getUTCDate() + 1);
  const payDate = new Date(exDate);
  payDate.setUTCDate(exDate.getUTCDate() + 25);
  return [exDate, recordDate, payDate].map((date) => date.toISOString().slice(0, 10));
}

function buildEarningsReport(stock) {
  const seed = [...stock.ticker].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const revenueGrowth = Number(clamp(stock.divGrowth + ((seed % 9) - 3), -12, 28).toFixed(1));
  const profitGrowth = Number((revenueGrowth - 4 + (stock.safety / 25)).toFixed(1));
  const eps = Number(Math.max(0.01, stock.price * (0.025 + (stock.safety / 3000))).toFixed(stock.price > 100 ? 2 : 3));
  const earningsYield = Number(((eps / stock.price) * 100).toFixed(1));
  const fiscalYear = 2025;
  const reportMonth = (seed % 4) + 2;
  const reportDay = (seed % 18) + 7;
  const nextReport = new Date(Date.UTC(2026, reportMonth - 1, reportDay)).toISOString().slice(0, 10);
  const quality = stock.payoutRatio <= 65 && profitGrowth >= 4
    ? "Strong"
    : stock.payoutRatio <= 85 && profitGrowth >= 0
      ? "Steady"
      : "Watch closely";

  return {
    fiscalYear,
    eps,
    earningsYield,
    revenueGrowth,
    profitGrowth,
    nextReport,
    quality
  };
}

function dividendFrequency(stock) {
  const category = stock.category.toLowerCase();
  if (category.includes("reit")) return "Monthly / quarterly";
  if (stock.market === "UK" || stock.market === "Nigeria" || stock.market === "Zimbabwe") return "Usually 1-2 times per year";
  if (stock.market === "Canada" || stock.market === "US") return "Usually quarterly";
  if (stock.market === "Europe" || stock.market === "Asia") return "Usually annual / semi-annual";
  return "Varies by company";
}

function liquidityProfile(stock) {
  const marketBase = {
    US: 88,
    UK: 78,
    Canada: 74,
    Europe: 72,
    Asia: 68,
    Nigeria: 52,
    Zimbabwe: 34
  };
  let score = marketBase[stock.market] || 55;
  if ((stock.marketCap || 0) >= 100000000000) score += 8;
  else if ((stock.marketCap || 0) >= 10000000000) score += 5;
  else if ((stock.marketCap || 0) >= 1000000000) score += 2;
  if (stock.category.toLowerCase().includes("banks")) score += 3;
  if (stock.category.toLowerCase().includes("reit")) score -= 2;
  if (stock.market === "Zimbabwe") score -= 5;
  score = clamp(Math.round(score), 15, 98);
  const label = score >= 75 ? "High" : score >= 55 ? "Medium" : "Lower";
  const note = score >= 75
    ? "Usually easier to buy and sell with tighter spreads on major platforms."
    : score >= 55
      ? "Tradable, but check spreads, order size, settlement timing, and platform availability."
      : "Can be harder to trade quickly; use limit orders and check local broker liquidity before buying.";
  return { score, label, note };
}

function platformLiquidityScore(stock, platformName) {
  const profile = liquidityProfile(stock);
  let score = profile.score;
  const name = platformName.toLowerCase();
  if (name.includes("trading 212") || name.includes("revolut") || name.includes("interactive brokers")) score += 4;
  if (name.includes("bamboo") && (stock.market === "US" || stock.market === "Nigeria")) score += 3;
  if (name.includes("investnaija") && stock.market === "Nigeria") score += 3;
  if (name.includes("local") || name.includes("specialist") || name.includes("frontier")) score -= 8;
  score = clamp(Math.round(score), 15, 98);
  const label = score >= 75 ? "High" : score >= 55 ? "Medium" : "Lower";
  return `Liquidity score: ${score}/100 (${label})`;
}

function platformChoices(market) {
  if (market === "UK") {
    return [
      ["Trading 212", "Common UK route for listed shares; compare execution quality and pricing."],
      ["Freetrade", "Good for regular small purchases; compare the monthly platform fee."],
      ["Hargreaves Lansdown", "Broad UK share coverage; watch dealing and custody charges."]
    ];
  }
  if (market === "US") {
    return [
      ["Bamboo", "Common route for Nigerian investors buying US dividend shares."],
      ["Chaka", "Compare FX spread, custody, and dividend handling."],
      ["Trove", "Check fractional-share support and withholding-tax treatment."]
    ];
  }
  if (market === "Canada" || market === "Europe" || market === "Asia") {
    return [
      ["Trading 212 Invest", "Common UK route for many global ordinary shares, ADRs, ETFs, and investment products; confirm live instrument availability."],
      ["Revolut Invest", "Offers thousands of global stocks in-app depending on country, account type, and current availability."],
      ["Interactive Brokers", "Broad global-market access for investors who need wider Canada, Europe, and Asia coverage."]
    ];
  }
  if (market === "Zimbabwe") {
    return [
      ["Local ZSE broker", "Zimbabwe Stock Exchange access usually requires a local or specialist broker; confirm custody, settlement, and dividend payment process."],
      ["VFEX/ZSE platform access", "Some Zimbabwe-listed securities trade through local exchange-linked platforms; verify current listing venue."],
      ["Specialist frontier-market broker", "For non-resident access, check regulation, fees, FX conversion, and dividend remittance rules."]
    ];
  }
  return [
    ["InvestNaija", "Useful for NGX dividend shares and local-currency funding."],
    ["Bamboo", "Confirm current NGX ticker availability and trading fees."],
    ["Chaka", "Check local-market access before funding."]
  ];
}

function inferPlatformMarket(ticker, company) {
  const symbol = String(ticker || "").toUpperCase();
  const name = String(company || "").toLowerCase();
  const canada = new Set(["RY", "TD", "BNS", "BMO", "CM", "ENB", "CNQ", "TRP", "BCE", "TU", "MFC", "SLF", "FTS", "CNI", "CP", "SHOP", "WCN", "GIB", "NTR"]);
  const europe = new Set(["NVS", "SAP", "SAN", "UBS", "TTE", "UL", "SHEL", "RIO", "BHP", "AZN", "GSK", "NVO", "ASML", "LIN", "BP", "HSBC", "BTI", "DEO"]);
  const asia = new Set(["TM", "MUFG", "HDB", "TSM", "NTES", "SONY", "NIO", "BABA", "JD", "CHT", "KB", "SMFG", "TAK", "INFY"]);
  if (canada.has(symbol) || name.includes("canadian") || name.includes("toronto-dominion") || name.includes("royal bank of canada")) return "Canada";
  if (europe.has(symbol) || name.includes("plc") || name.includes("s.a.") || name.includes("ag") || name.includes("se")) return "Europe";
  if (asia.has(symbol) || name.includes("toyota") || name.includes("taiwan") || name.includes("mitsubishi") || name.includes("hdfc")) return "Asia";
  return "US";
}

function signalFromMetrics(dividendYield, payoutRatio, safety, valuation) {
  if (safety < 50 || payoutRatio > 85 || valuation === "Expensive") return "Sell";
  if (dividendYield >= 4 && payoutRatio <= 72 && safety >= 64) return "Buy";
  return "Hold";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function buyScoreFromMetrics({ growthYears = 0, payoutRatio = 65, safety = 60, dividendYield = 2.5, marketCap = 0 }) {
  const payoutHealth = payoutRatio <= 0 ? 45 : payoutRatio <= 35 ? 88 : payoutRatio <= 60 ? 100 : payoutRatio <= 75 ? 78 : payoutRatio <= 90 ? 42 : 15;
  const growthScore = clamp((growthYears / 25) * 100, 0, 100);
  const yieldScore = dividendYield <= 0 ? 0 : dividendYield <= 2 ? 45 : dividendYield <= 6 ? 80 : dividendYield <= 10 ? 68 : 35;
  const sizeScore = marketCap >= 100000000000 ? 92 : marketCap >= 10000000000 ? 78 : marketCap >= 2000000000 ? 62 : 48;
  const safeScore = clamp((safety * 0.75) + (sizeScore * 0.25), 0, 100);
  return Math.round((growthScore * 0.25) + (payoutHealth * 0.3) + (safeScore * 0.3) + (yieldScore * 0.15));
}

function scoreSignal(score, payoutRatio) {
  if (score >= 72 && payoutRatio <= 85) return "Buy";
  if (score < 45 || payoutRatio > 110) return "Sell";
  return "Hold";
}

function addUniverseRows() {
  const existing = new Set(stocks.map((stock) => `${stock.market}:${stock.ticker}`));
  moreDividendStocks.forEach(([market, category, ticker, name, currency, price, dividendYield, payoutRatio, divGrowth, safety, valuation]) => {
    if (existing.has(`${market}:${ticker}`)) return;
    const [exDate, recordDate, payDate] = expectedDividendDates(ticker);
    const signal = signalFromMetrics(dividendYield, payoutRatio, safety, valuation);
    stocks.push({
      market,
      category,
      ticker,
      name,
      currency,
      price,
      marketCap: 0,
      annualDividend: Number((price * (dividendYield / 100)).toFixed(4)),
      dividendYield,
      payoutRatio,
      divGrowth,
      safety,
      valuation,
      signal,
      exDate,
      recordDate,
      payDate,
      history: deterministicHistory(price, ticker),
      platforms: platformChoices(market),
      reasons: [
        `${name} is included in the dividend-paying universe for ${market}, with an income profile that fits the ${category} category.`,
        `The current rules-based view balances ${dividendYield}% yield, ${payoutRatio}% payout ratio, and a ${safety}/100 dividend safety score.`,
        market === "UK" ? "For UK holdings, compare fees, execution quality, and dividend handling across available brokers before buying." : "Check live platform availability, FX cost, custody fees, and dividend payment treatment before buying."
      ]
    });
  });
}

addUniverseRows();

function addOnlineDividendRows() {
  const sourceRows = Array.isArray(window.ONLINE_DIVIDEND_UNIVERSE) ? window.ONLINE_DIVIDEND_UNIVERSE : [];
  const existing = new Set(stocks.map((stock) => `${stock.market}:${stock.ticker}`));
  sourceRows.forEach((row) => {
    const ticker = String(row.symbol || "").trim().toUpperCase();
    const market = inferPlatformMarket(ticker, row.company);
    if (market === "US" && usRecentDividendExclusions.has(ticker)) return;
    if (!ticker || existing.has(`${market}:${ticker}`)) return;
    const dividendYield = Number(row.yield) || 0;
    const annualDividend = Number(row.annualDividend) || 0;
    const payoutRatio = Number(row.payout) || 65;
    const growthYears = Number(row.years) || 0;
    const marketCap = Number(row.marketCap) || 0;
    const price = annualDividend > 0 && dividendYield > 0
      ? Number((annualDividend / (dividendYield / 100)).toFixed(2))
      : Number((20 + (ticker.charCodeAt(0) || 65) * 1.7).toFixed(2));
    const safety = clamp(100 - Math.max(0, payoutRatio - 45) * 0.75 + Math.min(growthYears, 25) * 0.8, 20, 95);
    const buyScore = Number(row.qualityScore) || buyScoreFromMetrics({ growthYears, payoutRatio, safety, dividendYield, marketCap });
    const signal = scoreSignal(buyScore, payoutRatio);
    const [exDate, recordDate, payDate] = expectedDividendDates(ticker);
    stocks.push({
      market,
      category: row.sector || "Dividend Stocks",
      ticker,
      name: row.company || ticker,
      currency: market === "Canada" ? "CAD" : market === "Europe" ? "EUR" : "USD",
      price,
      annualDividend,
      dividendYield: Number(dividendYield.toFixed(2)),
      payoutRatio: Number(payoutRatio.toFixed(1)),
      divGrowth: growthYears,
      safety: Math.round(safety),
      buyScore,
      marketCap,
      valuation: buyScore >= 72 ? "Fair" : buyScore < 45 ? "Expensive" : "Fair",
      signal,
      exDate,
      recordDate,
      payDate,
      history: deterministicHistory(price, ticker),
      platforms: platformChoices(market),
      reasons: [
        `${row.company || ticker} was imported from the online dividend stock universe, which tracks dividend yield, annual dividend, payout ratio, sector, and dividend growth streaks.`,
        `Buy score ${buyScore}/100 combines dividend growth streak, payout-ratio health, safety/size quality, and yield quality.`,
        `Payout ratio is ${Number(payoutRatio.toFixed(1))}%; extreme payout ratios reduce the score even when the headline yield looks attractive.`
      ]
    });
    existing.add(`${market}:${ticker}`);
  });
}

addOnlineDividendRows();

function mergedDividendSources(baseSource = {}, updateSource = {}) {
  const combined = {};
  Object.entries(baseSource || {}).forEach(([ticker, record]) => {
    if (ticker.startsWith("_") || !record) return;
    combined[ticker] = { ...record };
  });
  Object.entries(updateSource || {}).forEach(([ticker, record]) => {
    if (ticker.startsWith("_") || !record) return;
    combined[ticker] = {
      ...(combined[ticker] || {}),
      ...record,
      history: record.history || combined[ticker]?.history,
      sources: record.sources || combined[ticker]?.sources
    };
  });
  return {
    _meta: {
      ...(baseSource?._meta || {}),
      ...(updateSource?._meta || {}),
      note: [baseSource?._meta?.note, updateSource?._meta?.note].filter(Boolean).join(" ")
    },
    ...combined
  };
}

function dividendRecordCount(source = {}) {
  return Object.keys(source || {}).filter((key) => !String(key).startsWith("_")).length;
}

function applyStaticNigeriaDividendData() {
  const source = mergedDividendSources(window.NIGERIA_DIVIDEND_DATES || {}, window.NIGERIA_DIVIDEND_UPDATES || {});
  const meta = source._meta || {};
  let applied = 0;
  Object.entries(source).forEach(([ticker, record]) => {
    if (ticker.startsWith("_") || !record) return;
    stocks
      .filter((stock) => stock.market === "Nigeria" && stock.ticker === ticker)
      .forEach((stock) => {
        applyDividendDataToStock(stock, {
          provider: record.sourceName || meta.sourceName || "Verified public Nigeria dividend file",
          verifiedAt: record.verifiedAt || meta.verifiedAt,
          exDate: record.qualificationDate,
          recordDate: record.recordDate || record.qualificationDate,
          payDate: record.paymentDate,
          amount: record.amount,
          currency: record.currency || "NGN",
          type: record.type,
          closureOfRegister: record.closureOfRegister,
          agmDate: record.agmDate,
          registrar: record.registrar,
          sourceUrl: record.sourceUrl || meta.sourceUrl,
          history: record.history || [],
          nextDeclared: Boolean(record.qualificationDate || record.paymentDate),
          note: [record.note, meta.note].filter(Boolean).join(" ")
        });
        applied += 1;
      });
  });
  return applied;
}

applyStaticNigeriaDividendData();

function applyStaticMarketDividendData() {
  const source = mergedDividendSources(window.MARKET_DIVIDEND_DATES || {}, window.MARKET_DIVIDEND_UPDATES || {});
  const meta = source._meta || {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let applied = 0;

  Object.entries(source).forEach(([key, record]) => {
    if (key.startsWith("_") || !record) return;
    const [market, ticker] = key.split(":");
    if (!market || !ticker) return;
    const eventDate = record.qualificationDate || record.exDate || "";
    const eventTime = eventDate ? new Date(`${eventDate}T00:00:00`).getTime() : NaN;
    const eventIsUpcoming = Number.isFinite(eventTime) && eventTime >= today.getTime();

    stocks
      .filter((stock) => stock.market === market && stock.ticker === ticker)
      .forEach((stock) => {
        applyDividendDataToStock(stock, {
          provider: record.sourceName || meta.sourceName || "Verified public dividend-event file",
          verifiedAt: record.verifiedAt || meta.verifiedAt,
          exDate: eventIsUpcoming ? eventDate : "",
          recordDate: eventIsUpcoming ? record.recordDate || "" : "",
          payDate: eventIsUpcoming ? record.paymentDate || "" : "",
          amount: record.amount,
          currency: record.currency || stock.currency,
          type: record.type,
          sourceUrl: record.sourceUrl || meta.sourceUrl,
          nextDeclared: eventIsUpcoming,
          paymentDateKnown: eventIsUpcoming ? Boolean(record.paymentDate) : undefined,
          partialDateData: eventIsUpcoming && !record.paymentDate,
          history: record.history || [],
          note: [record.note, meta.note].filter(Boolean).join(" ")
        });
        applied += 1;
      });
  });
  return applied;
}

applyStaticMarketDividendData();

function currentSnapshotVersion(source = {}) {
  const meta = source?._meta || source?.meta || source?.records?._meta || {};
  const audit = source?.audit || {};
  return JSON.stringify({
    generatedAt: source?.generatedAt || audit.generatedAt || meta.generatedAt || "",
    verifiedAt: meta.verifiedAt || audit.verifiedAt || "",
    note: meta.note || "",
    sourceName: meta.sourceName || "",
    sourceUrl: meta.sourceUrl || "",
    successes: audit.successes || 0,
    totalTargets: audit.totalTargets || 0
  });
}

function snapshotRecords(source = {}) {
  if (source?.records && typeof source.records === "object" && !Array.isArray(source.records)) {
    return source.records;
  }
  return source;
}

function activeDetailStock() {
  return stocks.find((stock) => stock.ticker === selectedTicker) || selectedStock || stocks[0];
}

function rerenderDividendSurfaces() {
  renderList();
  renderDetail(activeDetailStock());
}

async function fetchHostedDividendSnapshot(pathname) {
  if (window.location.protocol === "file:") return null;
  const separator = pathname.includes("?") ? "&" : "?";
  const response = await fetch(`${pathname}${separator}ts=${Date.now()}`, { cache: "no-store" }).catch(() => null);
  if (!response?.ok) return null;
  return response.json().catch(() => null);
}

async function refreshHostedStaticDividendSnapshots() {
  if (window.location.protocol === "file:" || hostedStaticDividendRefreshInFlight) {
    return { refreshed: false, sources: 0, rows: 0 };
  }

  hostedStaticDividendRefreshInFlight = true;
  try {
    const [nigeriaPayload, marketPayload] = await Promise.all([
      fetchHostedDividendSnapshot(staticDividendSnapshotPaths.nigeria),
      fetchHostedDividendSnapshot(staticDividendSnapshotPaths.market)
    ]);

    let changedSources = 0;
    let appliedRows = 0;

    if (nigeriaPayload) {
      const version = currentSnapshotVersion(nigeriaPayload);
      if (version && version !== hostedDividendSnapshotVersions.nigeria) {
        window.NIGERIA_DIVIDEND_UPDATES = snapshotRecords(nigeriaPayload);
        hostedDividendSnapshotVersions.nigeria = version;
        changedSources += 1;
        appliedRows += applyStaticNigeriaDividendData() || dividendRecordCount(window.NIGERIA_DIVIDEND_UPDATES);
      }
    }

    if (marketPayload) {
      const version = currentSnapshotVersion(marketPayload);
      if (version && version !== hostedDividendSnapshotVersions.market) {
        window.MARKET_DIVIDEND_UPDATES = snapshotRecords(marketPayload);
        hostedDividendSnapshotVersions.market = version;
        changedSources += 1;
        appliedRows += applyStaticMarketDividendData() || dividendRecordCount(window.MARKET_DIVIDEND_UPDATES);
      }
    }

    if (changedSources) {
      rerenderDividendSurfaces();
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (lastUpdated) {
        lastUpdated.textContent = `${appliedRows} dividend rows refreshed from uploaded files at ${time}`;
      }
      return { refreshed: true, sources: changedSources, rows: appliedRows };
    }

    return { refreshed: false, sources: 0, rows: 0 };
  } finally {
    hostedStaticDividendRefreshInFlight = false;
  }
}

const protectedDividendTickers = new Set([
  "Nigeria:MTNN",
  "Nigeria:AIRTELAFRI",
  "Nigeria:GTCO",
  "Nigeria:ZENITHBANK",
  "Nigeria:UBA",
  "Nigeria:ACCESSCORP",
  "Nigeria:FBNH",
  "Nigeria:STANBIC",
  "Nigeria:FIDELITYBK",
  "Nigeria:SEPLAT",
  "Nigeria:TOTAL",
  "Nigeria:DANGCEM",
  "Nigeria:WAPCO",
  "Nigeria:PRESCO",
  "Nigeria:OKOMUOIL",
  "Nigeria:UCAP",
  "Nigeria:BUAFOODS",
  "Nigeria:TIP",
  "Nigeria:UNILEVER",
  "Nigeria:FIDSON",
  "Nigeria:NAHCO",
  "Nigeria:CUSTODIAN",
  ...highProfileDividendStocks.map(([market, , ticker]) => `${market}:${ticker}`)
]);

function finalQualityScore(stock) {
  return stock.buyScore ?? buyScoreFromMetrics({
    growthYears: stock.divGrowth,
    payoutRatio: stock.payoutRatio,
    safety: stock.safety,
    dividendYield: stock.dividendYield,
    marketCap: stock.marketCap || 0
  });
}

function finalizeBestDividendUniverse() {
  const protectedOriginal = stocks.filter((stock) => protectedDividendTickers.has(`${stock.market}:${stock.ticker}`));
  const clean = stocks.filter((stock) => {
    const score = finalQualityScore(stock);
    const protectedName = protectedDividendTickers.has(`${stock.market}:${stock.ticker}`);
    return (protectedName || score >= 30)
      && stock.dividendYield > 0.1
      && stock.dividendYield <= 12
      && stock.payoutRatio > 0
      && stock.payoutRatio <= 125
      && !/acquisition|warrant|right|unit|preferred/i.test(stock.name);
  }).sort((a, b) => {
    const aProtected = protectedDividendTickers.has(`${a.market}:${a.ticker}`);
    const bProtected = protectedDividendTickers.has(`${b.market}:${b.ticker}`);
    if (aProtected !== bProtected) return Number(bProtected) - Number(aProtected);
    const scoreDiff = finalQualityScore(b) - finalQualityScore(a);
    if (scoreDiff !== 0) return scoreDiff;
    return (b.marketCap || 0) - (a.marketCap || 0);
  });

  const nonUs = clean.filter((stock) => stock.market !== "US");
  const us = clean.filter((stock) => stock.market === "US");
  const best = [...nonUs, ...us.slice(0, Math.max(0, dividendUniverseLimit - nonUs.length))].slice(0, dividendUniverseLimit);
  protectedOriginal.forEach((stock) => {
    if (!best.some((item) => item.market === stock.market && item.ticker === stock.ticker)) {
      best.unshift(stock);
    }
  });
  while (best.length > dividendUniverseLimit) {
    const removeIndex = best.findLastIndex((stock) => !protectedDividendTickers.has(`${stock.market}:${stock.ticker}`));
    if (removeIndex < 0) break;
    best.splice(removeIndex, 1);
  }
  stocks.splice(0, stocks.length, ...best);
}

finalizeBestDividendUniverse();

const categoryFilter = document.querySelector("#categoryFilter");
const signalFilter = document.querySelector("#signalFilter");
const searchInput = document.querySelector("#searchInput");
const refreshPrices = document.querySelector("#refreshPrices");
const appMain = document.querySelector("#appMain");
const headerGreeting = document.querySelector("#headerGreeting");
const themeToggle = document.querySelector("#themeToggle");
const themeToggleText = document.querySelector("#themeToggleText");
const liteModeToggle = document.querySelector("#liteModeToggle");
const liteModeToggleText = document.querySelector("#liteModeToggleText");
const logoutButton = document.querySelector("#logoutButton");
const marketDropdown = document.querySelector("#marketDropdown");
const marketMenu = document.querySelector("#marketMenu");
const marketSummary = document.querySelector("#marketSummary");
const liteMarketSlot = document.querySelector("#liteMarketSlot");
const liteSearchInput = document.querySelector("#liteSearchInput");
const sortField = document.querySelector("#sortField");
const sortDirection = document.querySelector("#sortDirection");
const rangeTabs = [...document.querySelectorAll(".range-tab")];
const stockList = document.querySelector("#stockList");
const youtubeChannels = document.querySelector("#youtubeChannels");
const ipoPane = document.querySelector(".ipo-learning");
const ipoList = document.querySelector("#ipoList");
const ipoInstructions = document.querySelector("#ipoInstructions");
const secNigeriaPane = document.querySelector("#secNigeriaPane");
const ukSavingsPane = document.querySelector("#ukSavingsPane");
const ukSavingsList = document.querySelector("#ukSavingsList");
const visibleCount = document.querySelector("#visibleCount");
const stockCount = document.querySelector("#stockCount");
const buyCount = document.querySelector("#buyCount");
const lastUpdated = document.querySelector("#lastUpdated");
const detailMarket = document.querySelector("#detailMarket");
const detailName = document.querySelector("#detailName");
const detailTicker = document.querySelector("#detailTicker");
const detailSignal = document.querySelector("#detailSignal");
const detailWatchStar = document.querySelector("#detailWatchStar");
const addToPortfolioButton = document.querySelector("#addToPortfolioButton");
const watchlistToast = document.querySelector("#watchlistToast");
const metrics = document.querySelector("#metrics");
const dividendHistoryPane = document.querySelector("#dividendHistoryPane");
const watchlistToggle = document.querySelector("#watchlistToggle");
const exportFiltered = document.querySelector("#exportFiltered");
const exportWatchlist = document.querySelector("#exportWatchlist");
const companyProfile = document.querySelector("#companyProfile");
const watchlistPane = document.querySelector("#watchlistPane");
const dividendCalendarPane = document.querySelector("#dividendCalendarPane");
const dividendAlertBadge = document.querySelector("#dividendAlertBadge");
const portfolioShares = document.querySelector("#portfolioShares");
const portfolioPriceCurrency = document.querySelector("#portfolioPriceCurrency");
const portfolioPrice = document.querySelector("#portfolioPrice");
const savePortfolio = document.querySelector("#savePortfolio");
const downloadPortfolio = document.querySelector("#downloadPortfolio");
const portfolioTrackerPane = document.querySelector("#portfolioTrackerPane");
const portfolioPane = document.querySelector("#portfolioPane");
const alertsPane = document.querySelector("#alertsPane");
const compareSelects = [...document.querySelectorAll(".compare-select")];
const comparePane = document.querySelector("#comparePane");
const converterAmount = document.querySelector("#converterAmount");
const converterFrom = document.querySelector("#converterFrom");
const converterTo = document.querySelector("#converterTo");
const converterResult = document.querySelector("#converterResult");
const beginnerPane = document.querySelector("#beginnerPane");
const newsPane = document.querySelector("#newsPane");
const topbarQuickPanes = [...document.querySelectorAll(".topbar-pane")];
const reportPaneButtons = [...document.querySelectorAll(".report-open-button")];
const reportContentShelf = document.querySelector("#reportContentShelf");
const reportPaneModal = document.querySelector("#reportPaneModal");
const reportPaneModalTitle = document.querySelector("#reportPaneModalTitle");
const reportPaneModalBody = document.querySelector("#reportPaneModalBody");
const closeReportPaneModalBtn = document.querySelector("#closeReportPaneModal");
const contactUsFab = document.querySelector("#contactUsFab");
const contactUsModal = document.querySelector("#contactUsModal");
const closeContactUsBtn = document.querySelector("#closeContactUsBtn");
const sendContactMessageBtn = document.querySelector("#sendContactMessageBtn");
const contactUserName = document.querySelector("#contactUserName");
const contactUserEmail = document.querySelector("#contactUserEmail");
const contactSubject = document.querySelector("#contactSubject");
const contactMessage = document.querySelector("#contactMessage");
const contactUsStatus = document.querySelector("#contactUsStatus");
const paymentModal = document.querySelector("#paymentModal");
const paymentContactAdmin = document.querySelector("#paymentContactAdmin");
const paymentStatus = document.querySelector("#paymentStatus");
const reasonsList = document.querySelector("#reasonsList");
const dividendDates = document.querySelector("#dividendDates");
const earningsReport = document.querySelector("#earningsReport");
const platforms = document.querySelector("#platforms");
const canvas = document.querySelector("#priceChart");
const ctx = canvas.getContext("2d");
const chartTooltip = document.querySelector("#chartTooltip");

let selectedTicker = stocks[0].ticker;
let selectedStock = stocks[0];
let chartRange = "monthly";
let chartState = { stock: stocks[0], points: [], min: 0, max: 0, labels: [], values: [] };
let activeChartPointIndex = -1;
let activeChartStockKey = "";
let chartPointerActive = false;
let currentUser = null;
let activeMarkets = [];
let latestIpos = [];
let watchlistKeys = readJson("dividendWatchlist", []);
let portfolioHoldings = readJson("dividendPortfolio", {});
let compareKeys = readJson("dividendCompareStocks", []);
let inactivityTimer = null;
let watchlistToastTimer = null;
let dashboardScrollTimer = null;
let dividendVerificationTimer = null;
let dividendVerificationController = null;
let dividendVerificationCache = readJson("dividendVerificationCache", {});
const allMarkets = ["US", "UK", "Canada", "Nigeria", "Europe", "Asia", "Zimbabwe"];
const marketLabels = {};
const fxRatesToUsd = { USD: 1, GBP: 1.25, NGN: 0.00065, CAD: 0.73, EUR: 1.08, CHF: 1.1, JPY: 0.0066, ZWL: 0.0028 };
const adminContactEmail = "dividendstocktracker@gmail.com";
const usersStorageKey = "dividendRegisteredUsers";
const dashboardStateKey = "dividendDashboardState";
const freeTrialDays = 7;
const inactivityLimitMs = 60 * 60 * 1000;
const usesHostedSharedAccounts = window.location.protocol !== "file:";
let hostedProfileSyncTimer = null;
let hostedProfileSyncInFlight = false;
let hostedProfileSyncPending = {};
const currencyNames = Object.keys(fxRatesToUsd);
const chartRanges = {
  daily: { title: "Daily price history", points: 30, step: "day" },
  weekly: { title: "Weekly price history", points: 26, step: "week" },
  monthly: { title: "Monthly price history", points: 12, step: "month" },
  yearly: { title: "Yearly price history", points: 10, step: "year" },
  "5year": { title: "5-year price history", points: 60, step: "month" },
  lifetime: { title: "All time price history", points: 120, step: "quarter" }
};
const staticDividendSnapshotPaths = {
  nigeria: "nigeria-dividends-scraped.json",
  market: "market-dividends-scraped.json"
};
const hostedStaticDividendRefreshMs = 5 * 60 * 1000;
const hostedDividendSweepRefreshMs = 20 * 60 * 1000;
const hostedDividendSweepBatchSize = 60;
const hostedDividendSweepBatchCount = 2;
let hostedDividendSnapshotVersions = {
  nigeria: "",
  market: ""
};
let hostedStaticDividendRefreshInFlight = false;
let hostedDividendSweepInFlight = false;
let hostedDividendSweepCursor = 0;
hostedDividendSnapshotVersions.nigeria = currentSnapshotVersion(window.NIGERIA_DIVIDEND_UPDATES || window.NIGERIA_DIVIDEND_DATES || {});
hostedDividendSnapshotVersions.market = currentSnapshotVersion(window.MARKET_DIVIDEND_UPDATES || window.MARKET_DIVIDEND_DATES || {});
const marketDropdownHome = marketDropdown?.parentElement || null;
const marketDropdownHomeNext = marketDropdown?.nextSibling || null;

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function dashboardUserKey(user = currentUser) {
  return normalizeUserKey(user?.email) || normalizeUserKey(user?.username) || "";
}

function readDashboardState(user = currentUser) {
  const key = dashboardUserKey(user);
  if (!key) return null;
  const states = readJson(dashboardStateKey, {});
  return states?.[key] || null;
}

function setDashboardStateForUser(user, nextState) {
  const key = dashboardUserKey(user);
  if (!key) return null;
  const states = readJson(dashboardStateKey, {});
  states[key] = {
    ...(states[key] || {}),
    ...(nextState || {}),
    updatedAt: new Date().toISOString()
  };
  writeJson(dashboardStateKey, states);
  return states[key];
}

async function postHostedJson(url, payload = {}) {
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

function canUseHostedProfileSync(user = currentUser || readStoredUser()) {
  return usesHostedSharedAccounts && Boolean(user?.email) && Boolean(user?.sessionToken);
}

function sanitizeStockKeys(value) {
  return Array.isArray(value) ? [...new Set(value.filter(Boolean))] : [];
}

function sanitizeHoldings(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function sanitizeMarkets(value) {
  return Array.isArray(value) ? allMarkets.filter((market) => value.includes(market)) : [];
}

function redirectToSignin(message) {
  if (message) {
    localStorage.setItem("dividendAccessMessage", message);
  }
  localStorage.removeItem("dividendProfileUser");
  localStorage.removeItem("dividendLastActivityAt");
  window.location.href = signupPageUrl();
}

function mergeHostedUserState(remoteUser, storedUser = readStoredUser()) {
  const sessionToken = storedUser?.sessionToken || currentUser?.sessionToken || "";
  const localWatchlist = sanitizeStockKeys(watchlistKeys);
  const localPortfolio = sanitizeHoldings(portfolioHoldings);
  const localCompare = sanitizeStockKeys(compareKeys);
  const localMarkets = sanitizeMarkets(storedUser?.visibleMarkets || activeMarkets);
  const localDashboardState = readDashboardState(storedUser) || {};
  const pendingUpdates = {};
  const mergedUser = ensureAccessFields({ ...remoteUser, sessionToken });
  const defaultMarkets = Array.isArray(mergedUser.countries)
    ? allMarkets.filter((market) => mergedUser.countries.includes(market))
    : [...allMarkets];

  const hostedWatchlist = sanitizeStockKeys(mergedUser.watchlistKeys);
  watchlistKeys = hostedWatchlist.length ? hostedWatchlist : localWatchlist;
  mergedUser.watchlistKeys = watchlistKeys;
  if (!hostedWatchlist.length && localWatchlist.length) {
    pendingUpdates.watchlistKeys = watchlistKeys;
  }
  writeJson("dividendWatchlist", watchlistKeys);

  const hostedPortfolio = sanitizeHoldings(mergedUser.portfolioHoldings);
  portfolioHoldings = Object.keys(hostedPortfolio).length ? hostedPortfolio : localPortfolio;
  mergedUser.portfolioHoldings = portfolioHoldings;
  if (!Object.keys(hostedPortfolio).length && Object.keys(localPortfolio).length) {
    pendingUpdates.portfolioHoldings = portfolioHoldings;
  }
  writeJson("dividendPortfolio", portfolioHoldings);

  const hostedCompare = sanitizeStockKeys(mergedUser.compareKeys);
  compareKeys = hostedCompare.length ? hostedCompare : localCompare;
  mergedUser.compareKeys = compareKeys;
  if (!hostedCompare.length && localCompare.length) {
    pendingUpdates.compareKeys = compareKeys;
  }
  writeJson("dividendCompareStocks", compareKeys);

  const hostedMarkets = sanitizeMarkets(mergedUser.visibleMarkets);
  mergedUser.visibleMarkets = hostedMarkets.length
    ? hostedMarkets
    : (localMarkets.length ? localMarkets : defaultMarkets);
  if (!hostedMarkets.length && localMarkets.length) {
    pendingUpdates.visibleMarkets = mergedUser.visibleMarkets;
  }

  const hostedDashboardState = sanitizeHoldings(mergedUser.dashboardState);
  if (Object.keys(hostedDashboardState).length) {
    mergedUser.dashboardState = setDashboardStateForUser(mergedUser, hostedDashboardState);
  } else if (Object.keys(localDashboardState).length) {
    mergedUser.dashboardState = setDashboardStateForUser(mergedUser, localDashboardState);
    pendingUpdates.dashboardState = mergedUser.dashboardState;
  }

  return { user: mergedUser, pendingUpdates };
}

async function pushHostedProfileNow(user, updates = {}) {
  if (!canUseHostedProfileSync(user) || !Object.keys(updates).length) return;
  try {
    const { response, data } = await postHostedJson("/api/auth-sync-profile", {
      email: user.email,
      sessionToken: user.sessionToken,
      updates
    });
    if ((response.status === 401 || response.status === 403) && data?.message) {
      redirectToSignin(data.message);
    }
  } catch {}
}

function queueHostedProfileSync(updates = {}, delayMs = 300) {
  if (!canUseHostedProfileSync() || !Object.keys(updates).length) return;
  hostedProfileSyncPending = {
    ...hostedProfileSyncPending,
    ...updates
  };
  window.clearTimeout(hostedProfileSyncTimer);
  hostedProfileSyncTimer = window.setTimeout(() => {
    void flushHostedProfileSync();
  }, delayMs);
}

async function flushHostedProfileSync() {
  if (hostedProfileSyncInFlight || !canUseHostedProfileSync()) return;
  const pending = hostedProfileSyncPending;
  if (!Object.keys(pending).length) return;
  hostedProfileSyncPending = {};
  hostedProfileSyncInFlight = true;
  const user = currentUser || readStoredUser();
  try {
    const { response, data } = await postHostedJson("/api/auth-sync-profile", {
      email: user.email,
      sessionToken: user.sessionToken,
      updates: pending
    });
    if (response.status === 401 || response.status === 403) {
      redirectToSignin(data?.message || "Your sign-in session has expired. Please sign in again.");
      return;
    }
    if (response.ok && data?.ok && data?.user) {
      const merged = mergeHostedUserState(data.user, user);
      currentUser = merged.user;
      writeStoredUser(currentUser);
    }
  } catch {} finally {
    hostedProfileSyncInFlight = false;
    if (Object.keys(hostedProfileSyncPending).length) {
      hostedProfileSyncTimer = window.setTimeout(() => {
        void flushHostedProfileSync();
      }, 250);
    }
  }
}

function writeDashboardState(nextState) {
  const state = setDashboardStateForUser(currentUser, nextState);
  if (state && canUseHostedProfileSync()) {
    queueHostedProfileSync({ dashboardState: state }, 450);
  }
}

function saveDashboardState() {
  if (!currentUser) return;
  writeDashboardState({
    selectedTicker,
    chartRange,
    category: categoryFilter?.value || "all",
    signal: signalFilter?.value || "all",
    search: searchInput?.value || "",
    sortField: sortField?.value || "name",
    sortDirection: sortDirection?.value || "asc",
    activeMarkets: selectedMarketsForDashboard(),
    openTopbarPanes: topbarQuickPanes.filter((pane) => pane.open && pane.id).map((pane) => pane.id),
    scrollY: Math.max(0, Math.round(window.scrollY || window.pageYOffset || 0))
  });
}

function restoreDashboardState() {
  const state = readDashboardState();
  if (!state) return;

  if (Array.isArray(state.activeMarkets) && state.activeMarkets.length) {
    const allowedMarkets = allMarkets.filter((market) => state.activeMarkets.includes(market));
    if (allowedMarkets.length) {
      activeMarkets = allowedMarkets;
      if (currentUser) {
        currentUser = { ...currentUser, visibleMarkets: activeMarkets };
        writeStoredUser(currentUser);
        syncRegisteredUser(currentUser);
      }
    }
  }

  if (categoryFilter && state.category && [...categoryFilter.options].some((option) => option.value === state.category)) {
    categoryFilter.value = state.category;
  }
  if (signalFilter && state.signal && [...signalFilter.options].some((option) => option.value === state.signal)) {
    signalFilter.value = state.signal;
  }
  if (searchInput && typeof state.search === "string") {
    searchInput.value = state.search;
    if (liteSearchInput) liteSearchInput.value = state.search;
  }
  if (sortField && state.sortField && [...sortField.options].some((option) => option.value === state.sortField)) {
    sortField.value = state.sortField;
  }
  if (sortDirection && state.sortDirection && [...sortDirection.options].some((option) => option.value === state.sortDirection)) {
    sortDirection.value = state.sortDirection;
  }
  if (state.selectedTicker && stocks.some((stock) => stock.ticker === state.selectedTicker)) {
    selectedTicker = state.selectedTicker;
  }
  if (state.chartRange && chartRanges[state.chartRange]) {
    chartRange = state.chartRange;
  }

  rangeTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.range === chartRange);
  });

  requestAnimationFrame(() => {
    const openIds = Array.isArray(state.openTopbarPanes) ? new Set(state.openTopbarPanes) : null;
    if (openIds) {
      topbarQuickPanes.forEach((pane) => {
        pane.open = pane.id ? openIds.has(pane.id) : false;
      });
    }
    if (Number.isFinite(Number(state.scrollY))) {
      window.scrollTo({ top: Math.max(0, Number(state.scrollY)), left: 0, behavior: "auto" });
    }
  });
}

function stockKey(stock) {
  return `${stock.market}:${stock.ticker}`;
}

function findStockByKey(key) {
  return stocks.find((stock) => stockKey(stock) === key);
}

function isInstalledMobileView() {
  const installed = window.matchMedia("(display-mode: standalone)").matches
    || window.matchMedia("(display-mode: fullscreen)").matches
    || window.matchMedia("(display-mode: minimal-ui)").matches
    || window.navigator.standalone === true
    || document.referrer.startsWith("android-app://");
  const mobile = window.matchMedia("(pointer: coarse)").matches
    || /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
  return installed && mobile;
}

function applyInstalledMobileLayout() {
  document.body.dataset.installedMobile = isInstalledMobileView() ? "true" : "false";
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.dataset.theme = isDark ? "dark" : "light";
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.querySelector(".theme-icon").textContent = isDark ? "☀" : "☾";
  }
  if (themeToggleText) themeToggleText.textContent = isDark ? "Light mode" : "Dark mode";
  localStorage.setItem("dividendTheme", isDark ? "dark" : "light");
  if (selectedStock) drawChart(selectedStock);
}

function switchThemeFast(theme) {
  document.body.classList.add("theme-switching");
  applyTheme(theme);
  requestAnimationFrame(() => {
    document.body.classList.remove("theme-switching");
  });
}

function applyLiteMode(enabled) {
  document.body.dataset.liteMode = enabled ? "on" : "off";
  if (liteModeToggle) {
    liteModeToggle.setAttribute("aria-pressed", String(enabled));
  }
  if (liteModeToggleText) {
    liteModeToggleText.textContent = enabled ? "Full view" : "Lite mode";
  }
  localStorage.setItem("dividendLiteMode", enabled ? "on" : "off");

  if (enabled) {
    if (liteMarketSlot && marketDropdown && marketDropdown.parentElement !== liteMarketSlot) {
      liteMarketSlot.hidden = false;
      liteMarketSlot.appendChild(marketDropdown);
    }
    topbarQuickPanes.forEach((pane) => {
      if (!pane.classList.contains("lite-keep")) pane.open = false;
    });
    if (reportPaneModal && !reportPaneModal.hidden) closeReportPaneModal();
  } else {
    if (marketDropdownHome && marketDropdown && marketDropdown.parentElement !== marketDropdownHome) {
      marketDropdownHome.insertBefore(marketDropdown, marketDropdownHomeNext);
    }
    if (liteMarketSlot) liteMarketSlot.hidden = true;
  }

  if (selectedStock) drawChart(selectedStock);
}

applyInstalledMobileLayout();
window.addEventListener("resize", applyInstalledMobileLayout, { passive: true });
applyTheme(localStorage.getItem("dividendTheme") === "dark" ? "dark" : "light");
applyLiteMode(false);
document.body.removeAttribute("data-view-mode");
localStorage.removeItem("dividendViewMode");

const learningChannels = [
  {
    market: "Nigeria",
    channels: [
      {
        name: "CoachOge",
        note: "Nigerian and foreign stock ideas, portfolio lessons, and beginner-friendly market walkthroughs.",
        url: "https://www.youtube.com/results?search_query=CoachOge+Top+Nigerian+Stock+Picks"
      },
      {
        name: "Money Africa",
        note: "Personal finance and investing education for African investors, including stocks and wealth-building basics.",
        url: "https://www.youtube.com/results?search_query=Money+Africa+how+to+buy+Nigerian+stocks"
      }
    ]
  },
  {
    market: "US",
    channels: [
      {
        name: "The Plain Bagel",
        note: "Clear explanations of stock investing, valuation, dividends, ETFs, and beginner investing mistakes.",
        url: "https://www.youtube.com/results?search_query=The+Plain+Bagel+how+to+buy+stocks"
      },
      {
        name: "Graham Stephan",
        note: "Beginner-friendly US investing, brokerage accounts, index funds, dividend stocks, and portfolio habits.",
        url: "https://www.youtube.com/results?search_query=Graham+Stephan+how+to+buy+stocks"
      }
    ]
  },
  {
    market: "UK",
    channels: [
      {
        name: "Damien Talks Money",
        note: "UK-focused investing, funds, ETFs, pensions, and platform comparisons.",
        url: "https://www.youtube.com/results?search_query=Damien+Talks+Money+UK+investing"
      },
      {
        name: "PensionCraft",
        note: "UK investing education covering funds, ETFs, markets, risk, and long-term portfolio building.",
        url: "https://www.youtube.com/results?search_query=PensionCraft+UK+investing"
      }
    ]
  },
  {
    market: "Canada",
    channels: [
      {
        name: "Brandon Beavis Investing",
        note: "Canadian stock investing, ETFs, dividend portfolios, and brokerage/platform education.",
        url: "https://www.youtube.com/results?search_query=Brandon+Beavis+Canadian+dividend+stocks"
      },
      {
        name: "Canadian in a T-Shirt",
        note: "Canada-focused investing basics, taxes, registered accounts, ETFs, and stock market tutorials.",
        url: "https://www.youtube.com/results?search_query=Canadian+in+a+T-Shirt+how+to+buy+stocks"
      }
    ]
  },
  {
    market: "Europe",
    channels: [
      {
        name: "PensionCraft",
        note: "European market context, ETFs, risk, valuation, and long-term portfolio education.",
        url: "https://www.youtube.com/results?search_query=PensionCraft+European+stocks+investing"
      },
      {
        name: "Ben Felix",
        note: "Evidence-based investing education useful for European dividend and ETF investors.",
        url: "https://www.youtube.com/results?search_query=Ben+Felix+European+investing"
      }
    ]
  },
  {
    market: "Asia",
    channels: [
      {
        name: "The Fifth Person",
        note: "Asian stock research, REITs, dividend investing, and Singapore-market education.",
        url: "https://www.youtube.com/results?search_query=The+Fifth+Person+Asian+dividend+stocks"
      },
      {
        name: "Ziet Invests",
        note: "Asia-focused personal finance, brokerage tutorials, ETFs, and stock investing explainers.",
        url: "https://www.youtube.com/results?search_query=Ziet+Invests+Asian+stocks"
      }
    ]
  },
  {
    market: "Zimbabwe",
    channels: [
      {
        name: "ZSE Direct",
        note: "Zimbabwe Stock Exchange investing education, listings, market updates, and platform guidance.",
        url: "https://www.youtube.com/results?search_query=ZSE+Direct+how+to+buy+shares"
      },
      {
        name: "Zimbabwe Stock Exchange",
        note: "Official ZSE market education, exchange updates, listed company information, and investor events.",
        url: "https://www.youtube.com/results?search_query=Zimbabwe+Stock+Exchange+investor+education"
      }
    ]
  }
];

const ukHighYieldSavings = [
  ["Zopa Regular Saver", "7.1% AER variable", "Requires Zopa Biscuit current account; save up to GBP 300/month; six-month term; withdrawals allowed."],
  ["First Direct Regular Saver", "7% AER fixed", "Requires First Direct banking; save up to GBP 300/month; one-year term; no penalty-free withdrawals."],
  ["Co-operative Bank Regular Saver", "7% AER variable", "Existing-customer regular saver; save up to GBP 250/month; one-year term; withdrawals allowed."],
  ["Nationwide Regular Saver", "6.5% AER variable", "Existing-customer account; save up to GBP 200/month; one-year term; limited withdrawals."],
  ["Lloyds Club Monthly Saver", "6.25% AER fixed", "Requires Club Lloyds account; save up to GBP 400/month; one-year term; withdrawals allowed."],
  ["Monmouthshire Building Society Regular Saver", "6% AER variable", "Open-to-all regular saver except Northern Ireland residents; save up to GBP 500/month; 12-month term."],
  ["Mansfield Building Society Regular Saver", "6% AER variable", "Regular saver; save up to GBP 500/month; 12-month term; limited withdrawals."],
  ["Scottish Building Society Regular Saver", "6% AER variable", "Regular saver; save up to GBP 250/month; 12-month term; minimum balance conditions apply."]
];

function formatMoney(stock, value = stock.price) {
  const countryCurrency = {
    Nigeria: "₦",
    UK: "£",
    US: "$",
    Canada: "C$",
    Europe: stock.currency === "CHF" ? "Fr." : "€",
    Asia: stock.currency === "JPY" ? "¥" : "$",
    Zimbabwe: "Z$"
  };
  const currencySymbols = {
    NGN: "₦",
    GBP: "£",
    USD: "$",
    CAD: "C$",
    EUR: "€",
    CHF: "Fr.",
    JPY: "¥",
    ZWL: "Z$"
  };
  const currency = countryCurrency[stock.market] || currencySymbols[stock.currency] || "$";
  return `${currency} ${value.toLocaleString(undefined, { maximumFractionDigits: value > 100 ? 0 : 2 })}`;
}

function formatDividendAmount(stock, entry) {
  const amount = Number(entry?.amount);
  if (!Number.isFinite(amount) || amount <= 0) return "Amount not available";
  const currency = entry?.currency || stock.dividendCurrency || stock.currency;
  if (currency === "GBp") {
    return `${amount.toLocaleString(undefined, { maximumFractionDigits: amount > 100 ? 0 : 2 })}p`;
  }
  if (currency === "US cents") {
    return `${amount.toLocaleString(undefined, { maximumFractionDigits: amount > 100 ? 0 : 4 })} US cents`;
  }
  const symbol = currencySymbolFor(currency);
  return `${symbol} ${amount.toLocaleString(undefined, { maximumFractionDigits: amount > 100 ? 0 : 4 })}`;
}

function currencySymbolFor(currency = "USD") {
  const currencySymbols = {
    NGN: "₦",
    GBP: "£",
    USD: "$",
    CAD: "C$",
    EUR: "€",
    CHF: "Fr.",
    JPY: "¥",
    ZWL: "Z$"
  };
  return currencySymbols[currency] || currency || "$";
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (!Number.isFinite(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function formatDateOrText(value) {
  if (!value) return "Not available";
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return formatDate(text);
  if (/^\d{4}-\d{2}-\d{2} to \d{4}-\d{2}-\d{2}$/.test(text)) {
    return text.split(" to ").map(formatDate).join(" to ");
  }
  return text;
}

function formatMarketCap(value, currency = "USD") {
  if (!value || !Number.isFinite(Number(value))) return "Not available";
  const amount = Number(value);
  const currencySymbols = {
    NGN: "₦",
    GBP: "£",
    USD: "$",
    CAD: "C$",
    EUR: "€",
    CHF: "Fr.",
    JPY: "¥",
    ZWL: "Z$"
  };
  const symbol = currencySymbols[currency] || currency || "$";
  if (amount >= 1000000000000) return `${symbol} ${(amount / 1000000000000).toFixed(2)}T`;
  if (amount >= 1000000000) return `${symbol} ${(amount / 1000000000).toFixed(2)}B`;
  if (amount >= 1000000) return `${symbol} ${(amount / 1000000).toFixed(2)}M`;
  return `${symbol} ${amount.toLocaleString()}`;
}

function describeBusiness(stock) {
  const category = stock.category.toLowerCase();
  if (category.includes("bank") || category.includes("financial")) return `${stock.name} operates in financial services, including banking, capital markets, lending, payments, asset management, or related shareholder-return businesses.`;
  if (category.includes("technology")) return `${stock.name} is a technology business, typically earning from software, semiconductors, hardware, platforms, cloud services, or digital infrastructure.`;
  if (category.includes("health")) return `${stock.name} operates in healthcare, pharmaceuticals, medical products, insurance, diagnostics, or related health services.`;
  if (category.includes("energy") || category.includes("oil") || category.includes("gas")) return `${stock.name} is in energy, with earnings linked to oil, gas, power, fuels, infrastructure, or energy marketing.`;
  if (category.includes("utility")) return `${stock.name} is a utility-style business, usually tied to electricity, water, gas networks, regulated infrastructure, or essential services.`;
  if (category.includes("real estate") || category.includes("reit")) return `${stock.name} owns, finances, or operates income-producing real estate, where dividends are tied to rental cash flow and financing costs.`;
  if (category.includes("consumer") || category.includes("retail") || category.includes("staples")) return `${stock.name} sells consumer products or services, where dividend strength depends on brand demand, margins, pricing power, and distribution.`;
  if (category.includes("industrial")) return `${stock.name} operates in industrial markets such as manufacturing, engineering, transport, infrastructure, aerospace, or business services.`;
  if (category.includes("material") || category.includes("mining") || category.includes("cement")) return `${stock.name} is tied to materials, mining, construction inputs, chemicals, or commodities, where earnings can be cyclical.`;
  if (category.includes("telecom")) return `${stock.name} provides telecom or communication services, with dividends supported by subscriber revenue, data demand, and network investment discipline.`;
  return `${stock.name} operates in the ${stock.category} industry. Review its annual report, debt level, earnings trend, and dividend cover before buying.`;
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "2-digit" }).format(date);
}

function buildLabels(rangeKey, count) {
  const range = chartRanges[rangeKey] || chartRanges.monthly;
  const labels = [];
  const current = new Date();
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(current);
    if (range.step === "day") date.setDate(current.getDate() - index);
    if (range.step === "week") date.setDate(current.getDate() - index * 7);
    if (range.step === "month") date.setMonth(current.getMonth() - index);
    if (range.step === "year") date.setFullYear(current.getFullYear() - index);
    if (range.step === "quarter") date.setMonth(current.getMonth() - index * 3);
    labels.push(range.step === "year" ? String(date.getFullYear()) : formatShortDate(date));
  }
  return labels;
}

function buildDailyIsoLabels(count) {
  const labels = [];
  const current = new Date();
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(current);
    date.setDate(current.getDate() - index);
    labels.push(date.toISOString().slice(0, 10));
  }
  return labels;
}

function buildRangeHistory(stock, rangeKey) {
  const range = chartRanges[rangeKey] || chartRanges.monthly;
  const liveRange = stock.historyByRange?.[rangeKey];
  if (Array.isArray(liveRange) && liveRange.length >= 3) {
    return liveRange.slice(-range.points);
  }
  if (rangeKey === "monthly") return stock.history.slice(-range.points);

  const seed = [...stock.ticker].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const base = stock.price;
  const points = range.points;
  const volatility = rangeKey === "daily" ? 0.012 : rangeKey === "weekly" ? 0.025 : rangeKey === "yearly" ? 0.08 : 0.045;
  const longTrend = stock.signal === "Buy" ? 0.18 : stock.signal === "Sell" ? -0.08 : 0.07;
  return Array.from({ length: points }, (_, index) => {
    const progress = points === 1 ? 1 : index / (points - 1);
    const wave = Math.sin((seed + index * 11) / 7) * volatility;
    const secondWave = Math.cos((seed + index * 5) / 9) * volatility * 0.5;
    const trend = (progress - 1) * longTrend;
    const value = base * (1 + trend + wave + secondWave);
    return Number(Math.max(value, base * 0.2).toFixed(base > 100 ? 0 : 2));
  });
}

function getChartSeries(stock) {
  const values = buildRangeHistory(stock, chartRange);
  const liveLabels = stock.historyLabelsByRange?.[chartRange];
  return {
    values,
    labels: Array.isArray(liveLabels) && liveLabels.length >= values.length
      ? liveLabels.slice(-values.length).map((label) => formatShortDate(new Date(label)))
      : buildLabels(chartRange, values.length),
    title: chartRanges[chartRange]?.title || chartRanges.monthly.title
  };
}

function liveSymbol(stock) {
  if (stock.market === "US") return `${stock.ticker.toLowerCase()}.us`;
  if (stock.market === "UK") return `${stock.ticker.replace(".", "").toLowerCase()}.uk`;
  if (stock.market === "Canada") return `${stock.ticker.replace(".", "").toLowerCase()}.ca`;
  if (stock.market === "Europe") return `${stock.ticker.replace(".", "").toLowerCase()}.de`;
  if (stock.market === "Asia") return `${stock.ticker.replace(".", "").toLowerCase()}.jp`;
  return "";
}

function parseCsvLine(line) {
  return line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
}

function chunkItems(items, size) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => (
    items.slice(index * size, index * size + size)
  ));
}

async function fetchTextWithCorsFallback(url) {
  const direct = await fetch(url, { cache: "no-store" }).catch(() => null);
  if (direct?.ok) return direct.text();
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const proxy = await fetch(proxyUrl, { cache: "no-store" }).catch(() => null);
  if (proxy?.ok) return proxy.text();
  throw new Error("Quote provider unavailable");
}

async function fetchJsonWithCorsFallback(url) {
  const direct = await fetch(url, { cache: "no-store" }).catch(() => null);
  if (direct?.ok) return direct.json();
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const proxy = await fetch(proxyUrl, { cache: "no-store" }).catch(() => null);
  if (proxy?.ok) return proxy.json();
  throw new Error("Quote provider unavailable");
}

async function fetchStooqQuote(stock) {
  const symbol = liveSymbol(stock);
  if (!symbol) return null;
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(symbol)}&f=sd2t2ohlcv&h&e=csv`;
  const text = await fetchTextWithCorsFallback(url);
  const rows = text.trim().split(/\r?\n/);
  if (rows.length < 2) return null;
  const values = parseCsvLine(rows[1]);
  const close = Number(values[6]);
  if (!Number.isFinite(close) || close <= 0) return null;
  return { price: close, provider: "Stooq delayed quote", time: `${values[1]} ${values[2]}` };
}

async function fetchStooqQuotesBatch(stockGroup) {
  const symbolStocks = stockGroup
    .map((stock) => ({ stock, symbol: liveSymbol(stock) }))
    .filter((item) => item.symbol);
  if (!symbolStocks.length) return new Map();

  const quoteMap = new Map();
  await Promise.allSettled(chunkItems(symbolStocks, 80).map(async (batch) => {
    const symbols = batch.map((item) => item.symbol).join(",");
    const url = `https://stooq.com/q/l/?s=${encodeURIComponent(symbols)}&f=sd2t2ohlcv&h&e=csv`;
    const text = await fetchTextWithCorsFallback(url);
    const rows = text.trim().split(/\r?\n/).slice(1);
    rows.forEach((row, index) => {
      const values = parseCsvLine(row);
      const close = Number(values[6]);
      if (!Number.isFinite(close) || close <= 0) return;
      const stock = batch[index]?.stock;
      if (!stock) return;
      quoteMap.set(`${stock.market}:${stock.ticker}`, {
        price: close,
        provider: "Stooq delayed quote",
        time: `${values[1]} ${values[2]}`
      });
    });
  }));
  return quoteMap;
}

async function fetchStooqHistory(stock, interval = historyIntervalForRange()) {
  const symbol = liveSymbol(stock);
  if (!symbol) return null;
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol)}&i=${encodeURIComponent(interval)}`;
  const text = await fetchTextWithCorsFallback(url);
  const rows = text.trim().split(/\r?\n/).slice(1);
  const points = rows.map((line) => {
    const [date, , , , close] = parseCsvLine(line);
    return { date, close: Number(close) };
  }).filter((row) => row.date && Number.isFinite(row.close) && row.close > 0);
  return points.length >= 3 ? points.slice(-120) : null;
}

const yahooSymbolOverrides = {
  "Europe:NVS": "NOVN.SW",
  "Europe:SAP": "SAP.DE",
  "Europe:TTE": "TTE.PA",
  "Europe:SAN": "SAN.MC",
  "Europe:UBS": "UBSG.SW",
  "Europe:ASML": "ASML.AS",
  "Europe:UL": "UL",
  "Europe:RIO": "RIO.L",
  "Asia:TM": "7203.T",
  "Asia:MUFG": "8306.T",
  "Asia:TSM": "TSM",
  "Asia:HDB": "HDB",
  "Asia:INFY": "INFY"
};

function yahooSymbol(stock) {
  const override = yahooSymbolOverrides[`${stock.market}:${stock.ticker}`];
  if (override) return override;
  const clean = String(stock.ticker || "").replace(/\s+/g, "-");
  if (stock.market === "US") return clean;
  if (stock.market === "UK") return `${clean.replace(".", "-")}.L`;
  if (stock.market === "Canada") return `${clean.replace(".", "-")}.TO`;
  if (stock.market === "Europe") return `${clean.replace(".", "-")}.DE`;
  if (stock.market === "Asia") return stock.currency === "JPY" ? `${clean.replace(".", "-")}.T` : clean;
  return "";
}

function yahooRangeForChart() {
  if (chartRange === "daily") return { range: "1mo", interval: "1d" };
  if (chartRange === "weekly") return { range: "6mo", interval: "1wk" };
  if (chartRange === "yearly") return { range: "10y", interval: "3mo" };
  if (chartRange === "5year") return { range: "5y", interval: "1mo" };
  if (chartRange === "lifetime") return { range: "max", interval: "3mo" };
  return { range: "1y", interval: "1mo" };
}

async function fetchYahooChart(stock) {
  const symbol = yahooSymbol(stock);
  if (!symbol) return null;
  const { range, interval } = yahooRangeForChart();
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const data = await fetchJsonWithCorsFallback(url);
  const result = data?.chart?.result?.[0];
  const price = Number(result?.meta?.regularMarketPrice);
  if (!Number.isFinite(price) || price <= 0) return null;
  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  const history = timestamps.map((timestamp, index) => ({
    date: new Date(timestamp * 1000).toISOString().slice(0, 10),
    close: Number(closes[index])
  })).filter((row) => Number.isFinite(row.close) && row.close > 0);
  return {
    price,
    provider: "Yahoo delayed quote",
    time: result.meta?.regularMarketTime
      ? new Date(result.meta.regularMarketTime * 1000).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
      : "",
    history
  };
}

function liveRefreshInterval() {
  const day = new Date().getDay();
  return day === 0 || day === 6 ? 15 * 60 * 1000 : 60 * 1000;
}

function historyIntervalForRange() {
  if (chartRange === "daily") return "d";
  if (chartRange === "weekly") return "w";
  return "m";
}

async function fetchHostedMarketData(visibleStocks, interval = historyIntervalForRange(), options = {}) {
  if (window.location.protocol === "file:") return null;
  const quotes = {};
  let provider = "";
  let updatedAt = "";
  for (const batch of chunkItems(visibleStocks, 60)) {
    const symbols = batch
      .map((stock) => `${stock.ticker}:${stock.market}`)
      .join(",");
    const dividendFlag = options.dividends ? "&dividends=1" : "";
    const dividendOnlyFlag = options.dividendsOnly ? "&dividendsOnly=1" : "";
    const url = `/api/market-data?interval=${encodeURIComponent(interval)}&symbols=${encodeURIComponent(symbols)}${dividendFlag}${dividendOnlyFlag}`;
    const response = await fetch(url, { cache: "no-store" }).catch(() => null);
    if (!response?.ok) continue;
    const data = await response.json().catch(() => null);
    if (!data?.quotes) continue;
    Object.assign(quotes, data.quotes);
    provider = data.provider || provider;
    updatedAt = data.updatedAt || updatedAt;
  }
  return Object.keys(quotes).length ? { quotes, provider, updatedAt } : null;
}

function applyQuoteToStock(stock, quote) {
  stock.price = Number(quote.price.toFixed(stock.currency === "GBP" && quote.price > 100 ? 0 : 2));
  stock.liveStatus = `${quote.provider}${quote.time ? ` ${quote.time}` : ""}`;
  updateDailyRsiHistoryFromQuote(stock, quote);
  applyDividendDataToStock(stock, quote.dividend);
}

function quoteDateForHistory(quote) {
  const raw = String(quote?.date || quote?.time || "");
  const match = raw.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : new Date().toISOString().slice(0, 10);
}

function updateDailyRsiHistoryFromQuote(stock, quote) {
  const price = Number(quote?.price);
  if (!Number.isFinite(price) || price <= 0) return false;
  const date = quoteDateForHistory(quote);
  const existingValues = Array.isArray(stock.historyByRange?.daily) && stock.historyByRange.daily.length >= 15
    ? stock.historyByRange.daily.slice()
    : buildRangeHistory(stock, "daily").slice();
  const existingLabels = Array.isArray(stock.historyLabelsByRange?.daily) && stock.historyLabelsByRange.daily.length === existingValues.length
    ? stock.historyLabelsByRange.daily.slice()
    : buildDailyIsoLabels(existingValues.length);
  const values = existingValues.slice(-60);
  const labels = existingLabels.slice(-60);
  if (labels[labels.length - 1] === date) {
    values[values.length - 1] = price;
  } else {
    values.push(price);
    labels.push(date);
  }
  stock.historyByRange = { ...(stock.historyByRange || {}), daily: values.slice(-60) };
  stock.historyLabelsByRange = { ...(stock.historyLabelsByRange || {}), daily: labels.slice(-60) };
  return true;
}

function applyHistoryToStock(stock, historyPoints, rangeKey = chartRange) {
  if (!Array.isArray(historyPoints) || historyPoints.length < 3) return;
  const closes = historyPoints.map((row) => row.close).filter((value) => Number.isFinite(value) && value > 0);
  const labels = historyPoints.map((row) => row.date).filter(Boolean);
  if (closes.length < 3) return;
  stock.historyByRange = { ...(stock.historyByRange || {}), [rangeKey]: closes };
  stock.historyLabelsByRange = { ...(stock.historyLabelsByRange || {}), [rangeKey]: labels };
  if (rangeKey === "monthly") {
    stock.history = closes.slice(-120);
  }
}

function dividendDataSource(stock) {
  return stock.dividendDataStatus || "Curated fallback schedule; confirm with the official exchange, company investor-relations page, or broker before trading.";
}

function compactDividendSourceLabel(value = "") {
  const text = String(value || "").trim();
  const lower = text.toLowerCase();
  if (!text) return "";
  if (lower.includes("ngx pulse") || lower.includes("ngxpulse")) return "Pulse 2026";
  if (lower.includes("stockanalysis")) return "StockAnalysis";
  if (lower.includes("yahoo")) return "Yahoo Finance";
  if (lower.includes("investing.com")) return "Investing.com";
  if (lower.includes("tradingview")) return "TradingView";
  if (lower.includes("dividenddata.co.uk")) return "DividendData";
  if (lower.includes("dividendmax")) return "DividendMax";
  if (lower.includes("dividend.com")) return "Dividend.com";
  if (lower.includes("dividend channel")) return "Dividend Channel";
  if (lower.includes("dividendhistory")) return "DividendHistory";
  if (lower.includes("proshare")) return "Proshare";
  if (lower.includes("nairametrics")) return "Nairametrics";
  if (lower.includes("afrinvest")) return "Afrinvest";
  if (lower.includes("african markets") || lower.includes("african-markets")) return "African Markets";
  if (lower.includes("africanfinancials")) return "AfricanFinancials";
  if (lower.includes("ngx official") || lower.includes("ngx disclosure") || lower.includes("doclib.ngxgroup")) return "NGX disclosure";
  if (lower.includes("investor relations")) return text.replace(/\s+investor relations.*$/i, " IR");
  return text
    .replace(/^NGX Pulse 2026 Nigerian dividend tracker$/i, "Pulse 2026")
    .replace(/^NGX Pulse 2026 dividend table$/i, "Pulse 2026")
    .replace(/^StockAnalysis public dividend page$/i, "StockAnalysis")
    .replace(/^Free public Yahoo dividend-event history$/i, "Yahoo Finance");
}

function dividendSourceName(stock) {
  if (Array.isArray(stock.dividendEvidence) && stock.dividendEvidence.length) {
    const labels = stock.dividendEvidence
      .map((source) => source.name || source.url)
      .filter(Boolean)
      .map(compactDividendSourceLabel)
      .filter(Boolean)
      .filter((value, index, list) => list.indexOf(value) === index);
    if (labels.includes("Pulse 2026")) return "Pulse 2026";
    return labels[0] || "Verified source";
  }
  const status = String(stock.dividendDataStatus || "");
  const provider = status.includes(":") ? status.split(":")[0].trim() : status;
  return compactDividendSourceLabel(provider) || "Curated fallback";
}

function applyDividendDataToStock(stock, dividend) {
  if (!dividend || typeof dividend !== "object") return false;
  let changed = false;

  if (dividend.exDate) {
    stock.exDate = dividend.exDate;
    stock.verifiedDividendDates = { ...(stock.verifiedDividendDates || {}), exDate: true };
    changed = true;
  }
  if (dividend.recordDate) {
    stock.recordDate = dividend.recordDate;
    stock.verifiedDividendDates = { ...(stock.verifiedDividendDates || {}), recordDate: true };
    changed = true;
  }
  if (dividend.payDate) {
    stock.payDate = dividend.payDate;
    stock.verifiedDividendDates = { ...(stock.verifiedDividendDates || {}), payDate: true };
    stock.paymentDateUnavailable = false;
    changed = true;
  }
  if (dividend.nextDeclared && dividend.paymentDateKnown === false) {
    stock.paymentDateUnavailable = true;
    if (!dividend.payDate) stock.payDate = "Not available from free source";
    changed = true;
  }
  if (Number(dividend.amount) > 0) {
    stock.lastDividendAmount = Number(dividend.amount);
    changed = true;
  }
  if (dividend.currency) {
    stock.dividendCurrency = dividend.currency;
  }
  if (Array.isArray(dividend.history) && dividend.history.length) {
    stock.verifiedDividendHistory = dividend.history.map((entry) => ({
      ...entry,
      currency: entry.currency || dividend.currency || stock.dividendCurrency || stock.currency
    }));
    changed = true;
  }
  if (!stock.verifiedDividendHistory && (dividend.exDate || dividend.payDate || Number(dividend.amount) > 0)) {
    stock.verifiedDividendHistory = [{
      exDate: dividend.exDate || "",
      recordDate: dividend.recordDate || "",
      payDate: dividend.payDate || "",
      amount: Number(dividend.amount) || 0,
      label: dividend.type ? `${dividend.type} dividend` : "Verified dividend event"
    }];
    changed = true;
  }
  if (dividend.closureOfRegister) stock.closureOfRegister = dividend.closureOfRegister;
  if (dividend.agmDate) stock.agmDate = dividend.agmDate;
  if (dividend.registrar) stock.registrar = dividend.registrar;
  if (dividend.sourceUrl) stock.dividendSourceUrl = dividend.sourceUrl;
  if (Array.isArray(dividend.evidence) && dividend.evidence.length) stock.dividendEvidence = dividend.evidence;
  if (typeof dividend.aiChecked === "boolean") stock.dividendAiChecked = dividend.aiChecked;
  if (dividend.aiModel) stock.dividendAiModel = dividend.aiModel;
  if (Number.isFinite(Number(dividend.aiConfidence))) stock.dividendAiConfidence = Number(dividend.aiConfidence);

  const providerText = dividend.provider || "Dividend data provider";
  const verifiedText = dividend.verifiedAt ? ` on ${formatDate(dividend.verifiedAt)}` : "";
  if (dividend.nextDeclared && (dividend.partialDateData || dividend.paymentDateKnown === false)) {
    stock.dividendDataStatus = `${providerText}: qualification date verified${verifiedText}; payment date is not available from this free source.`;
  } else {
    stock.dividendDataStatus = dividend.nextDeclared
      ? `${providerText}: upcoming qualification/payment dates verified${verifiedText}.`
      : `${providerText}: recent dividend event history verified; next qualification/payment date still needs an official declaration or a paid corporate-actions feed.`;
  }
  if (dividend.note) stock.dividendDataNote = dividend.note;
  return changed;
}

function verifiedEvidenceLabel(stock) {
  if (stock.dividendVerificationStatus) return stock.dividendVerificationStatus;
  if (stock.dividendAiChecked) {
    const score = Number.isFinite(stock.dividendAiConfidence) && stock.dividendAiConfidence > 0
      ? ` Confidence ${stock.dividendAiConfidence}/100.`
      : "";
    return `AI checked the dividend data against source evidence.${score}`;
  }
  return "";
}

function renderVerifiedStockAfterUpdate(stock) {
  if (stockKey(stock) === stockKey(selectedStock)) {
    renderDetail(stock);
    renderList();
  } else {
    renderUtilityPanes(selectedStock);
  }
}

function cacheDividendVerification(key, payload) {
  dividendVerificationCache = {
    ...dividendVerificationCache,
    [key]: {
      ...payload,
      cachedAt: new Date().toISOString()
    }
  };
  writeJson("dividendVerificationCache", dividendVerificationCache);
}

function actualDividendDate(value) {
  if (!value || typeof value !== "string") return new Date(NaN);
  const text = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return new Date(NaN);
  return new Date(`${text}T00:00:00`);
}

function hasDatePassed(value) {
  const date = actualDividendDate(value);
  if (!Number.isFinite(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function dividendCycleDatesHavePassed(source = {}) {
  const qualificationDate = source.exDate || source.qualificationDate || "";
  const paymentDate = source.payDate || source.paymentDate || "";
  return hasDatePassed(qualificationDate) && hasDatePassed(paymentDate);
}

function cachedVerificationNeedsRefresh(cached) {
  if (!cached || !cached.dividend) return false;
  return dividendCycleDatesHavePassed(cached.dividend);
}

function applyCachedDividendVerification(stock) {
  const key = stockKey(stock);
  const cached = dividendVerificationCache[key];
  if (!cached) return false;
  if (cachedVerificationNeedsRefresh(cached)) {
    delete dividendVerificationCache[key];
    writeJson("dividendVerificationCache", dividendVerificationCache);
    stock.dividendVerifiedOnce = false;
    return false;
  }
  if (cached.dividend) {
    applyDividendDataToStock(stock, cached.dividend);
  }
  stock.dividendVerifiedOnce = true;
  stock.dividendVerificationStatus = cached.status || (cached.dividend
    ? "Verified dividend evidence already checked for this stock. It will check again after the qualification and payment dates pass."
    : "Dividend evidence already checked; no verified update was found.");
  renderVerifiedStockAfterUpdate(stock);
  return true;
}

function scheduleStockDividendVerification(stock) {
  if (!stock) return;
  window.clearTimeout(dividendVerificationTimer);
  if (dividendVerificationController) {
    dividendVerificationController.abort();
    dividendVerificationController = null;
  }

  if (window.location.protocol === "file:" && stock.dividendVerifiedOnce) return;

  if (stock.dividendVerifiedOnce && !dividendCycleDatesHavePassed(stock)) {
    stock.dividendVerificationStatus = stock.dividendVerificationStatus || "Verified dividend evidence already checked for this stock. It will check again after the qualification and payment dates pass.";
    renderVerifiedStockAfterUpdate(stock);
    return;
  }

  if (applyCachedDividendVerification(stock)) {
    return;
  }

  stock.dividendVerificationStatus = window.location.protocol === "file:"
    ? "Verified from loaded public dividend files where available."
    : "Checking dividend evidence for this stock...";
  renderVerifiedStockAfterUpdate(stock);

  if (window.location.protocol === "file:") {
    stock.dividendVerifiedOnce = true;
    return;
  }

  dividendVerificationTimer = window.setTimeout(() => {
    verifyOpenedStockDividend(stock);
  }, 1000);
}

async function verifyOpenedStockDividend(stock) {
  const key = stockKey(stock);
  dividendVerificationController = new AbortController();
  const timeout = window.setTimeout(() => dividendVerificationController?.abort(), 12000);
  try {
    const url = `/api/verify-dividend?market=${encodeURIComponent(stock.market)}&ticker=${encodeURIComponent(stock.ticker)}&name=${encodeURIComponent(stock.name)}`;
    const response = await fetch(url, {
      cache: "no-store",
      signal: dividendVerificationController.signal
    });
    if (!response.ok) throw new Error("Dividend verifier unavailable");
    const data = await response.json();
    const target = stocks.find((item) => stockKey(item) === key);
    if (!target) return;
    if (data?.dividend) {
      applyDividendDataToStock(target, data.dividend);
      target.dividendVerificationStatus = data.dividend.aiChecked
        ? "AI checked this stock against verified dividend evidence."
        : "Verified dividend evidence checked for this stock.";
      target.dividendVerifiedOnce = true;
      cacheDividendVerification(key, {
        dividend: data.dividend,
        status: target.dividendVerificationStatus
      });
    } else {
      target.dividendVerificationStatus = data?.message || "No verified dividend evidence found for this stock.";
      target.dividendVerifiedOnce = true;
      cacheDividendVerification(key, {
        dividend: null,
        status: target.dividendVerificationStatus
      });
    }
    renderVerifiedStockAfterUpdate(target);
  } catch (error) {
    const target = stocks.find((item) => stockKey(item) === key);
    if (target) {
      target.dividendVerificationStatus = error.name === "AbortError"
        ? "Dividend verification timed out; keeping the last verified data."
        : "Dividend verifier could not run; keeping the last verified data.";
      renderVerifiedStockAfterUpdate(target);
    }
  } finally {
    window.clearTimeout(timeout);
    dividendVerificationController = null;
  }
}

function dividendSweepPriority(stock) {
  let priority = 0;
  const key = stockKey(stock);
  if (selectedStock && stockKey(selectedStock) === key) priority += 5000;
  if (watchlistKeys.includes(key)) priority += 3000;
  if (portfolioHoldings[key]) priority += 2500;
  if (!hasVerifiedDividendDate(stock, "exDate", stock.exDate)) priority += 1200;
  if (!hasVerifiedDividendDate(stock, "payDate", stock.payDate)) priority += 900;
  if (dividendCycleDatesHavePassed(stock)) priority += 800;
  const daysToQualification = daysUntil(stock.exDate);
  const daysToPayment = daysUntil(stock.payDate);
  if (Number.isFinite(daysToQualification) && daysToQualification >= 0 && daysToQualification <= 120) {
    priority += 600 - daysToQualification;
  }
  if (Number.isFinite(daysToPayment) && daysToPayment >= 0 && daysToPayment <= 120) {
    priority += 400 - daysToPayment;
  }
  return priority;
}

function buildHostedDividendSweepUniverse() {
  const source = stocksForSelectedMarkets()
    .filter((stock) => {
      if (!stock) return false;
      if (!stock.exDate || !stock.payDate) return true;
      if (dividendCycleDatesHavePassed(stock)) return true;
      const nextDays = daysUntil(stock.exDate);
      return !Number.isFinite(nextDays) || nextDays <= 180;
    })
    .sort((a, b) => {
      const priorityGap = dividendSweepPriority(b) - dividendSweepPriority(a);
      if (priorityGap !== 0) return priorityGap;
      return `${a.market}:${a.ticker}`.localeCompare(`${b.market}:${b.ticker}`);
    });
  return [...new Map(source.map((stock) => [stockKey(stock), stock])).values()];
}

function takeHostedDividendSweepBatch(source, manual = false) {
  if (!source.length) return [];
  if (manual) return source;
  const batchSize = hostedDividendSweepBatchSize * hostedDividendSweepBatchCount;
  if (hostedDividendSweepCursor >= source.length) hostedDividendSweepCursor = 0;
  let batch = source.slice(hostedDividendSweepCursor, hostedDividendSweepCursor + batchSize);
  if (!batch.length) {
    hostedDividendSweepCursor = 0;
    batch = source.slice(0, batchSize);
  }
  hostedDividendSweepCursor = (hostedDividendSweepCursor + batch.length) % source.length;
  return batch;
}

async function refreshHostedDividendSweep(manual = false) {
  if (window.location.protocol === "file:" || hostedDividendSweepInFlight) {
    return { refreshed: false, checked: 0, updated: 0 };
  }

  const universe = buildHostedDividendSweepUniverse();
  const sweepStocks = takeHostedDividendSweepBatch(universe, manual);
  if (!sweepStocks.length) return { refreshed: false, checked: 0, updated: 0 };

  hostedDividendSweepInFlight = true;
  try {
    const hostedData = await fetchHostedMarketData(sweepStocks, "m", {
      dividends: true,
      dividendsOnly: true
    }).catch(() => null);

    if (!hostedData?.quotes) {
      return { refreshed: false, checked: sweepStocks.length, updated: 0 };
    }

    let updated = 0;
    sweepStocks.forEach((stock) => {
      const quote = hostedData.quotes[`${stock.market}:${stock.ticker}`];
      if (!quote?.dividend) return;
      if (applyDividendDataToStock(stock, quote.dividend)) {
        updated += 1;
      }
    });

    if (updated) {
      rerenderDividendSurfaces();
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (lastUpdated) {
        lastUpdated.textContent = `${updated} dividend records refreshed from live public sources at ${time}`;
      }
    }

    return { refreshed: updated > 0, checked: sweepStocks.length, updated };
  } finally {
    hostedDividendSweepInFlight = false;
  }
}

async function refreshSelectedRsiHistory() {
  const stock = stocks.find((item) => item.ticker === selectedTicker) || selectedStock;
  if (!stock) return 0;
  if (window.location.protocol !== "file:") {
    const hostedDaily = await fetchHostedMarketData([stock], "d").catch(() => null);
    const quote = hostedDaily?.quotes?.[`${stock.market}:${stock.ticker}`];
    if (quote) {
      applyQuoteToStock(stock, quote);
      if (Array.isArray(quote.history) && quote.history.length >= 15) {
        applyHistoryToStock(stock, quote.history, "daily");
        return 1;
      }
    }
  }
  const dailyHistory = await fetchStooqHistory(stock, "d").catch(() => null);
  if (Array.isArray(dailyHistory) && dailyHistory.length >= 15) {
    applyHistoryToStock(stock, dailyHistory, "daily");
    return 1;
  }
  return 0;
}

async function refreshLivePrices(manual = false) {
  refreshPrices.disabled = true;
  refreshPrices.textContent = "Updating...";
  let updated = 0;
  let chartUpdates = 0;
  let dividendUpdates = 0;
  const filteredStocks = getFilteredStocks();
  const autoLimit = window.location.protocol === "file:" ? 120 : filteredStocks.length;
  const visibleStocks = manual ? filteredStocks : filteredStocks.slice(0, autoLimit);
  const includeDividendData = manual;

  const hostedData = await fetchHostedMarketData(visibleStocks, historyIntervalForRange(), {
    dividends: includeDividendData
  }).catch(() => null);
  if (hostedData?.quotes) {
    visibleStocks.forEach((stock) => {
      const quote = hostedData.quotes[`${stock.market}:${stock.ticker}`];
      if (!quote) return;
      applyQuoteToStock(stock, quote);
      if (quote.dividend) dividendUpdates += 1;
      if (Array.isArray(quote.history) && quote.history.length >= 3) {
        applyHistoryToStock(stock, quote.history, chartRange);
        chartUpdates += 1;
      }
      updated += 1;
    });
  }

  if (!hostedData) {
    const quoteMap = await fetchStooqQuotesBatch(visibleStocks).catch(() => new Map());
    const updatedKeys = new Set();
    visibleStocks.forEach((stock) => {
      const key = `${stock.market}:${stock.ticker}`;
      const quote = quoteMap.get(key);
      if (!quote) return;
      applyQuoteToStock(stock, quote);
      updatedKeys.add(key);
      updated += 1;
    });

    const yahooFallbackStocks = visibleStocks
      .filter((stock) => !updatedKeys.has(`${stock.market}:${stock.ticker}`) && yahooSymbol(stock))
      .slice(0, manual ? visibleStocks.length : 40);
    for (const batch of chunkItems(yahooFallbackStocks, 25)) {
      if (manual) {
        refreshPrices.textContent = `Updating ${Math.min(updated + batch.length, visibleStocks.length)}/${visibleStocks.length}...`;
      }
      await Promise.allSettled(batch.map(async (stock) => {
        const quote = await fetchYahooChart(stock).catch(() => null);
        if (!quote) return;
        applyQuoteToStock(stock, quote);
        if (quote.history?.length >= 3) {
          applyHistoryToStock(stock, quote.history, chartRange);
          chartUpdates += 1;
        }
        updated += 1;
        updatedKeys.add(`${stock.market}:${stock.ticker}`);
      }));
    }

    const chartStocks = [
      stocks.find((stock) => stock.ticker === selectedTicker),
      ...visibleStocks.slice(0, manual ? 40 : 12)
    ].filter(Boolean);
    const uniqueChartStocks = [...new Map(chartStocks.map((stock) => [`${stock.market}:${stock.ticker}`, stock])).values()];
    await Promise.allSettled(uniqueChartStocks.map(async (stock) => {
      if (stock.historyByRange?.[chartRange]?.length >= 3) return;
      const history = await fetchStooqHistory(stock).catch(() => null);
      if (!history) return;
      applyHistoryToStock(stock, history, chartRange);
      chartUpdates += 1;
    }));
  }

  const rsiUpdates = await refreshSelectedRsiHistory();
  const snapshotRefresh = manual ? await refreshHostedStaticDividendSnapshots().catch(() => ({ refreshed: false, rows: 0 })) : { refreshed: false, rows: 0 };
  dividendUpdates += Number(snapshotRefresh.rows || 0);

  if (updated === 0 && rsiUpdates === 0 && dividendUpdates === 0) {
    if (lastUpdated) lastUpdated.textContent = "Live update unavailable; using curated data";
  } else {
    const now = new Date();
    const day = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const skipped = Math.max(0, visibleStocks.length - updated);
    const refreshSummary = updated > 0
      ? `${updated} prices, ${chartUpdates} charts, ${dividendUpdates} dividend records and RSI refreshed`
      : "RSI refreshed";
    if (lastUpdated) lastUpdated.textContent = `${refreshSummary} for ${day} at ${time}${updated > 0 && skipped ? `; ${skipped} kept curated` : ""}`;
  }

  refreshPrices.disabled = false;
  refreshPrices.textContent = "Refresh live prices";
  rerenderDividendSurfaces();
}

function populateCategories() {
  const categories = [...new Set(stocks.map((stock) => stock.category))].sort();
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function profileMarketsFromUser(user = currentUser) {
  const countries = Array.isArray(user?.countries) ? user.countries : [];
  const selected = allMarkets.filter((market) => countries.includes(market));
  return selected.length ? selected : [...allMarkets];
}

function selectedMarketsForDashboard() {
  return activeMarkets.length ? activeMarkets : profileMarketsFromUser();
}

function stocksForSelectedMarkets() {
  const selectedMarkets = selectedMarketsForDashboard();
  return stocks.filter((stock) => selectedMarkets.includes(stock.market));
}

function populateMarketFilter() {
  const markets = allMarkets;
  const savedMarkets = Array.isArray(currentUser?.visibleMarkets)
    ? markets.filter((market) => currentUser.visibleMarkets.includes(market))
    : null;
  const profileMarkets = profileMarketsFromUser();
  const previous = activeMarkets.length
    ? new Set(activeMarkets)
    : new Set(savedMarkets?.length ? savedMarkets : profileMarkets);
  activeMarkets = markets.filter((market) => previous.has(market));
  if (!activeMarkets.length) {
    activeMarkets = [...profileMarkets];
  }
  if (currentUser && !savedMarkets?.length) {
    currentUser = { ...currentUser, visibleMarkets: activeMarkets };
    writeStoredUser(currentUser);
    syncRegisteredUser(currentUser);
    queueHostedProfileSync({ visibleMarkets: activeMarkets }, 150);
  }

  marketMenu.innerHTML = markets.map((market) => `
    <label>
      <span>${marketLabels[market] || market}</span>
      <input type="checkbox" name="visibleMarket" value="${market}" ${activeMarkets.includes(market) ? "checked" : ""}>
    </label>
  `).join("");
  updateMarketSummary();
}

function selectedMarketLabels() {
  const selected = selectedMarketsForDashboard();
  return selected.map((market) => marketLabels[market] || market);
}

function updateMarketSummary() {
  const labels = selectedMarketLabels();
  marketSummary.textContent = labels.length > 3
    ? `${labels.slice(0, 3).join(", ")} +${labels.length - 3}`
    : labels.join(", ");
}

async function hashPassword(password) {
  if (!crypto.subtle) {
    return btoa(unescape(encodeURIComponent(password))).split("").reverse().join("");
  }
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function signupPageUrl() {
  return "signin.html";
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("dividendProfileUser")) || null;
  } catch {
    return null;
  }
}

function writeStoredUser(user) {
  localStorage.setItem("dividendProfileUser", JSON.stringify(user));
}

function normalizeUserKey(value) {
  return String(value || "").trim().toLowerCase();
}

function syncRegisteredUser(user) {
  if (usesHostedSharedAccounts || !user) return;
  if (!user) return;
  const users = readJson(usersStorageKey, []);
  const list = Array.isArray(users) ? users : [];
  const key = normalizeUserKey(user.email) || normalizeUserKey(user.username);
  const next = list.filter((item) => {
    const itemKey = normalizeUserKey(item.email) || normalizeUserKey(item.username);
    return itemKey !== key;
  });
  next.push(user);
  writeJson(usersStorageKey, next);
}

function registeredUserMatch(user) {
  if (usesHostedSharedAccounts || !user) return null;
  if (!user) return null;
  const users = readJson(usersStorageKey, []);
  const list = Array.isArray(users) ? users : [];
  const email = normalizeUserKey(user.email);
  const username = normalizeUserKey(user.username);
  return list.find((item) =>
    (email && normalizeUserKey(item.email) === email) ||
    (username && normalizeUserKey(item.username) === username)
  ) || null;
}

function displayName(name) {
  return String(name || "Investor")
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
  if (!hasAccessDate) {
    next.paidUntil = addDays(new Date(createdAt), freeTrialDays).toISOString();
  } else {
    next.paidUntil = user.paidUntil || user.accessUntil;
  }
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

function isAccessActive(user) {
  return daysLeftForUser(user) > 0;
}

function isUserLocked(user) {
  const registered = registeredUserMatch(user);
  return Boolean(user?.isLocked || registered?.isLocked);
}

function setPaymentStatus(tone, message) {
  if (!paymentStatus) return;
  paymentStatus.className = `contact-status ${tone}`;
  paymentStatus.textContent = message;
}

function showPaymentModal() {
  if (appMain) appMain.classList.add("app-locked");
  if (paymentModal) {
    paymentModal.hidden = false;
    paymentModal.style.display = "grid";
  }
}

function hidePaymentModal() {
  if (appMain) appMain.classList.remove("app-locked");
  if (paymentModal) {
    paymentModal.hidden = true;
    paymentModal.style.display = "none";
  }
}

async function logoutExpiredUser(user) {
  const expiredUser = {
    ...user,
    lastSeenAt: new Date().toISOString(),
    loggedOutAt: new Date().toISOString()
  };
  await pushHostedProfileNow(expiredUser, {
    lastSeenAt: expiredUser.lastSeenAt,
    loggedOutAt: expiredUser.loggedOutAt,
    logoutReason: "Access expired"
  });
  syncRegisteredUser(expiredUser);
  redirectToSignin("Your access has expired. Please choose a plan below to regain access.");
}

async function logoutLockedUser(user) {
  const lockedUser = {
    ...ensureAccessFields({ ...user, ...registeredUserMatch(user), isLocked: true }),
    lastSeenAt: new Date().toISOString(),
    loggedOutAt: new Date().toISOString(),
    logoutReason: "Account unavailable"
  };
  await pushHostedProfileNow(lockedUser, {
    lastSeenAt: lockedUser.lastSeenAt,
    loggedOutAt: lockedUser.loggedOutAt,
    logoutReason: lockedUser.logoutReason
  });
  syncRegisteredUser(lockedUser);
  redirectToSignin("This account is unavailable. Contact support for help.");
}

async function logoutInactiveUser() {
  const user = readStoredUser();
  if (!user) return;
  const inactiveUser = {
    ...ensureAccessFields(user),
    lastSeenAt: new Date().toISOString(),
    lastActivityAt: localStorage.getItem("dividendLastActivityAt") || new Date().toISOString(),
    loggedOutAt: new Date().toISOString(),
    logoutReason: "Inactive for 1 hour"
  };
  await pushHostedProfileNow(inactiveUser, {
    lastSeenAt: inactiveUser.lastSeenAt,
    lastActivityAt: inactiveUser.lastActivityAt,
    loggedOutAt: inactiveUser.loggedOutAt,
    logoutReason: inactiveUser.logoutReason
  });
  syncRegisteredUser(inactiveUser);
  redirectToSignin("You were logged out after 1 hour of inactivity.");
}

async function logoutCurrentUser() {
  const user = readStoredUser();
  if (user) {
    const loggedOutUser = {
      ...ensureAccessFields(user),
      lastSeenAt: new Date().toISOString(),
      loggedOutAt: new Date().toISOString(),
      logoutReason: "Manual logout"
    };
    await pushHostedProfileNow(loggedOutUser, {
      lastSeenAt: loggedOutUser.lastSeenAt,
      loggedOutAt: loggedOutUser.loggedOutAt,
      logoutReason: loggedOutUser.logoutReason
    });
    syncRegisteredUser(loggedOutUser);
  }
  redirectToSignin("You have been logged out.");
}

function resetInactivityTimer() {
  if (!readStoredUser()) return;
  localStorage.setItem("dividendLastActivityAt", new Date().toISOString());
  window.clearTimeout(inactivityTimer);
  inactivityTimer = window.setTimeout(() => {
    void logoutInactiveUser();
  }, inactivityLimitMs);
}

function startInactivityLogout() {
  ["click", "keydown", "scroll", "pointermove", "touchstart"].forEach((eventName) => {
    document.addEventListener(eventName, resetInactivityTimer, { passive: true });
  });
  resetInactivityTimer();
}

async function checkAccessStillActive() {
  const user = readStoredUser();
  if (!user) return;
  const accessUser = ensureAccessFields(user);
  if (isUserLocked(accessUser)) {
    await logoutLockedUser(accessUser);
    return;
  }
  if (!isAccessActive(accessUser)) {
    await logoutExpiredUser(accessUser);
  }
}

async function enforceStoredSession() {
  if (!readStoredUser()) {
    window.location.href = signupPageUrl();
    return;
  }
  await checkAccessStillActive();
}

function setContactStatus(tone, message) {
  if (!contactUsStatus) return;
  contactUsStatus.className = `contact-status ${tone}`;
  contactUsStatus.textContent = message;
}

function isEmailLike(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function prefillContactForm() {
  if (!contactUserName || !contactUserEmail || !contactSubject) return;
  const user = currentUser || readStoredUser() || {};
  contactUserName.value = user.username || "";
  contactUserEmail.value = user.email || "";
  if (!contactSubject.value.trim()) {
    contactSubject.value = "Dividend Stock Tracker support";
  }
  setContactStatus("neutral", "Tell us what you need help with, then send your message.");
}

let activeReportContent = null;

function restoreActiveReportContent() {
  if (!activeReportContent || !reportContentShelf) return;
  activeReportContent.hidden = true;
  reportContentShelf.append(activeReportContent);
  activeReportContent = null;
}

function openReportPaneModal(button) {
  if (!button || !reportPaneModal || !reportPaneModalBody) return;
  const key = button.dataset.reportPane;
  const source = document.querySelector(`[data-report-content="${key}"]`);
  if (!source) return;
  restoreActiveReportContent();
  activeReportContent = source;
  if (reportPaneModalTitle) reportPaneModalTitle.textContent = button.dataset.reportTitle || button.textContent.trim();
  source.hidden = false;
  reportPaneModalBody.replaceChildren(source);
  reportPaneModal.hidden = false;
  reportPaneModal.style.display = "grid";
  closeReportPaneModalBtn?.focus({ preventScroll: true });
}

function closeReportPaneModal() {
  if (!reportPaneModal || !reportPaneModalBody) return;
  restoreActiveReportContent();
  reportPaneModalBody.replaceChildren();
  reportPaneModal.hidden = true;
  reportPaneModal.style.display = "none";
}

function openContactUsModal() {
  if (!contactUsModal) return;
  prefillContactForm();
  contactUsModal.hidden = false;
  contactUsModal.style.display = "grid";
  contactMessage?.focus();
}

function closeContactUsModal() {
  if (!contactUsModal) return;
  contactUsModal.hidden = true;
  contactUsModal.style.display = "none";
}

function buildContactMessage() {
  const lines = ["Hello Admin,", "", contactSubject.value.trim()];
  if (contactUserName.value.trim()) lines.push(`Name: ${contactUserName.value.trim()}`);
  if (contactUserEmail.value.trim()) lines.push(`Email: ${contactUserEmail.value.trim()}`);
  lines.push(`Selected markets: ${selectedMarketsForDashboard().join(", ")}`);
  lines.push("", contactMessage.value.trim());
  return lines.join("\n");
}

function sendContactMessage() {
  const subject = contactSubject?.value.trim() || "";
  const message = contactMessage?.value.trim() || "";
  const email = contactUserEmail?.value.trim() || "";
  if (!subject) {
    setContactStatus("bad", "Add a subject before sending your message.");
    contactSubject?.focus();
    return;
  }
  if (!message) {
    setContactStatus("bad", "Type your message before sending it.");
    contactMessage?.focus();
    return;
  }
  if (email && !isEmailLike(email)) {
    setContactStatus("bad", "Use a valid email address so admin can identify your account.");
    contactUserEmail?.focus();
    return;
  }
  const url = `mailto:${adminContactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildContactMessage())}`;
  setContactStatus("good", "Opening your email app so you can send the message from your email account.");
  try {
    window.location.href = url;
  } catch (error) {
    setContactStatus("bad", "Could not open your email app right now.");
  }
}

function sendPaymentMessage() {
  if (!currentUser) return;
  const subject = "Dividend Stock Tracker payment confirmation";
  const body = [
    "Hello Admin,",
    "",
    "I need access to my Dividend Stock Tracker account.",
    `Name: ${currentUser.username || "Investor"}`,
    `Email: ${currentUser.email || ""}`,
    `Current status: ${accessLabel(currentUser)}`,
    "",
    "Please confirm my payment and add access days to my account."
  ].join("\n");
  const url = `mailto:${adminContactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  setPaymentStatus("good", "");
  try {
    window.location.href = url;
  } catch (error) {
    setPaymentStatus("bad", "Could not open your email app right now.");
  }
}

function applyProfileToFilters() {
  const filtered = getFilteredStocks();
  if (filtered.length) {
    selectedTicker = filtered[0].ticker;
  }
  renderList();
  const stock = stocks.find((item) => item.ticker === selectedTicker) || filtered[0] || stocks[0];
  renderDetail(stock);
  scheduleStockDividendVerification(stock);
}

async function renderAuthState() {
  const storedUser = readStoredUser();
  currentUser = storedUser;
  if (!storedUser) {
    window.location.href = signupPageUrl();
    return;
  }
  if (canUseHostedProfileSync(storedUser)) {
    const { response, data } = await postHostedJson("/api/auth-session-user", {
      email: storedUser.email,
      sessionToken: storedUser.sessionToken
    });
    if (!response.ok || !data?.ok || !data?.user) {
      redirectToSignin(data?.message || "Your sign-in session has expired. Please sign in again.");
      return;
    }
    const mergedHosted = mergeHostedUserState(data.user, storedUser);
    currentUser = mergedHosted.user;
    writeStoredUser(currentUser);
    if (Object.keys(mergedHosted.pendingUpdates).length) {
      queueHostedProfileSync(mergedHosted.pendingUpdates, 0);
    }
  }
  if (currentUser) {
    const registeredUser = registeredUserMatch(currentUser);
    currentUser = ensureAccessFields({ ...currentUser, ...registeredUser });
    if (isUserLocked(currentUser)) {
      await logoutLockedUser(currentUser);
      return;
    }
    currentUser.lastSeenAt = new Date().toISOString();
    currentUser.lastActivityAt = new Date().toISOString();
    writeStoredUser(currentUser);
    syncRegisteredUser(currentUser);
    if (canUseHostedProfileSync()) {
      queueHostedProfileSync({
        lastSeenAt: currentUser.lastSeenAt,
        lastActivityAt: currentUser.lastActivityAt
      }, 0);
    }
    headerGreeting.textContent = `Welcome, ${displayName(currentUser.username)} · ${accessLabel(currentUser)}`;
    if (!isAccessActive(currentUser)) {
      await logoutExpiredUser(currentUser);
      return;
    }
    hidePaymentModal();
    if (currentUser.portfolioHoldings && Object.keys(portfolioHoldings).length === 0) {
      portfolioHoldings = currentUser.portfolioHoldings;
      writeJson("dividendPortfolio", portfolioHoldings);
    }
  } else {
    window.location.href = signupPageUrl();
    return;
  }
  populateMarketFilter();
  restoreDashboardState();
  renderLearningChannels();
  renderSecNigeriaPane();
  renderUkSavingsPane();
  renderIpoPanel([]);
  refreshIpoCalendar();
}

function renderInitialSelection() {
  const filtered = getFilteredStocks();
  if (filtered.length && !filtered.some((stock) => stock.ticker === selectedTicker)) {
    selectedTicker = filtered[0].ticker;
  }
  renderList();
  const stock = stocks.find((item) => item.ticker === selectedTicker) || filtered[0] || stocks[0];
  renderDetail(stock);
  scheduleStockDividendVerification(stock);
}

function applyMarketSelection() {
  const markets = [...marketMenu.querySelectorAll('input[name="visibleMarket"]:checked')].map((input) => input.value);
  if (!markets.length) {
    const firstInput = marketMenu.querySelector('input[name="visibleMarket"]');
    if (firstInput) {
      firstInput.checked = true;
      markets.push(firstInput.value);
    }
  }

  activeMarkets = markets;
  if (currentUser) {
    currentUser = { ...currentUser, visibleMarkets: activeMarkets };
    writeStoredUser(currentUser);
    syncRegisteredUser(currentUser);
    queueHostedProfileSync({ visibleMarkets: activeMarkets }, 150);
  }
  updateMarketSummary();
  renderLearningChannels();
  renderSecNigeriaPane();
  renderIpoPanel(latestIpos);
  renderInitialSelection();
  saveDashboardState();
}

function rerenderFilteredSelection() {
  const filtered = getFilteredStocks();
  if (filtered.length && !filtered.some((stock) => stock.ticker === selectedTicker)) {
    selectedTicker = filtered[0].ticker;
  }
  renderList();
  renderDetail(stocks.find((stock) => stock.ticker === selectedTicker) || stocks[0]);
  saveDashboardState();
}

function getFilteredStocks() {
  const category = categoryFilter.value;
  const signal = signalFilter.value;
  const search = searchInput.value.trim().toLowerCase();
  const direction = sortDirection.value === "desc" ? -1 : 1;
  const selectedMarkets = selectedMarketsForDashboard();

  return stocks.filter((stock) => {
    const platformText = stock.platforms.map((item) => item.join(" ")).join(" ");
    const searchable = `${stock.ticker} ${stock.name} ${stock.market} ${stock.category} ${platformText}`.toLowerCase();
    return selectedMarkets.includes(stock.market)
      && (category === "all" || stock.category === category)
      && (signal === "all" || stock.signal === signal)
      && (!search || searchable.includes(search));
  }).sort((a, b) => {
    if (sortField.value === "yield") {
      return (a.dividendYield - b.dividendYield) * direction;
    }
    if (sortField.value === "price") {
      return (a.price - b.price) * direction;
    }
    if (sortField.value === "score") {
      const aScore = a.buyScore ?? buyScoreFromMetrics({ growthYears: a.divGrowth, payoutRatio: a.payoutRatio, safety: a.safety, dividendYield: a.dividendYield });
      const bScore = b.buyScore ?? buyScoreFromMetrics({ growthYears: b.divGrowth, payoutRatio: b.payoutRatio, safety: b.safety, dividendYield: b.dividendYield });
      return (aScore - bScore) * direction;
    }
    return a.name.localeCompare(b.name) * direction;
  }).slice(0, dividendUniverseLimit);
}

function renderList() {
  const filtered = getFilteredStocks();
  visibleCount.textContent = `${filtered.length} shown`;
  if (stockCount) stockCount.textContent = `${stocks.length} stocks`;
  if (buyCount) buyCount.textContent = `${stocks.filter((stock) => stock.signal === "Buy").length} buy ideas`;

  if (!filtered.length) {
    stockList.innerHTML = '<div class="empty">No stocks match the current filters.</div>';
    return;
  }

  stockList.innerHTML = filtered.map((stock) => `
    <button class="stock-button ${stock.ticker === selectedTicker ? "active" : ""}" data-ticker="${stock.ticker}">
      <span class="stock-row">
        <span class="ticker">${stock.ticker}</span>
        <span class="signal-price">
          <span class="price-pill">${formatMoney(stock)}</span>
          <span class="chip ${stock.signal.toLowerCase()}">${stock.signal}</span>
        </span>
      </span>
      <span class="company">
        <span>${stock.name}</span>
        <span class="score-pill">Score ${stock.buyScore ?? buyScoreFromMetrics({ growthYears: stock.divGrowth, payoutRatio: stock.payoutRatio, safety: stock.safety, dividendYield: stock.dividendYield })}</span>
      </span>
      <span class="meta">
        <span class="chip">${stock.market}</span>
        <span class="chip">${stock.category}</span>
        <span class="chip">${stock.dividendYield}% yield</span>
      </span>
    </button>
  `).join("");
}

function upcomingDate(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  if (!Number.isFinite(date.getTime())) return new Date(NaN);
  date.setFullYear(now.getFullYear());
  if (date < now) date.setFullYear(now.getFullYear() + 1);
  return date;
}

function daysUntil(dateString) {
  return Math.ceil((upcomingDate(dateString) - new Date()) / 86400000);
}

function hasVerifiedDividendDate(stock, fieldName, dateValue) {
  if (!dateValue || !Number.isFinite(upcomingDate(dateValue).getTime())) return false;
  if (stock.verifiedDividendDates?.[fieldName]) return true;
  const historyField = fieldName === "payDate" ? "payDate" : fieldName === "recordDate" ? "recordDate" : "exDate";
  return Array.isArray(stock.verifiedDividendHistory)
    && stock.verifiedDividendHistory.some((entry) => entry?.[historyField] === dateValue);
}

function annualDividendPerShare(stock) {
  return Number(stock.annualDividend || 0) > 0
    ? Number(stock.annualDividend)
    : stock.price * (stock.dividendYield / 100);
}

function dividendPaymentsPerYear(stock) {
  const category = String(stock.category || "").toLowerCase();
  if (category.includes("reit")) return 12;
  if (stock.market === "US" || stock.market === "Canada") return 4;
  if (stock.market === "UK" || stock.market === "Nigeria" || stock.market === "Zimbabwe") return 2;
  if (stock.market === "Europe" || stock.market === "Asia") return 2;
  return 1;
}

function payoutSpacingDays(stock) {
  const paymentsPerYear = dividendPaymentsPerYear(stock);
  if (paymentsPerYear >= 12) return 30;
  if (paymentsPerYear === 4) return 91;
  if (paymentsPerYear === 2) return 182;
  return 365;
}

function buildDividendHistory(stock, count = 8) {
  const paymentsPerYear = dividendPaymentsPerYear(stock);
  const intervalDays = payoutSpacingDays(stock);
  const growthRate = Math.max(0, Number(stock.divGrowth) || 0) / 100;
  const annualDividend = annualDividendPerShare(stock);
  const latestPaid = new Date(`${stock.payDate}T00:00:00Z`);
  const today = new Date();
  while (latestPaid.getTime() > today.getTime()) {
    latestPaid.setUTCDate(latestPaid.getUTCDate() - intervalDays);
  }

  return Array.from({ length: count }, (_, index) => {
    const payDate = new Date(latestPaid);
    payDate.setUTCDate(payDate.getUTCDate() - (intervalDays * index));
    const yearsBack = index / paymentsPerYear;
    const estimatedAmount = annualDividend <= 0
      ? 0
      : annualDividend / paymentsPerYear / Math.pow(1 + growthRate, yearsBack);
    return {
      payDate: payDate.toISOString().slice(0, 10),
      amount: Number(estimatedAmount.toFixed(4)),
      label: paymentsPerYear >= 12
        ? "Monthly payout"
        : paymentsPerYear === 4
          ? "Quarterly payout"
          : paymentsPerYear === 2
            ? "Half-year payout"
            : "Annual payout"
    };
  });
}

function renderDividendHistory(stock) {
  if (!dividendHistoryPane) return;
  const annualDividend = annualDividendPerShare(stock);
  const paymentsPerYear = dividendPaymentsPerYear(stock);
  const verifiedHistory = Array.isArray(stock.verifiedDividendHistory)
    ? stock.verifiedDividendHistory
      .filter((entry) => entry.payDate || entry.exDate || Number(entry.amount) > 0)
      .slice(0, 8)
    : [];
  const history = verifiedHistory.length ? verifiedHistory : buildDividendHistory(stock);
  const sourceText = verifiedHistory.length ? dividendSourceName(stock) : "Estimated from the curated dividend profile until provider history is available.";
  dividendHistoryPane.innerHTML = `
    <div class="utility-card highlight dividend-history-summary">
      <strong>${formatMoney(stock, annualDividend)} estimated yearly dividend per share</strong>
      <span>${paymentsPerYear} payout${paymentsPerYear === 1 ? "" : "s"} per year based on the stock's current dividend profile.</span>
      <span>${sourceText}</span>
    </div>
    ${history.map((entry, index) => `
      <div class="utility-card dividend-history-card">
        <strong>${entry.payDate ? (index === 0 ? "Most recent payout" : `${index} payout${index === 1 ? "" : "s"} ago`) : (index === 0 ? "Most recent dividend event" : `${index} dividend event${index === 1 ? "" : "s"} ago`)}</strong>
        <span>${formatDate(entry.payDate || entry.exDate)} · ${formatDividendAmount(stock, entry)} per share</span>
        <span>${entry.label || (verifiedHistory.length ? "Verified dividend event" : "Estimated payout")}</span>
      </div>
    `).join("")}
  `;
}

function currentWatchlistStocks() {
  return watchlistKeys.map(findStockByKey).filter(Boolean);
}

function setWatchlistButton(stock) {
  if (!stock) return;
  const inWatchlist = watchlistKeys.includes(stockKey(stock));
  if (watchlistToggle) watchlistToggle.textContent = inWatchlist ? "Remove from watchlist" : "Add to watchlist";
  if (detailWatchStar) {
    detailWatchStar.textContent = inWatchlist ? "★" : "☆";
    detailWatchStar.setAttribute("aria-pressed", String(inWatchlist));
    detailWatchStar.setAttribute("aria-label", inWatchlist ? "Remove selected stock from watchlist" : "Add selected stock to watchlist");
  }
}

function showWatchlistToast(message = "Added to watchlist") {
  if (!watchlistToast) return;
  window.clearTimeout(watchlistToastTimer);
  watchlistToast.textContent = message;
  watchlistToast.hidden = false;
  watchlistToast.classList.add("is-visible");
  watchlistToastTimer = window.setTimeout(() => {
    watchlistToast.classList.remove("is-visible");
    watchlistToast.hidden = true;
  }, 2000);
}

function renderWatchlistPane() {
  const watched = currentWatchlistStocks();
  const downloadButton = '<div class="pane-actions watchlist-download-row"><button id="exportWatchlist" class="tool-button" type="button">Download watchlist CSV</button></div>';
  if (!watched.length) {
    watchlistPane.innerHTML = `${downloadButton}<div class="utility-card"><strong>No watchlist yet</strong><span>Add stocks you want to follow closely.</span></div>`;
    return;
  }
  watchlistPane.innerHTML = `${downloadButton}${watched.map((stock) => `
    <div class="mini-stock watchlist-item">
      <button class="watchlist-open" type="button" data-ticker="${stock.ticker}">
        <strong>${stock.ticker} · ${stock.market} · ${formatMoney(stock)}</strong>
        <span>${stock.name} · ${stock.dividendYield}% yield · ${stock.signal}</span>
      </button>
      <button class="mini-action danger watchlist-remove" type="button" data-key="${stockKey(stock)}">Remove</button>
    </div>
  `).join("")}`;
}

function renderDividendCalendar() {
  const source = stocksForSelectedMarkets();
  const events = source.flatMap((stock) => [
    { stock, label: "Qualification", date: stock.exDate },
    { stock, label: "Record", date: stock.recordDate },
    { stock, label: "Payment", date: stock.payDate },
    { stock, label: "Earnings", date: stock.earningsReport?.nextReport || buildEarningsReport(stock).nextReport }
  ])
    .filter((event) => Number.isFinite(upcomingDate(event.date).getTime()))
    .sort((a, b) => upcomingDate(a.date) - upcomingDate(b.date))
    .slice(0, 120);

  dividendCalendarPane.innerHTML = events.length ? events.map((event) => `
    <button class="utility-card compact calendar-stock-link" type="button" data-ticker="${event.stock.ticker}">
      <strong>${formatDate(upcomingDate(event.date))} · ${event.label}</strong>
      <span>${event.stock.ticker} · ${event.stock.name} · ${event.stock.market} · ${event.stock.dividendDataStatus ? "provider checked" : "curated fallback"}</span>
    </button>
  `).join("") : '<div class="utility-card"><strong>No calendar events available</strong><span>Dividend, record, payment, and earnings events will appear here for the countries you selected.</span></div>';
}

function renderPortfolioInputs(stock) {
  if (!portfolioShares || !portfolioPrice) return;
  const holding = portfolioHoldings[stockKey(stock)] || {};
  if (portfolioPriceCurrency) {
    portfolioPriceCurrency.textContent = `${currencySymbolFor(stock.currency)} ${stock.currency}`;
  }
  portfolioShares.value = holding.shares || "";
  portfolioPrice.value = holding.averagePrice || "";
}

function openPortfolioInterface() {
  if (!portfolioTrackerPane) return;
  renderPortfolioInputs(selectedStock);
  topbarQuickPanes.forEach((pane) => {
    if (pane !== portfolioTrackerPane) pane.open = false;
  });
  portfolioTrackerPane.open = true;
  portfolioTrackerPane.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    portfolioShares?.focus();
  }, 350);
}

function renderPortfolioPane() {
  if (!portfolioPane) return;
  const holdings = Object.entries(portfolioHoldings)
    .map(([key, holding]) => ({ stock: findStockByKey(key), holding }))
    .filter((item) => item.stock && Number(item.holding.shares) > 0);

  if (!holdings.length) {
    portfolioPane.innerHTML = '<div class="utility-card"><strong>No holdings saved</strong><span>Enter shares owned for the selected stock to estimate dividend income.</span></div>';
    return;
  }

  const rows = holdings.map(({ stock, holding }) => {
    const shares = Number(holding.shares);
    const annualIncome = shares * annualDividendPerShare(stock);
    const marketValue = shares * stock.price;
    return { stock, shares, annualIncome, marketValue };
  });

  portfolioPane.innerHTML = rows.map(({ stock, shares, annualIncome, marketValue }) => `
      <div class="utility-card compact portfolio-holding">
        <div>
          <strong>${stock.ticker} · ${shares} shares</strong>
          <span>${stock.name} · Value ${formatMoney(stock, marketValue)} · Est. yearly dividends ${formatMoney(stock, annualIncome)}</span>
        </div>
        <div class="holding-actions">
          <button class="mini-action" type="button" data-action="edit" data-key="${stockKey(stock)}">Edit</button>
          <button class="mini-action danger" type="button" data-action="delete" data-key="${stockKey(stock)}">Delete</button>
        </div>
      </div>
    `).join("");
}

function savePortfolioProfile() {
  writeJson("dividendPortfolio", portfolioHoldings);
  if (currentUser) {
    currentUser = { ...currentUser, portfolioHoldings };
    writeStoredUser(currentUser);
  }
  queueHostedProfileSync({ portfolioHoldings }, 150);
}

function renderAlertsPane() {
  const source = stocksForSelectedMarkets();
  const nearExDividendCount = source.filter((stock) => {
    if (!hasVerifiedDividendDate(stock, "exDate", stock.exDate)) return false;
    const days = daysUntil(stock.exDate);
    return Number.isFinite(days) && days >= 0 && days <= 7;
  }).length;
  if (dividendAlertBadge) {
    dividendAlertBadge.textContent = String(nearExDividendCount);
    dividendAlertBadge.hidden = nearExDividendCount === 0;
  }

  const alerts = source.flatMap((stock) => [
    { stock, label: "qualification date", days: daysUntil(stock.exDate), date: stock.exDate },
    { stock, label: "payment date", days: daysUntil(stock.payDate), date: stock.payDate }
  ])
    .filter((alert) => hasVerifiedDividendDate(alert.stock, alert.label === "payment date" ? "payDate" : "exDate", alert.date))
    .filter((alert) => Number.isFinite(alert.days) && alert.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 200);

  alertsPane.innerHTML = alerts.length
    ? alerts.map((alert) => {
      const isPayment = alert.label === "payment date";
      const eventClass = isPayment ? "payment-alert" : "qualification-alert";
      return `
      <button class="utility-card compact ${eventClass} alert-stock-link ${alert.days <= 45 ? "urgent" : ""}" type="button" data-ticker="${alert.stock.ticker}">
        <strong>${alert.stock.ticker}: ${alert.days} days to ${alert.label}</strong>
        <span>${formatDate(upcomingDate(alert.date))} · ${alert.stock.market} · ${alert.days <= 45 ? "Near-term verified alert" : "Verified upcoming event"} · ${dividendSourceName(alert.stock)}</span>
      </button>
    `;
    }).join("")
    : '<div class="utility-card"><strong>No verified dividend alerts available</strong><span>Only provider-checked or source-verified qualification and payment dates appear here.</span></div>';
}

function renderAlertsPaneExDividendOnly() {
  const source = getFilteredStocks().slice(0, 40);
  const alerts = source.map((stock) => ({
    stock,
    days: daysUntil(stock.exDate),
    date: stock.exDate
  }))
    .filter((alert) => hasVerifiedDividendDate(alert.stock, "exDate", alert.date))
    .filter((alert) => Number.isFinite(alert.days) && alert.days >= 0 && alert.days <= 7)
    .sort((a, b) => a.days - b.days)
    .slice(0, 24);

  alertsPane.innerHTML = alerts.length
    ? alerts.map((alert) => {
      const urgent = alert.days <= 2;
      const dayText = alert.days === 0 ? "today" : `${alert.days} ${alert.days === 1 ? "day" : "days"}`;
      return `
      <button class="utility-card compact qualification-alert alert-stock-link ${urgent ? "urgent" : ""}" type="button" data-ticker="${alert.stock.ticker}">
        <strong>${urgent ? "Urgent alert" : "Alert"}: ${alert.stock.ticker} qualification date is ${dayText}</strong>
        <span>${formatDate(upcomingDate(alert.date))} · ${alert.stock.name} · ${alert.stock.market} · ${dividendSourceName(alert.stock)}</span>
      </button>
    `;
  }).join("")
    : '<div class="utility-card"><strong>No verified qualification alerts right now</strong><span>Alerts appear here only when a verified selected-market stock is 7 days or less from its qualification date.</span></div>';
}

function optionLabel(stock) {
  return `${stock.ticker} · ${stock.name} · ${stock.market}`;
}

function renderCompareControls() {
  const candidates = getFilteredStocks().slice(0, 200);
  const defaults = [selectedStock, ...currentWatchlistStocks(), ...candidates]
    .filter(Boolean)
    .map(stockKey);
  const nextCompareKeys = [...new Set([...compareKeys, ...defaults])].slice(0, 4);
  const compareChanged = nextCompareKeys.join("|") !== compareKeys.join("|");
  compareKeys = nextCompareKeys;
  if (compareChanged) {
    writeJson("dividendCompareStocks", compareKeys);
    queueHostedProfileSync({ compareKeys }, 150);
  }
  compareSelects.forEach((select, index) => {
    const current = compareKeys[index] || "";
    select.innerHTML = '<option value="">Choose stock</option>' + candidates.map((stock) => `
      <option value="${stockKey(stock)}" ${stockKey(stock) === current ? "selected" : ""}>${optionLabel(stock)}</option>
    `).join("");
  });
}

function renderComparePane() {
  const selected = compareKeys.map(findStockByKey).filter(Boolean).slice(0, 4);
  if (!selected.length) {
    comparePane.innerHTML = '<div class="utility-card"><strong>Select stocks to compare</strong><span>Choose up to four stocks to compare yield, payout, safety, trend, and dividend frequency.</span></div>';
    return;
  }
  comparePane.innerHTML = `
    <div class="compare-table">
      <div class="compare-row head"><span>Stock</span><span>Yield</span><span>Payout</span><span>Safety</span><span>Trend</span><span>Frequency</span></div>
      ${selected.map((stock) => {
        const history = getChartSeries(stock).values;
        const trend = ((history[history.length - 1] - history[0]) / history[0]) * 100;
        return `<div class="compare-row">
          <span>${stock.ticker}</span>
          <span>${stock.dividendYield}%</span>
          <span>${stock.payoutRatio}%</span>
          <span>${stock.safety}/100</span>
          <span>${trend >= 0 ? "+" : ""}${trend.toFixed(1)}%</span>
          <span>${dividendFrequency(stock).replace("Usually ", "")}</span>
        </div>`;
      }).join("")}
    </div>
  `;
}

function renderCurrencyConverter() {
  if (!converterFrom.options.length) {
    converterFrom.innerHTML = currencyNames.map((currency) => `<option value="${currency}">${currency}</option>`).join("");
    converterTo.innerHTML = currencyNames.map((currency) => `<option value="${currency}">${currency}</option>`).join("");
  }
  converterFrom.value = converterFrom.value || selectedStock.currency || "USD";
  converterTo.value = converterTo.value || (selectedMarketsForDashboard().includes("Nigeria") ? "NGN" : "USD");
  const amount = Number(converterAmount.value || 0);
  const usd = amount * (fxRatesToUsd[converterFrom.value] || 1);
  const converted = usd / (fxRatesToUsd[converterTo.value] || 1);
  converterResult.innerHTML = `<div class="utility-card highlight"><strong>${amount.toLocaleString()} ${converterFrom.value}</strong><span>≈ ${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${converterTo.value}. Rates are indicative for planning, not live FX quotes.</span></div>`;
}

function renderBeginnerPane() {
  beginnerPane.innerHTML = [
    ["Dividend yield", "Yearly dividend income as a percentage of the current stock price."],
    ["Payout ratio", "How much of earnings is paid as dividends. Very high ratios can warn that the dividend is stretched."],
    ["Qualification date", "You usually need to own the stock before this date to qualify for the next dividend."],
    ["Record date", "The date the company checks its shareholder register to confirm who is officially entitled to receive the declared dividend."],
    ["Payment date", "The date the company expects to pay the dividend."],
    ["Liquidity", "How easy it may be to buy or sell without a bad spread or delay."],
    ["Tax treatment", "Check the current tax treatment, platform fees, and account rules that apply to your UK holdings."]
  ].map(([term, note]) => `<div class="utility-card compact"><strong>${term}</strong><span>${note}</span></div>`).join("");
}

function marketNewsQueries(market) {
  const queries = {
    Nigeria: [
      ["Trending Nigerian stock news", "Nigeria NGX stock market dividend earnings news"],
      ["Nigerian dividend announcements", "NGX dividend announcement qualification date payment date"],
      ["Nigeria market movers", "Nigerian Exchange top gainers losers market news"]
    ],
    US: [
      ["Trending US stock news", "US stock market trending dividend earnings news"],
      ["US dividend announcements", "NYSE Nasdaq dividend announcement qualification date"],
      ["US market movers", "S&P 500 Dow Nasdaq market movers dividend stocks"]
    ],
    UK: [
      ["Trending UK stock news", "UK FTSE stock market dividend earnings news"],
      ["UK dividend announcements", "London Stock Exchange dividend announcement qualification date"],
      ["UK dividend stock ideas", "UK dividend stocks FTSE news"]
    ],
    Canada: [
      ["Trending Canadian stock news", "Canada TSX stock market dividend earnings news"],
      ["Canadian dividend announcements", "TSX dividend announcement qualification date"],
      ["Canada market movers", "TSX market movers dividend stocks news"]
    ],
    Europe: [
      ["Trending European stock news", "Europe stock market dividend earnings news"],
      ["European dividend announcements", "European stocks dividend announcement qualification date"],
      ["Europe market movers", "STOXX Europe market movers dividend stocks"]
    ],
    Asia: [
      ["Trending Asian stock news", "Asia stock market dividend earnings news"],
      ["Asian dividend announcements", "Asian stocks dividend announcement qualification date"],
      ["Asia market movers", "Asia market movers dividend stocks news"]
    ],
    Zimbabwe: [
      ["Trending Zimbabwe stock news", "Zimbabwe ZSE VFEX stock market dividend earnings news"],
      ["Zimbabwe dividend announcements", "ZSE VFEX payout announcement payment date"],
      ["Zimbabwe market movers", "Zimbabwe Stock Exchange market movers news"]
    ]
  };
  return queries[market] || [[`Trending ${market} stock news`, `${market} stock market dividend earnings news`]];
}

function renderNewsPane() {
  const selectedMarkets = selectedMarketsForDashboard();
  newsPane.innerHTML = selectedMarkets.map((market) => `
    <div class="utility-card market-news-card">
      <strong>${marketLabels[market] || market} stock news</strong>
      <span>Trending market, dividend, earnings, and market-mover news for the selected country.</span>
      <div class="news-link-grid">
        ${marketNewsQueries(market).map(([label, query]) => `
          <a class="utility-link" href="https://www.google.com/search?tbm=nws&q=${encodeURIComponent(query)}" target="_blank" rel="noopener noreferrer">${label}</a>
        `).join("")}
      </div>
    </div>
  `).join("") + `
    <div class="utility-card compact">
      <strong>Research reminder</strong>
      <span>News links open live searches. Confirm dividend declarations, earnings releases, dates, tax treatment, fees, FX, and platform availability before acting.</span>
    </div>
  `;
}

function renderUtilityPanes(stock) {
  setWatchlistButton(stock);
  renderWatchlistPane();
  renderDividendCalendar();
  renderPortfolioInputs(stock);
  renderPortfolioPane();
  renderAlertsPane();
  renderCompareControls();
  renderComparePane();
  renderCurrencyConverter();
  renderBeginnerPane();
  renderNewsPane();
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function stockRowsForCsv(items) {
  return [
    ["Ticker", "Company", "Market", "Category", "Price", "Currency", "Dividend yield", "Signal", "Buy score", "Payout ratio", "Safety"],
    ...items.map((stock) => [
      stock.ticker,
      stock.name,
      stock.market,
      stock.category,
      stock.price,
      stock.currency,
      stock.dividendYield,
      stock.signal,
      stock.buyScore ?? buyScoreFromMetrics({ growthYears: stock.divGrowth, payoutRatio: stock.payoutRatio, safety: stock.safety, dividendYield: stock.dividendYield }),
      stock.payoutRatio,
      stock.safety
    ])
  ];
}

function watchlistRowsForCsv(items) {
  return [
    ["Ticker", "Full stock name", "Market", "Category", "Price", "Currency", "Dividend yield", "Signal", "Buy score", "Payout ratio", "Safety"],
    ...items.map((stock) => [
      stock.ticker,
      stock.name,
      stock.market,
      stock.category,
      stock.price,
      stock.currency,
      stock.dividendYield,
      stock.signal,
      stock.buyScore ?? buyScoreFromMetrics({ growthYears: stock.divGrowth, payoutRatio: stock.payoutRatio, safety: stock.safety, dividendYield: stock.dividendYield }),
      stock.payoutRatio,
      stock.safety
    ])
  ];
}

function portfolioRowsForCsv() {
  const holdings = Object.entries(portfolioHoldings)
    .map(([key, holding]) => ({ stock: findStockByKey(key), holding }))
    .filter((item) => item.stock && Number(item.holding.shares) > 0);
  return [
    ["Ticker", "Full stock name", "Market", "Shares", "Average buy price", "Currency", "Current price", "Current value", "Estimated yearly dividends", "Dividend yield"],
    ...holdings.map(({ stock, holding }) => {
      const shares = Number(holding.shares);
      const averagePrice = Number(holding.averagePrice || stock.price);
      const currentValue = shares * stock.price;
      const annualIncome = shares * annualDividendPerShare(stock);
      return [
        stock.ticker,
        stock.name,
        stock.market,
        shares,
        averagePrice,
        stock.currency,
        stock.price,
        Number(currentValue.toFixed(2)),
        Number(annualIncome.toFixed(2)),
        stock.dividendYield
      ];
    })
  ];
}

function renderLearningChannels() {
  const selected = selectedMarketsForDashboard();
  const selectedGroups = learningChannels.filter((group) => selected.includes(group.market));
  youtubeChannels.innerHTML = selectedGroups.map((group) => `
    <details class="youtube-market">
      <summary>${sentenceCaseLabel(marketLabels[group.market] || group.market)}</summary>
      ${group.channels.slice(0, 2).map((channel) => `
        <a class="youtube-link" href="${channel.url}" target="_blank" rel="noopener noreferrer">
          <strong>${channel.name}</strong>
          <span>${channel.note}</span>
        </a>
      `).join("")}
    </details>
  `).join("");
}

function sentenceCaseLabel(label) {
  const text = String(label || "").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function activeProfileCountries() {
  return selectedMarketsForDashboard();
}

function ipoCountryNote(country) {
  const platformMap = {
    Nigeria: "Check NGX announcements, Bamboo, InvestNaija, Chaka, and your local broker for public offers or new listings.",
    UK: "Check Trading 212, Freetrade, Hargreaves Lansdown, AJ Bell, and LSE admission news. IPO allocation is not guaranteed.",
    US: "Check Nasdaq/NYSE calendars and whether your platform offers IPO access or only post-listing trading.",
    Canada: "Check TSX/TSXV calendars and whether your broker offers new-issue allocation or post-listing access.",
    Europe: "Check the local exchange and your platform’s new-issue access; many platforms only allow buying after listing.",
    Asia: "Check local exchange rules and platform availability; access often depends on broker permissions and residency.",
    Zimbabwe: "Check ZSE/VFEX announcements and local brokers because IPO participation is usually broker-led."
  };
  return platformMap[country] || "Check the official exchange, prospectus, and your broker before participating.";
}

function ipoYoutubeLinks(ipos) {
  return ipos.slice(0, 6).map((ipo) => {
    const query = encodeURIComponent(`${ipo.company} ${ipo.symbol} IPO ${ipo.country} how to participate`);
    return `
      <a class="youtube-link" href="https://www.youtube.com/results?search_query=${query}" target="_blank" rel="noopener noreferrer">
        <strong>${ipo.company} IPO videos</strong>
        <span>Search YouTube for current videos about this listed IPO, allocation, pricing, risks, and how investors may participate.</span>
      </a>
    `;
  }).join("");
}

function renderIpoPanel(ipos = []) {
  const countries = activeProfileCountries();
  const filtered = ipos.filter((ipo) => countries.includes(ipo.country)).slice(0, 8);
  const hasIpos = filtered.length > 0;
  if (ipoPane) {
    ipoPane.hidden = !hasIpos;
    if (!hasIpos) ipoPane.open = false;
  }
  if (!hasIpos) {
    ipoList.innerHTML = "";
    ipoInstructions.innerHTML = "";
    return;
  }

  ipoList.innerHTML = countries.map((country) => {
    const countryIpos = filtered.filter((ipo) => ipo.country === country);
    return countryIpos.map((ipo) => `
      <div class="ipo-card">
        <strong>${ipo.company} (${ipo.symbol})</strong>
        <span>${ipo.country} · ${ipo.exchange} · ${ipo.date} · ${ipo.priceRange || "Price TBC"}</span>
        <span>${ipo.dealSize ? `Deal size: ${ipo.dealSize}` : "Review the prospectus before applying."}</span>
      </div>
    `).join("");
  }).join("");

  ipoInstructions.innerHTML = ipoYoutubeLinks(filtered);
}

function renderSecNigeriaPane() {
  const showNigeriaPane = activeMarkets.includes("Nigeria");
  secNigeriaPane.hidden = !showNigeriaPane;
  if (!showNigeriaPane) {
    secNigeriaPane.open = false;
  }
}

function renderUkSavingsPane() {
  const showUkSavings = selectedMarketsForDashboard().includes("UK");
  ukSavingsPane.hidden = !showUkSavings;
  if (!showUkSavings) return;

  ukSavingsList.innerHTML = `
    <div class="savings-card">
      <strong>Important note</strong>
      <span>These are high-rate UK regular saver accounts at 6% AER or above from current public rate guides. Rates and eligibility change often, and regular savers usually limit monthly deposits, so check the provider before opening.</span>
    </div>
    ${ukHighYieldSavings.map(([name, rate, details]) => `
      <div class="savings-card">
        <strong>${name}</strong>
        <span class="rate">${rate}</span>
        <span>${details}</span>
      </div>
    `).join("")}
    <div class="savings-card">
      <strong>How to use them</strong>
      <span>For lump sums, keep cash in a top easy-access account, then drip-feed the monthly maximum into regular savers. Watch tax allowances, FSCS protection limits, withdrawal rules, and whether you need a linked current account.</span>
    </div>
  `;
}

async function refreshIpoCalendar() {
  if (window.location.protocol === "file:") {
    latestIpos = [];
    renderIpoPanel([]);
    return;
  }
  const response = await fetch("/api/ipo-calendar", { cache: "no-store" }).catch(() => null);
  if (!response?.ok) {
    latestIpos = [];
    renderIpoPanel([]);
    return;
  }
  const data = await response.json().catch(() => ({ ipos: [] }));
  latestIpos = Array.isArray(data.ipos) ? data.ipos : [];
  renderIpoPanel(latestIpos);
}

function drawChart(stock, highlightIndex = -1) {
  const width = canvas.width;
  const height = canvas.height;
  const pad = 42;
  const series = getChartSeries(stock);
  const values = series.values;
  const selectedHighlight = highlightIndex >= 0
    ? highlightIndex
    : activeChartStockKey === stockKey(stock)
      ? activeChartPointIndex
      : -1;
  const activeHighlight = Math.min(Math.max(selectedHighlight, -1), values.length - 1);
  const min = Math.min(...values) * 0.96;
  const max = Math.max(...values) * 1.04;
  const darkChart = document.body.dataset.theme === "dark";
  const chartColors = darkChart
    ? {
        background: "#0e192b",
        grid: "#22334a",
        buy: "#6ee7b7",
        sell: "#fca5a5",
        hold: "#93c5fd",
        point: "#93c5fd",
        pointFill: "#101b2d",
        highlight: "#e7edf6",
        guide: "rgba(231, 237, 246, 0.35)",
        text: "#9fb0c5",
        gradientTop: "rgba(147, 197, 253, 0.24)",
        gradientMid: "rgba(94, 234, 212, 0.12)",
        gradientBottom: "rgba(196, 181, 253, 0)"
      }
    : {
        background: "#f7fbff",
        grid: "#d7e2ea",
        buy: "#087f5b",
        sell: "#c2413f",
        hold: "#245fc7",
        point: "#245fc7",
        pointFill: "#ffffff",
        highlight: "#111827",
        guide: "rgba(17, 24, 39, 0.35)",
        text: "#5f6f82",
        gradientTop: "rgba(36, 95, 199, 0.24)",
        gradientMid: "rgba(15, 138, 131, 0.12)",
        gradientBottom: "rgba(109, 74, 255, 0)"
      };

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = chartColors.background;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = chartColors.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const y = pad + ((height - pad * 2) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  }

  const points = values.map((value, index) => {
    const x = pad + ((width - pad * 2) / Math.max(values.length - 1, 1)) * index;
    const y = height - pad - ((value - min) / (max - min)) * (height - pad * 2);
    return { x, y, value, index };
  });
  chartState = { stock, points, min, max, labels: series.labels, values };

  const gradient = ctx.createLinearGradient(0, pad, 0, height - pad);
  gradient.addColorStop(0, chartColors.gradientTop);
  gradient.addColorStop(0.55, chartColors.gradientMid);
  gradient.addColorStop(1, chartColors.gradientBottom);

  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.lineTo(points[points.length - 1].x, height - pad);
  ctx.lineTo(points[0].x, height - pad);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = stock.signal === "Buy" ? chartColors.buy : stock.signal === "Sell" ? chartColors.sell : chartColors.hold;
  ctx.lineWidth = 4;
  ctx.stroke();

  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.index === activeHighlight ? 7 : 4, 0, Math.PI * 2);
    ctx.fillStyle = chartColors.pointFill;
    ctx.fill();
    ctx.strokeStyle = point.index === activeHighlight ? chartColors.highlight : chartColors.point;
    ctx.lineWidth = point.index === activeHighlight ? 3 : 2;
    ctx.stroke();
  });

  if (activeHighlight >= 0 && points[activeHighlight]) {
    const point = points[activeHighlight];
    ctx.beginPath();
    ctx.moveTo(point.x, pad);
    ctx.lineTo(point.x, height - pad);
    ctx.strokeStyle = chartColors.guide;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.fillStyle = chartColors.text;
  ctx.font = "14px Arial";
  ctx.fillText(`${formatMoney(stock, max)} high`, pad, 24);
  ctx.fillText(`${formatMoney(stock, min)} low`, pad, height - 14);
  ctx.textAlign = "right";
  ctx.fillText(stock.liveStatus ? `Updated ${series.title.toLowerCase()}` : series.title, width - pad, 24);
  ctx.textAlign = "left";
}

function nearestChartPoint(clientX) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const x = (clientX - rect.left) * scaleX;
  return chartState.points.reduce((closest, point) => (
    Math.abs(point.x - x) < Math.abs(closest.x - x) ? point : closest
  ), chartState.points[0]);
}

function chartPointPeriodLabel() {
  if (chartRange === "daily") return "Day";
  if (chartRange === "weekly") return "Week";
  if (chartRange === "monthly" || chartRange === "5year") return "Month";
  if (chartRange === "yearly") return "Year";
  return "Period";
}

function formatPercentChange(value) {
  if (!Number.isFinite(value)) return "0.0%";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function positionChartTooltip(clientX, clientY, point) {
  const wrap = canvas.parentElement.getBoundingClientRect();
  const chart = canvas.getBoundingClientRect();
  const pointClientX = chart.left + (point.x / canvas.width) * chart.width;
  const pointClientY = chart.top + (point.y / canvas.height) * chart.height;
  const anchorX = Number.isFinite(clientX) ? clientX : pointClientX;
  const anchorY = Number.isFinite(clientY) ? clientY : pointClientY;
  const tooltipWidth = chartTooltip.offsetWidth || 190;
  const tooltipHeight = chartTooltip.offsetHeight || 88;
  const wrapWidth = wrap.width || chart.width;
  const wrapHeight = wrap.height || chart.height;
  const left = Math.min(Math.max(anchorX - wrap.left - tooltipWidth / 2, 8), Math.max(8, wrapWidth - tooltipWidth - 8));
  let top = anchorY - wrap.top - tooltipHeight - 16;
  if (top < 8) top = anchorY - wrap.top + 18;
  top = Math.min(Math.max(top, 8), Math.max(8, wrapHeight - tooltipHeight - 8));
  chartTooltip.style.left = `${left}px`;
  chartTooltip.style.top = `${top}px`;
}

function showChartTooltip(event) {
  if (!chartState.points.length) return;
  if (event?.pointerType === "touch" && event.cancelable) event.preventDefault();
  const point = nearestChartPoint(event.clientX);
  const stock = chartState.stock;
  const first = chartState.values[0];
  const previous = chartState.values[Math.max(0, point.index - 1)];
  const startChange = ((point.value - first) / first) * 100;
  const previousChange = point.index > 0 && previous
    ? ((point.value - previous) / previous) * 100
    : 0;
  activeChartPointIndex = point.index;
  activeChartStockKey = stockKey(stock);
  drawChart(stock, point.index);
  chartTooltip.hidden = false;
  chartTooltip.innerHTML = `
    <strong>${chartState.labels[point.index] || `Point ${point.index + 1}`}</strong>
    <span>${chartPointPeriodLabel()} price: ${formatMoney(stock, point.value)}</span>
    <span>From start: ${formatPercentChange(startChange)}</span>
    <span>Previous ${chartPointPeriodLabel().toLowerCase()}: ${formatPercentChange(previousChange)}</span>
  `;
  positionChartTooltip(event.clientX, event.clientY, point);
}

function hideChartTooltip() {
  activeChartPointIndex = -1;
  activeChartStockKey = "";
  chartTooltip.hidden = true;
  drawChart(chartState.stock);
}

function decisionLines(stock) {
  const entryYield = (stock.dividendYield * 1.1).toFixed(1);
  const exitYield = Math.max(stock.dividendYield * 0.72, 2).toFixed(1);
  const support = Math.min(...stock.history.slice(-6));
  const recentHigh = Math.max(...stock.history.slice(-6));
  const buyVerb = stock.signal === "Buy" ? "Start or add" : stock.signal === "Hold" ? "Wait to add" : "Avoid new buying";
  return [
    `${buyVerb}: target pullbacks near ${formatMoney(stock, support)} or a forward yield around ${entryYield}% with no dividend-quality downgrade.`,
    `Sell or reduce: if price runs near ${formatMoney(stock, recentHigh * 1.12)} without earnings growth, if yield compresses below ${exitYield}%, or if dividend cover weakens.`,
    `Risk check: payout ratio above 75%, dividend cuts, rising debt costs, or missed earnings should override the headline yield.`
  ];
}

function stockTrendPercent(stock) {
  const history = Array.isArray(stock.history) ? stock.history.filter((value) => Number.isFinite(Number(value))) : [];
  if (history.length < 2 || Number(history[0]) <= 0) return 0;
  return ((history[history.length - 1] - history[0]) / history[0]) * 100;
}

function calculateRsi(values, period = 14) {
  const prices = Array.isArray(values) ? values.map(Number).filter((value) => Number.isFinite(value) && value > 0) : [];
  if (prices.length < period + 1) return null;
  const changes = prices.slice(1).map((price, index) => price - prices[index]).slice(-period);
  const gains = changes.map((change) => Math.max(change, 0));
  const losses = changes.map((change) => Math.max(-change, 0));
  const averageGain = gains.reduce((sum, gain) => sum + gain, 0) / period;
  const averageLoss = losses.reduce((sum, loss) => sum + loss, 0) / period;
  if (averageGain === 0 && averageLoss === 0) return 50;
  if (averageLoss === 0) return 100;
  const relativeStrength = averageGain / averageLoss;
  return 100 - (100 / (1 + relativeStrength));
}

function rsiProfile(stock) {
  const dailyHistory = stock.historyByRange?.daily?.length >= 15
    ? stock.historyByRange.daily
    : buildRangeHistory(stock, "daily");
  const rsi = calculateRsi(dailyHistory, 14);
  if (!Number.isFinite(rsi)) {
    return { value: "N/A", label: "Not enough data", tone: "neutral" };
  }
  const value = Math.round(rsi);
  if (value >= 70) return { value, label: "Overbought", tone: "sell" };
  if (value <= 30) return { value, label: "Oversold", tone: "buy" };
  return { value, label: "Neutral", tone: "hold" };
}

function stockAnalysisDecision(stock) {
  const score = finalQualityScore(stock);
  const trend = stockTrendPercent(stock);
  const yieldHealthy = stock.dividendYield >= 2 && stock.dividendYield <= 8;
  const payoutHealthy = stock.payoutRatio > 0 && stock.payoutRatio <= 70;
  const safetyHealthy = stock.safety >= 70;
  const valuationGood = /cheap|fair/i.test(stock.valuation);

  if (score >= 72 && payoutHealthy && safetyHealthy && yieldHealthy && valuationGood && trend > -18) {
    return {
      verdict: "Buy candidate",
      tone: "buy",
      summary: "The stock looks suitable for deeper research or a staged buy because income, payout discipline, safety, and valuation are aligned."
    };
  }

  if (score >= 58 && stock.payoutRatio <= 90 && stock.safety >= 55 && trend > -30) {
    return {
      verdict: "Wait or hold",
      tone: "hold",
      summary: "The stock has useful dividend qualities, but the current balance of yield, payout ratio, safety, or trend is not strong enough for a confident buy signal."
    };
  }

  return {
    verdict: "Do not buy now",
    tone: "sell",
    summary: "The stock needs caution because the current dividend quality, payout cover, safety score, valuation, or price trend does not support new buying."
  };
}

function buildStockAnalysis(stock) {
  const rsi = rsiProfile(stock);
  const decision = stockAnalysisDecision(stock);

  return `
    <section class="stock-analysis">
      <div class="analysis-verdict ${decision.tone}">
        <span>Decision</span>
        <strong>${decision.verdict}</strong>
        <p>${decision.summary}</p>
      </div>
      <div class="analysis-grid">
        <div class="analysis-card">
          <span>14 Day RSI</span>
          <strong>${rsi.value}${rsi.value === "N/A" ? "" : "/100"} - ${rsi.label}</strong>
          <p>RSI estimates short-term price momentum. Above 70 can mean overbought, below 30 can mean oversold, and the middle range is usually neutral.</p>
        </div>
        <div class="analysis-card dividend-calendar-analysis">
          <span>Dividend calendar</span>
          <strong>${formatDate(stock.exDate)} qualification date</strong>
          <p>Record date: ${formatDate(stock.recordDate)}. Payment date: ${formatDate(stock.payDate)}. ${dividendSourceName(stock)}</p>
        </div>
      </div>
      <div class="analysis-note">
        This is a research signal, not investment advice. Confirm live prices, earnings reports, dividend declarations, fees, tax treatment, and platform availability before buying.
      </div>
    </section>
  `;
}

function openStockAnalysisModal(stock = selectedStock) {
  if (!stock || !reportPaneModal || !reportPaneModalBody) return;
  restoreActiveReportContent();
  if (reportPaneModalTitle) reportPaneModalTitle.textContent = `${stock.ticker} Analysis`;
  const analysis = document.createElement("div");
  analysis.className = "report-content-card";
  analysis.innerHTML = buildStockAnalysis(stock);
  reportPaneModalBody.replaceChildren(analysis);
  reportPaneModal.hidden = false;
  reportPaneModal.style.display = "grid";
  closeReportPaneModalBtn?.focus({ preventScroll: true });
}

function renderDetail(stock) {
  selectedStock = stock;
  detailMarket.textContent = `${stock.market} · ${stock.category}`;
  detailName.textContent = stock.name;
  detailTicker.textContent = `${stock.ticker} · ${stock.liveStatus || "Curated price"} ${formatMoney(stock)} · ${stock.valuation} valuation`;
  detailSignal.textContent = stock.signal;
  detailSignal.className = `signal ${stock.signal.toLowerCase()}`;

  const rsi = rsiProfile(stock);
  const metricCards = [
    ["Price", formatMoney(stock)],
    ["Market cap", formatMarketCap(stock.marketCap, stock.currency)],
    ["Dividend yield", `${stock.dividendYield}%`],
    ["Buy score", `${stock.buyScore ?? buyScoreFromMetrics({ growthYears: stock.divGrowth, payoutRatio: stock.payoutRatio, safety: stock.safety, dividendYield: stock.dividendYield })}/100`],
    ["Payout ratio", `${stock.payoutRatio}%`],
    ["Dividend growth", `${stock.divGrowth}%`],
    ["Safety score", `${stock.safety}/100`],
    ["14 Day RSI", `${rsi.value}${rsi.value === "N/A" ? "" : "/100"} (${rsi.label})`],
    ["Dividend frequency", dividendFrequency(stock)]
  ].map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join("");
  metrics.innerHTML = `${metricCards}
    <div class="metric metric-action">
      <span>Analysis</span>
      <button id="analyzeStockButton" class="analyze-stock-button" type="button">Analyze</button>
    </div>`;

  companyProfile.innerHTML = [
    ["Company", stock.name],
    ["Ticker", stock.ticker],
    ["Market", stock.market],
    ["Industry", stock.category]
  ].map(([label, value]) => `<div class="profile-item"><span>${label}</span><strong>${value}</strong></div>`).join("")
    + `<div class="profile-item wide"><span>What the company does</span><p>${describeBusiness(stock)}</p></div>`;

  reasonsList.innerHTML = [...decisionLines(stock), ...stock.reasons].map((reason) => `<li>${reason}</li>`).join("");

  const dividendDateRows = stock.market === "Nigeria" && stock.closureOfRegister
    ? [
      ["Qualification date", stock.exDate],
      ["Closure of register", stock.closureOfRegister],
      ["AGM day", stock.agmDate],
      ["Payment day", stock.payDate],
      ["Registrar", stock.registrar]
    ]
    : [
      ["Qualification date", stock.exDate],
      ["Record day", stock.recordDate],
      ["Payment day", stock.payDate]
    ];
  dividendDates.innerHTML = dividendDateRows
    .map(([label, value]) => `<div class="date-item"><span>${label}</span><strong>${formatDateOrText(value)}</strong></div>`).join("")
    + `<div class="date-item wide"><span>Dividend data source</span><strong>${dividendSourceName(stock)}</strong>${stock.dividendDataNote ? `<span>${stock.dividendDataNote}</span>` : ""}${verifiedEvidenceLabel(stock) ? `<span>${verifiedEvidenceLabel(stock)}</span>` : ""}</div>`;

  const report = stock.earningsReport || buildEarningsReport(stock);
  earningsReport.innerHTML = [
    ["Fiscal year", report.fiscalYear],
    ["EPS", formatMoney(stock, report.eps)],
    ["Earnings yield", `${report.earningsYield}%`],
    ["Revenue growth", `${report.revenueGrowth}%`],
    ["Profit growth", `${report.profitGrowth}%`],
    ["Next report", formatDate(report.nextReport)],
    ["Report quality", report.quality]
  ].map(([label, value]) => `<div class="date-item"><span>${label}</span><strong>${value}</strong></div>`).join("");

  const isaNote = "";
  platforms.innerHTML = `${isaNote}
    ${stock.platforms.map(([name, note]) => `
    <div class="platform">
      <strong>${name}</strong>
      <span class="liquidity-line">${platformLiquidityScore(stock, name)}</span>
      <span>${note}</span>
    </div>
  `).join("")}`;

  renderDividendHistory(stock);
  renderUtilityPanes(stock);
  drawChart(stock);
}

function selectStock(ticker) {
  selectedTicker = ticker;
  const stock = stocks.find((item) => item.ticker === ticker) || stocks[0];
  renderList();
  renderDetail(stock);
  scheduleStockDividendVerification(stock);
  saveDashboardState();
}

function openStockChart(ticker) {
  activeChartPointIndex = -1;
  activeChartStockKey = "";
  selectStock(ticker);
  chartTooltip.hidden = true;
  topbarQuickPanes.forEach((pane) => {
    pane.open = false;
  });
  canvas.scrollIntoView({ behavior: "smooth", block: "center" });
}

function animatePress(event) {
  const target = event.target.closest("button, summary, .youtube-link");
  if (!target) return;
  const rect = target.getBoundingClientRect();
  target.classList.add("is-pressing");

  if (getComputedStyle(target).position === "static") {
    target.style.position = "relative";
  }
  target.style.overflow = "hidden";

  const burst = document.createElement("span");
  burst.className = "click-burst";
  burst.style.left = `${event.clientX - rect.left}px`;
  burst.style.top = `${event.clientY - rect.top}px`;
  target.appendChild(burst);

  window.setTimeout(() => {
    target.classList.remove("is-pressing");
    burst.remove();
  }, 520);
}

document.addEventListener("click", animatePress);
document.addEventListener("click", (event) => {
  if (marketDropdown.open && !marketDropdown.contains(event.target)) {
    marketDropdown.open = false;
  }
});

marketMenu.addEventListener("change", applyMarketSelection);

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  switchThemeFast(nextTheme);
});

liteModeToggle?.addEventListener("click", () => {
  applyLiteMode(document.body.dataset.liteMode !== "on");
});

logoutButton?.addEventListener("click", logoutCurrentUser);

reportPaneButtons.forEach((button) => {
  button.addEventListener("click", () => openReportPaneModal(button));
});
closeReportPaneModalBtn?.addEventListener("click", closeReportPaneModal);
reportPaneModal?.addEventListener("click", (event) => {
  if (event.target === reportPaneModal) closeReportPaneModal();
});
metrics?.addEventListener("click", (event) => {
  const button = event.target.closest("#analyzeStockButton");
  if (button) openStockAnalysisModal(selectedStock);
});
contactUsFab?.addEventListener("click", openContactUsModal);
closeContactUsBtn?.addEventListener("click", closeContactUsModal);
sendContactMessageBtn?.addEventListener("click", sendContactMessage);
paymentContactAdmin?.addEventListener("click", sendPaymentMessage);
contactUsModal?.addEventListener("click", (event) => {
  if (event.target === contactUsModal) closeContactUsModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (reportPaneModal && !reportPaneModal.hidden) {
    closeReportPaneModal();
    return;
  }
  if (contactUsModal && !contactUsModal.hidden) {
    closeContactUsModal();
  }
});
window.addEventListener("storage", (event) => {
  if (event.key === usersStorageKey || event.key === "dividendProfileUser") {
    void enforceStoredSession();
  }
});

stockList.addEventListener("click", (event) => {
  const button = event.target.closest(".stock-button");
  if (button) selectStock(button.dataset.ticker);
});

watchlistPane.addEventListener("click", (event) => {
  const exportButton = event.target.closest("#exportWatchlist");
  if (exportButton) {
    downloadCsv("dividend-watchlist.csv", watchlistRowsForCsv(currentWatchlistStocks()));
    return;
  }

  const removeButton = event.target.closest(".watchlist-remove");
  if (removeButton) {
    watchlistKeys = watchlistKeys.filter((item) => item !== removeButton.dataset.key);
    writeJson("dividendWatchlist", watchlistKeys);
    queueHostedProfileSync({ watchlistKeys }, 150);
    renderUtilityPanes(selectedStock);
    return;
  }
  const openButton = event.target.closest(".watchlist-open");
  if (openButton) selectStock(openButton.dataset.ticker);
});

dividendCalendarPane?.addEventListener("click", (event) => {
  const button = event.target.closest(".calendar-stock-link");
  if (!button) return;
  openStockChart(button.dataset.ticker);
});

alertsPane?.addEventListener("click", (event) => {
  const button = event.target.closest(".alert-stock-link");
  if (!button) return;
  openStockChart(button.dataset.ticker);
});

watchlistToggle?.addEventListener("click", () => {
  const key = stockKey(selectedStock);
  watchlistKeys = watchlistKeys.includes(key)
    ? watchlistKeys.filter((item) => item !== key)
    : [...watchlistKeys, key];
  writeJson("dividendWatchlist", watchlistKeys);
  queueHostedProfileSync({ watchlistKeys }, 150);
  renderUtilityPanes(selectedStock);
});

detailWatchStar?.addEventListener("click", () => {
  const key = stockKey(selectedStock);
  const wasInWatchlist = watchlistKeys.includes(key);
  watchlistKeys = wasInWatchlist
    ? watchlistKeys.filter((item) => item !== key)
    : [...watchlistKeys, key];
  writeJson("dividendWatchlist", watchlistKeys);
  queueHostedProfileSync({ watchlistKeys }, 150);
  renderUtilityPanes(selectedStock);
  if (!wasInWatchlist) showWatchlistToast("Added to watchlist");
});

addToPortfolioButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  openPortfolioInterface();
});

savePortfolio?.addEventListener("click", () => {
  const key = stockKey(selectedStock);
  const shares = Number(portfolioShares.value || 0);
  const averagePrice = Number(portfolioPrice.value || selectedStock.price);
  if (shares <= 0) {
    delete portfolioHoldings[key];
  } else {
    portfolioHoldings[key] = { shares, averagePrice };
  }
  savePortfolioProfile();
  renderPortfolioInputs(selectedStock);
  renderPortfolioPane();
});

downloadPortfolio?.addEventListener("click", () => {
  downloadCsv("dividend-portfolio.csv", portfolioRowsForCsv());
});

portfolioPane?.addEventListener("click", (event) => {
  const button = event.target.closest(".mini-action");
  if (!button) return;
  const key = button.dataset.key;
  const stock = findStockByKey(key);
  if (button.dataset.action === "edit" && stock) {
    selectStock(stock.ticker);
    renderPortfolioInputs(stock);
    return;
  }
  if (button.dataset.action === "delete") {
    delete portfolioHoldings[key];
    savePortfolioProfile();
    if (stock && stockKey(selectedStock) === key) {
      renderPortfolioInputs(selectedStock);
    }
    renderPortfolioPane();
  }
});

compareSelects.forEach((select, index) => {
  select.addEventListener("change", () => {
    compareKeys[index] = select.value;
    compareKeys = compareKeys.filter(Boolean);
    writeJson("dividendCompareStocks", compareKeys);
    queueHostedProfileSync({ compareKeys }, 150);
    renderCompareControls();
    renderComparePane();
  });
});

[converterAmount, converterFrom, converterTo].forEach((control) => {
  control.addEventListener("input", renderCurrencyConverter);
});

topbarQuickPanes.forEach((pane) => {
  pane.addEventListener("toggle", () => {
    if (pane.open) {
      topbarQuickPanes.forEach((otherPane) => {
        if (otherPane !== pane) otherPane.open = false;
      });
    }
    saveDashboardState();
  });
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".topbar-pane")) return;
  topbarQuickPanes.forEach((pane) => {
    pane.open = false;
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  topbarQuickPanes.forEach((pane) => {
    pane.open = false;
  });
});

exportFiltered?.addEventListener("click", () => {
  downloadCsv("dividend-filtered-stocks.csv", stockRowsForCsv(getFilteredStocks()));
});

exportWatchlist?.addEventListener("click", () => {
  downloadCsv("dividend-watchlist.csv", watchlistRowsForCsv(currentWatchlistStocks()));
});

[categoryFilter, signalFilter, searchInput, sortField, sortDirection].forEach((control) => {
  control.addEventListener("input", () => {
    if (control === searchInput && liteSearchInput) {
      liteSearchInput.value = searchInput.value;
    }
    rerenderFilteredSelection();
  });
});

liteSearchInput?.addEventListener("input", () => {
  if (searchInput) searchInput.value = liteSearchInput.value;
  rerenderFilteredSelection();
});

refreshPrices.addEventListener("click", () => refreshLivePrices(true));
canvas.addEventListener("pointerdown", (event) => {
  chartPointerActive = true;
  canvas.setPointerCapture?.(event.pointerId);
  showChartTooltip(event);
});
canvas.addEventListener("pointermove", (event) => {
  if (event.pointerType === "mouse" || chartPointerActive) {
    showChartTooltip(event);
  }
});
canvas.addEventListener("pointerup", (event) => {
  chartPointerActive = false;
  canvas.releasePointerCapture?.(event.pointerId);
});
canvas.addEventListener("pointercancel", (event) => {
  chartPointerActive = false;
  canvas.releasePointerCapture?.(event.pointerId);
});
canvas.addEventListener("pointerleave", () => {
  chartPointerActive = false;
});
rangeTabs.forEach((button) => {
  button.addEventListener("click", () => {
    chartRange = button.dataset.range;
    rangeTabs.forEach((tabButton) => {
      tabButton.classList.toggle("active", tabButton === button);
    });
    activeChartPointIndex = -1;
    activeChartStockKey = "";
    chartTooltip.hidden = true;
    drawChart(selectedStock);
    saveDashboardState();
  });
});

window.addEventListener("scroll", () => {
  if (!currentUser) return;
  window.clearTimeout(dashboardScrollTimer);
  dashboardScrollTimer = window.setTimeout(saveDashboardState, 120);
}, { passive: true });

window.addEventListener("beforeunload", saveDashboardState);

async function bootstrapDashboard() {
  populateCategories();
  renderIpoPanel([]);
  await renderAuthState();
  startInactivityLogout();
  renderInitialSelection();
  if (window.location.protocol !== "file:") {
    refreshLivePrices();
    refreshHostedStaticDividendSnapshots();
    refreshHostedDividendSweep();
  }
}

void bootstrapDashboard();
setInterval(() => {
  if (!document.hidden) refreshLivePrices();
}, liveRefreshInterval());
setInterval(() => {
  if (!document.hidden) refreshHostedStaticDividendSnapshots();
}, hostedStaticDividendRefreshMs);
setInterval(() => {
  if (!document.hidden) refreshHostedDividendSweep();
}, hostedDividendSweepRefreshMs);
setInterval(() => {
  if (!document.hidden) refreshIpoCalendar();
}, 6 * 60 * 60 * 1000);
setInterval(() => {
  if (!document.hidden) void checkAccessStillActive();
}, 60 * 1000);
