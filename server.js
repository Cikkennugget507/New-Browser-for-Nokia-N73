const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// HOME
app.get("/", (req, res) => {
  const currentUrl = req.query.url || "";

  res.send(`
  <html>
  <head>
    <title>Browser Nokia 2026</title>
    <style>
      body {
        margin: 0;
        font-family: Arial;
        background: #111;
        color: white;
      }

      .top {
        text-align: center;
        padding: 20px;
        font-size: 22px;
        font-weight: bold;
        background: #000;
        border-bottom: 1px solid #333;
      }

      .bar {
        position: fixed;
        top: 70px;
        width: 100%;
        background: #222;
        padding: 10px;
        display: flex;
        gap: 5px;
        z-index: 10;
      }

      input {
        width: 70%;
        padding: 10px;
        border: none;
        border-radius: 5px;
      }

      button {
        padding: 10px;
        border: none;
        border-radius: 5px;
        background: #4CAF50;
        color: white;
        cursor: pointer;
      }

      iframe {
        position: absolute;
        top: 130px;
        width: 100%;
        height: calc(100% - 130px);
        border: none;
      }

      .hint {
        text-align: center;
        font-size: 12px;
        color: #aaa;
        margin-top: 5px;
      }
    </style>
  </head>
  <body>

    <div class="top">
      📟 Browser Nokia 2026
      <div class="hint">Scrivi un sito o una ricerca</div>
    </div>

    <div class="bar">
      <form id="form" style="display:flex; gap:5px; width:100%;">
        <input id="url" value="${currentUrl}" placeholder="es: google.com oppure minecraft" />
        <button type="submit">Vai</button>
      </form>
    </div>

    <iframe id="frame" src="${currentUrl ? '/browse?url=' + encodeURIComponent(currentUrl) : ''}"></iframe>

    <script>
      const form = document.getElementById("form");
      const input = document.getElementById("url");

      form.onsubmit = (e) => {
        e.preventDefault();

        let value = input.value.trim();

        // SE È UNA RICERCA → DuckDuckGo diretto (NO proxy)
        const isSearch = !value.includes(".");

        if (isSearch) {
          const searchUrl = "https://duckduckgo.com/?q=" + encodeURIComponent(value);
          window.location.href = searchUrl;
          return;
        }

        // aggiungi https se manca
        if (!value.startsWith("http")) {
          value = "https://" + value;
        }

        // siti complessi → apertura diretta
        const complexSites = ["youtube.com", "google.com", "youtu.be"];
        let isComplex = complexSites.some(site => value.includes(site));

        if (isComplex) {
          window.location.href = value;
          return;
        }

        // proxy normale
        window.location.href = "/?url=" + encodeURIComponent(value);
      };
    </script>

  </body>
  </html>
  `);
});

// PROXY
app.get("/browse", async (req, res) => {
  try {
    let url = req.query.url;

    if (!url) return res.send("URL mancante");

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    let html = response.data;

    // riscrittura link
    html = html.replace(/href="(.*?)"/g, (match, p1) => {
      if (p1.startsWith("http")) {
        return `href="/?url=${encodeURIComponent(p1)}"`;
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