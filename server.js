const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

let history = [];

// HOME (browser UI)
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
        width: 60%;
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
      <button onclick="back()">⬅</button>
      <button onclick="forward()">➡</button>

      <form id="form" style="display:flex; gap:5px; width:100%;">
        <input id="url" value="${currentUrl}" placeholder="scrivi google.com" />
        <button type="submit">Vai</button>
      </form>
    </div>

    <iframe id="frame" src="${currentUrl ? '/browse?url=' + encodeURIComponent(currentUrl) : ''}"></iframe>

    <script>
      const form = document.getElementById("form");
      const input = document.getElementById("url");
      const frame = document.getElementById("frame");

      form.onsubmit = (e) => {
        e.preventDefault();
        let url = input.value;

        if (!url.startsWith("http")) {
          url = "https://" + url;
        }

        window.location.href = "/?url=" + encodeURIComponent(url);
      };

      function back() {
        history.back();
      }

      function forward() {
        history.forward();
      }
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

    if (!history.includes(url)) {
      history.push(url);
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
    res.send("Errore caricamento pagina");
  }
});

app.listen(PORT, () => {
  console.log("Server attivo su porta " + PORT);
});