import express from "express";
import { chromium } from "playwright";

const app = express();
app.use(express.json());

app.get("/peages", async (req, res) => {
  const from = req.query.from;
  const to = req.query.to;

  if (!from || !to) {
    return res.status(400).json({ error: "Paramètres 'from' et 'to' obligatoires" });
  }

  try {
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto("https://autoroute-eco.fr", { waitUntil: "networkidle" });

    // Nouveaux sélecteurs 2026
    await page.waitForSelector('input[name="depart"]', { timeout: 15000 });
    await page.fill('input[name="depart"]', from);

    await page.waitForSelector('input[name="arrivee"]', { timeout: 15000 });
    await page.fill('input[name="arrivee"]', to);

    await page.click('button[type="submit"]');

    // Attendre les résultats
    await page.waitForSelector("#resultats .prix", { timeout: 20000 });

    const total = await page.$eval("#resultats .prix", el =>
      el.textContent.trim().replace("€", "").replace(",", ".")
    );

    await browser.close();

    return res.json({
      total: parseFloat(total),
      details: []
    });

  } catch (err) {
    return res.status(500).json({
      error: "Erreur scraping autoroute-eco.fr",
      details: `${err}`
    });
  }
});

app.listen(3000, () => console.log("Scraper péages OK sur port 3000"));
