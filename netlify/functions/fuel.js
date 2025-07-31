const fetch = require("node-fetch");

const RETAILERS = [
  {
    brand: "Asda",
    url: "https://storelocator.asda.com/fuel_prices_data.json"
  },
  {
    brand: "Tesco",
    url: "https://www.tesco.com/fuel_prices/fuel_prices_data.json"
  },
  {
    brand: "BP",
    url: "https://fuelprices.esso.co.uk/latestdata.json"
  }
];

const timeout = (ms, prom) =>
  Promise.race([prom, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

exports.handler = async function () {
  const stations = [];

  await Promise.allSettled(RETAILERS.map(async (r) => {
    try {
      const res = await timeout(4000, fetch(r.url));
      if (!res.ok) throw new Error(`${r.brand} fetch failed (${res.status})`);
      const json = await res.json();
      const list = json.stations || json.sites || json.data || [];
      list.forEach(s => {
        const p = s.prices || {};
        const e5 = p.E5 != null ? p.E5 : p.e5;
        const b7 = p.B7 != null ? p.B7 : p.b7;
        if (e5 != null || b7 != null) {
          stations.push({
            brand: r.brand,
            name: s.name || s.site || "",
            postcode: s.postcode || s.post_code || "",
            unleaded: e5 != null ? e5 : null,
            diesel: b7 != null ? b7 : null
          });
        }
      });
    } catch (err) {
      console.warn(`Skipping ${r.brand}:`, err.message);
    }
  }));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stations })
  };
};

