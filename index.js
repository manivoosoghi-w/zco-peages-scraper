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
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto("https://autoroute-eco.fr", { waitUntil: "domcontentloaded" });

    await page.fill("#depart", from);
    await page.fill("#arrivee", to);

    await page.click("#calcul");

    await page.waitForSelector("#resultat");

    const total = await page.$eval("#resultat .prix", el => el.textContent.trim());

    await browser.close();

    return res.json({
      total: parseFloat(total.replace("€", "").replace(",", ".")),
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
