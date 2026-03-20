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
    <title>Nokia Browser</title>
    <style>
      body { font-family: Arial; margin:0; }
      .bar {
        position: fixed;
        top: 0;
        width: 100%;
        background: #222;
        padding: 10px;
        display: flex;
        gap: 5px;
      }
      input {
        width: 70%;
        padding: 8px;
      }
      button {
        padding: 8px 12px;
      }
      iframe {
        position: absolute;
        top: 60px;
        width: 100%;
        height: calc(100% - 60px);
        border: none;
      }
    </style>
  </head>
  <body>

    <div class="bar">
      <form id="form" style="display:flex; gap:5px; width:100%;">
        <input id="url" value="${currentUrl}" placeholder="scrivi sito o ricerca" />
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

        // se è una ricerca (parole o senza punto)
        if (!value.includes(".") || value.includes(" ")) {
          const searchUrl = "https://duckduckgo.com/?q=" + encodeURIComponent(value);
          window.location.href = "/?url=" + encodeURIComponent(searchUrl);
          return;
        }

        // se manca protocollo
        if (!value.startsWith("http")) {
          value = "https://" + value;
        }

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