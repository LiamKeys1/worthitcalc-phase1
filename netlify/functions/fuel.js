const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const sources = [
    {
      brand: "Asda",
      url: "https://www.asda.com/api/feeds/store/petrol-prices",
    },
    {
      brand: "Morrisons",
      url: "https://my.morrisons.com/storefinder/api/fuel-prices.json",
    },
    {
      brand: "Sainsbury's",
      url: "https://www.sainsburys.co.uk/webapp/wcs/stores/servlet/gb/groceries/fuel-prices.json",
    },
    {
      brand: "Tesco",
      url: "https://www.tesco.com/fuel_prices/fuel_prices.json",
    },
    {
      brand: "Co-op",
      url: "https://www.coop.co.uk/fuel-price-feed.json",
    },
    {
      brand: "Shell",
      url: "https://www.shell.co.uk/fuel_prices.json",
    },
    {
      brand: "BP",
      url: "https://www.bp.com/fuel-prices.json",
    },
    {
      brand: "Texaco",
      url: "https://www.texaco.co.uk/fuel_prices.json",
    }
  ];

  let stations = [];

  for (const r of sources) {
    try {
      const res = await fetch(r.url);
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.stations || json.data || [];

      for (const s of list) {
        const priceObj = s.prices || {};

        stations.push({
          brand: r.brand,
          name: s.name || s.site || "",
          postcode: s.postcode || s.post_code || "",
          unleaded: priceObj.E5 != null ? priceObj.E5 : priceObj.E10 || null,
          diesel: priceObj.B7 || null,
        });
      }
    } catch (err) {
      console.error(`Error loading ${r.brand}:`, err.message);
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ stations }),
  };
};
