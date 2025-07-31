const fetch = require("node-fetch");

const RETAILERS = [
  { brand: "Asda", url: "https://storelocator.asda.com/fuel_prices_data.json" },
  { brand: "Tesco", url: "https://www.tesco.com/fuel_prices/fuel_prices_data.json" },
  { brand: "Sainsbury’s", url: "https://api.sainsburys.co.uk/v1/exports/latest/fuel_prices_data.json" },
  { brand: "Morrisons", url: "https://www.morrisons.com/fuel-prices/fuel.json" }
  // Skipping Shell and BP for now to reduce errors/timeouts
];

const timeout = (ms) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));

exports.handler = async function () {
  const stations = [];

  const results = await Promise.allSettled(RETAILERS.map(async (r) => {
    try {
      const res = await Promise.race([
        fetch(r.url),
        timeout(4000) // 4 second timeout per retailer
      ]);
      if (!res.ok) throw new Error(`Fetch ${r.brand} failed`);

      const data = await res.json();
      const list = data.stations || data.sites || data || [];
      for (const s of list) {
        stations.push({
          brand: r.brand,
          name: s.name || s.site || "",
          postcode: s.postcode || s.post_code || "",
          unleaded: s.e5 || s.unleaded || s.price_e5 || null,
          diesel: s.b7 || s.diesel || s.price_b7 || null
        });
      }
    } catch (err) {
      console.warn(`Skipping ${r.brand}`, err.message);
    }
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({ stations })
  };
};
