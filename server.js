const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   HOME
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
        padding: 15px;
        font-size: 20px;
        font-weight: bold;
        background: #000;
        border-bottom: 1px solid #333;
      }

      .bar {
        position: fixed;
        top: 60px;
        width: 100%;
        background: #222;
        padding: 10px;
        display: flex;
        gap: 5px;
        z-index: 10;
        align-items: center;
      }

      input {
        width: 50%;
        padding: 8px;
        border: none;
        border-radius: 5px;
      }

      button {
        padding: 8px;
        border: none;
        border-radius: 5px;
        background: #4CAF50;
        color: white;
        cursor: pointer;
      }

      .navbtn {
        background: #555;
      }

      iframe {
        position: absolute;
        top: 110px;
        width: 100%;
        height: calc(100% - 110px);
        border: none;
      }

      .hint {
        text-align: center;
        font-size: 12px;
        color: #aaa;
      }
    </style>
  </head>
  <body>

    <div class="top">
      📟 Browser Nokia 2026
      <div class="hint">Ricerca + Navigazione</div>
    </div>

    <div class="bar">
      <button class="navbtn" onclick="goBack()">⬅</button>
      <button class="navbtn" onclick="goForward()">➡</button>
      <button class="navbtn" onclick="refreshPage()">🔄</button>

      <form id="form" style="display:flex; gap:5px; width:100%;">
        <input id="url" value="${currentUrl}" placeholder="es: google.com o ricerca..." />
        <button type="submit">Vai</button>
      </form>
    </div>

    <iframe id="frame" src="${currentUrl ? '/browse?url=' + encodeURIComponent(currentUrl) : ''}"></iframe>

    <script>
      const form = document.getElementById("form");
      const input = document.getElementById("url");
      const iframe = document.getElementById("frame");

      let historyStack = [];
      let currentIndex = -1;

      function loadUrl(url) {
        iframe.src = url;
        input.value = url;
      }

      form.onsubmit = (e) => {
        e.preventDefault();

        let value = input.value.trim();
        const isSearch = !value.includes(".");

        let finalUrl = "";

        if (isSearch) {
          finalUrl = "https://duckduckgo.com/?q=" + encodeURIComponent(value);
        } else {
          if (!value.startsWith("http")) {
            value = "https://" + value;
          }

          const complexSites = ["youtube.com", "google.com", "youtu.be"];
          let isComplex = complexSites.some(site => value.includes(site));

          finalUrl = isComplex ? value : "/browse?url=" + encodeURIComponent(value);
        }

        historyStack.push(finalUrl);
        currentIndex++;

        iframe.src = finalUrl;
      };

      function goBack() {
        if (currentIndex > 0) {
          currentIndex--;
          iframe.src = historyStack[currentIndex];
          input.value = historyStack[currentIndex];
        }
      }

      function goForward() {
        if (currentIndex < historyStack.length - 1) {
          currentIndex++;
          iframe.src = historyStack[currentIndex];
          input.value = historyStack[currentIndex];
        }
      }

      function refreshPage() {
        iframe.src = iframe.src;
      }

      // aggiorna input quando cambia pagina
      iframe.addEventListener("load", () => {
        try {
          input.value = iframe.src;
        } catch (e) {}
      });
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


/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log("Server attivo su porta " + PORT);
});