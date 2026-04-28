import express from "express";
import { chromium } from "playwright";
import fs from "fs";

const app = express();
app.use(express.json());

function findChrome() {
  const base = "/opt/render/.cache/ms-playwright/chromium-1217/chrome-linux64";
  const paths = [
    `${base}/chrome`,
    `${base}/chrome-wrapper`
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return null;
}

app.get("/peages", async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.json({ error: "missing parameters" });
  }

  try {
    const chromePath = findChrome();

    if (!chromePath) {
      return res.json({ error: "Chrome not found on Render" });
    }

    const browser = await chromium.launch({
      headless: true,
      executablePath: chromePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
      ]
    });

    const page = await browser.newPage();

    await page.goto("https://www.autoroutes.fr/fr/itineraire", {
      waitUntil: "networkidle"
    });

    await page.fill("#itineraire_depart", from);
    await page.fill("#itineraire_arrivee", to);

    await page.click("#itineraire_submit");

    await page.waitForSelector(".resultat-peage");

    const price = await page.$eval(".resultat-peage", el => el.innerText);

    await browser.close();

    res.json({ from, to, toll: price });

  } catch (e) {
    res.json({ error: e.toString() });
  }
});

app.listen(3000, () => console.log("Scraper running"));
