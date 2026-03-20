const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Homepage (browser UI)
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Nokia Browser</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 20px; }
          input { width: 60%; padding: 10px; }
          button { padding: 10px 20px; }
        </style>
      </head>
      <body>
        <h2>Nokia Browser</h2>
        <form action="/browse" method="GET">
          <input type="text" name="url" placeholder="Scrivi google.com" />
          <button type="submit">Vai</button>
        </form>
      </body>
    </html>
  `);
});

// Proxy
app.get("/browse", async (req, res) => {
  try {
    let url = req.query.url;

    if (!url) return res.send("URL mancante");

    // aggiunge protocollo se manca
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    let html = response.data;

    // riscrive link
    html = html.replace(/href="(.*?)"/g, (match, p1) => {
      if (p1.startsWith("http")) {
        return `href="/browse?url=${encodeURIComponent(p1)}"`;
      }
      return match;
    });

    res.send(html);

  } catch (err) {
    console.log(err.message);
    res.send("Errore nel caricamento pagina");
  }
});

app.listen(PORT, () => {
  console.log("Server attivo su porta " + PORT);
});