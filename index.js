import express from "express";
import { chromium } from "playwright";

const app = express();
app.use(express.json());

// Railway installe Google Chrome ici :
const CHROME_PATH = "/usr/bin/google-chrome-stable";

app.get("/peages", async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.json({ error: "missing parameters" });
  }

  try {
    const browser = await chromium.launch({
      headless: true,
      executablePath: CHROME_PATH, // 🔥 IMPORTANT POUR RAILWAY
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer"
      ]
    });

    const page = await browser.newPage();

    await page.goto("https://www.autoroutes.fr/fr/itineraire", {
      waitUntil: "networkidle"
    });

    await page.fill("#itineraire_depart", String(from));
    await page.fill("#itineraire_arrivee", String(to));

    await page.click("#itineraire_submit");

    await page.waitForSelector(".resultat-peage");

    const price = await page.$eval(".resultat-peage", el => el.innerText);

    await browser.close();

    res.json({
      from,
      to,
      toll: price
    });

  } catch (e) {
    res.json({ error: e.toString() });
  }
});

// 🔥 OBLIGATOIRE POUR RAILWAY
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Scraper running on port ${PORT}`));
