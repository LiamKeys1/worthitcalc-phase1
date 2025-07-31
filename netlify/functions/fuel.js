const fetch = require("node-fetch");

const RETAILERS = [
  { brand: "Asda", url: "https://storelocator.asda.com/fuel_prices_data.json" },
  { brand: "Tesco", url: "https://www.tesco.com/fuel_prices/fuel_prices_data.json" },
  { brand: "Sainsbury’s", url: "https://api.sainsburys.co.uk/v1/exports/latest/fuel_prices_data.json" },
  { brand: "Morrisons", url: "https://www.morrisons.com/fuel-prices/fuel.json" },
  { brand: "BP", url: "https://fuelprices.esso.co.uk/latestdata.json" },
  { brand: "Shell", url: "https://www.shell.co.uk/fuel-prices-data.html" }
];

exports.handler = async function () {
  const stations = [];

  for (const r of RETAILERS) {
    try {
      const resp = await fetch(r.url);
      if (!resp.ok) throw new Error(`Fetch ${r.brand} failed`);
      const data = await resp.json();
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
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ stations })
  };
};
