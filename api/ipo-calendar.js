function parseRows(html) {
  const rows = [];
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  while ((rowMatch = rowPattern.exec(html))) {
    const cells = [...rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
      .map((cell) => cell[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    if (cells.length >= 5) {
      rows.push({
        date: cells[0],
        symbol: cells[1],
        company: cells[2],
        exchange: cells[3],
        priceRange: cells[4],
        shares: cells[5] || "",
        dealSize: cells[6] || "",
        marketCap: cells[7] || "",
        country: /nasdaq|nyse/i.test(cells[3]) ? "US" : "Other"
      });
    }
  }
  return rows.filter((row) => row.symbol && row.company && !/symbol|company/i.test(row.symbol));
}

module.exports = async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");

  try {
    const upstream = await fetch("https://stockanalysis.com/ipos/calendar/", {
      headers: { "user-agent": "dividend-tracker/1.0" }
    });
    if (!upstream.ok) throw new Error("IPO calendar unavailable");
    const html = await upstream.text();
    response.status(200).json({
      updatedAt: new Date().toISOString(),
      provider: "StockAnalysis IPO calendar",
      ipos: parseRows(html).slice(0, 40)
    });
  } catch (error) {
    response.status(200).json({
      updatedAt: new Date().toISOString(),
      provider: "Fallback",
      ipos: [],
      message: "No hosted IPO calendar data available right now."
    });
  }
};
