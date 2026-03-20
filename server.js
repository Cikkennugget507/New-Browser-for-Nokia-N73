const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   HOME (BROWSER MODERNO)
========================= */
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
      const iframe = document.getElementById("frame");

      form.onsubmit = (e) => {
        e.preventDefault();

        let value = input.value.trim();

        const isSearch = !value.includes(".");

        // 🔍 ricerca dentro iframe
        if (isSearch) {
          const searchUrl = "https://duckduckgo.com/?q=" + encodeURIComponent(value);
          iframe.src = "/browse?url=" + encodeURIComponent(searchUrl);
          return;
        }

        if (!value.startsWith("http")) {
          value = "https://" + value;
        }

        const complexSites = ["youtube.com", "google.com", "youtu.be"];
        let isComplex = complexSites.some(site => value.includes(site));

        if (isComplex) {
          iframe.src = value;
          return;
        }

        iframe.src = "/browse?url=" + encodeURIComponent(value);
      };
    </script>

  </body>
  </html>
  `);
});


/* =========================
   PROXY
========================= */
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


/* =========================
   VERSIONE NOKIA N73 (LITE)
========================= */
app.get("/lite", (req, res) => {
  const url = req.query.url || "https://duckduckgo.com";

  res.send(`
  <html>
  <head>
    <title>Nokia N73 Browser</title>
  </head>
  <body style="font-family: Arial; font-size:16px;">

    <h2>📟 Nokia Browser Lite</h2>

    <form action="/lite" method="GET">
      <input type="text" name="url" value="${url}" style="width:100%; padding:8px;" />
      <button type="submit">Vai</button>
    </form>

    <hr>

    <p>
      <a href="/lite?url=https://duckduckgo.com">DuckDuckGo</a><br><br>
      <a href="/lite?url=https://google.com">Google</a><br><br>
      <a href="/lite?url=https://youtube.com">YouTube</a>
    </p>

    <hr>

    <p>URL attuale:</p>
    <p>${url}</p>

  </body>
  </html>
  `);
});


/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log("Server attivo su porta " + PORT);
});