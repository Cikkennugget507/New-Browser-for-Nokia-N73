const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = 3000;

// Home
app.get("/", (req, res) => {
  res.send(`
    <h2>Nokia Browser</h2>
    <form action="/browse" method="GET">
      <input type="text" name="url" placeholder="Inserisci URL o ricerca" style="width:80%" />
      <button type="submit">Vai</button>
    </form>
  `);
});

// Browser proxy
app.get("/browse", async (req, res) => {
  let url = req.query.url;

  if (!url) {
    return res.send("URL mancante");
  }

  // Se non ha http/https, prova Google search
  if (!url.startsWith("http")) {
    url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    // 🔧 Trasforma tutti i link in link proxy
    $("a").each((i, el) => {
      let href = $(el).attr("href");

      if (href) {
        // converti link relativi in assoluti
        if (href.startsWith("/")) {
          const base = new URL(url).origin;
          href = base + href;
        }

        // ignora anchor e javascript
        if (href.startsWith("http")) {
          $(el).attr(
            "href",
            `/browse?url=${encodeURIComponent(href)}`
          );
        }
      }
    });

    // ❌ rimuove script e stili pesanti
    $("script").remove();
    $("style").remove();

    // opzionale: semplifica il layout
    res.send($.html());

  } catch (err) {
    res.send("Errore nel caricamento della pagina");
  }
});

app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});