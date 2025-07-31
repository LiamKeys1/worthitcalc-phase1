
const fetch = require("node-fetch");

exports.handler = async function () {
  const url = "https://www.gov.uk/guidance/access-fuel-prices-as-open-data";
  const dataUrl = "https://www.openpetrolprices.gov.uk/api/v1/prices";

  try {
    const response = await fetch(dataUrl, {
      headers: {
        "User-Agent": "Fuel WorthItCalc/1.0"
      }
    });

    const data = await response.json();

    const allowedRetailers = [
      "Tesco", "Asda", "Sainsbury’s", "Shell", "Morrisons", "BP", "Esso"
    ];

    const filtered = data.prices.filter(entry =>
      allowedRetailers.includes(entry.retailer)
    );

    return {
      statusCode: 200,
      body: JSON.stringify(filtered)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
