const express = require("express");
const axios = require("axios");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server attivo");
});

app.get("/browse", async (req, res) => {
  try {
    let url = req.query.url;

    if (!url) {
      return res.send("URL mancante");
    }

    // Se l'url non ha protocollo, aggiungilo
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    let html = response.data;

    // Riscrittura link per farli passare dal proxy
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