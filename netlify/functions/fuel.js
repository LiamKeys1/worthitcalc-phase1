const fetch = require("node-fetch");

// Simplified list: start with two reliable sources
const RETAILERS = [
  {
    brand: "Asda",
    url: "https://storelocator.asda.com/fuel_prices_data.json"
  },
  {
    brand: "Tesco",
    url: "https://www.tesco.com/fuel_prices/fuel_prices_data.json"
  }
];

const timeout = (ms, promise) => new Promise((res, rej) =>
  setTimeout(() => rej(new Error("timeout")), ms)
    .race([promise])
);

exports.handler = async function() {
  const stations = [];

  await Promise.allSettled(RETAILERS.map(async r => {
    try {
      const res = await timeout(3000, fetch(r.url)); // 3s timeout
      if (!res.ok) throw new Error(r.brand + " fetch failed");

      const json = await res.json();
      const list = json.stations || json.sites || json.data || [];
      list.forEach(s => {
        const p = s.prices || {};
        stations.push({
          brand: r.brand,
          name: s.name || s.site || "",
          postcode: s.postcode || s.post_code || "",
          unleaded: p.E5 != null ? p.E5 : p.E10 || null,
          diesel: p.B7 || null
        });
      });
    } catch (e) {
      console.warn("Skip", r.brand, e.message);
    }
  }));

  return {
    statusCode: 200,
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ stations })
  };
};

