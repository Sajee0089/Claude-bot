const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const BASE = "https://api.binance.com";

// SIGN FUNCTION
function sign(query, secret) {
  return crypto.createHmac("sha256", secret).update(query).digest("hex");
}

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ACCOUNT
app.post("/api/account", async (req, res) => {
  const { apiKey, apiSecret } = req.body;

  const qs = new URLSearchParams({
    timestamp: Date.now()
  }).toString();

  const signature = sign(qs, apiSecret);

  const url = `${BASE}/api/v3/account?${qs}&signature=${signature}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "X-MBX-APIKEY": apiKey }
  });

  const data = await response.json();
  res.json(data);
});

// ORDER
app.post("/api/order", async (req, res) => {
  const { apiKey, apiSecret, symbol, side, quantity } = req.body;

  const qs = new URLSearchParams({
    symbol,
    side,
    type: "MARKET",
    quantity,
    timestamp: Date.now()
  }).toString();

  const signature = sign(qs, apiSecret);

  const url = `${BASE}/api/v3/order?${qs}&signature=${signature}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "X-MBX-APIKEY": apiKey }
  });

  const data = await response.json();
  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
