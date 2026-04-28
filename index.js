import express from "express";
import playwright from "playwright-core";
import fs from "fs";

const app = express();
app.use(express.json());

// Chemin du Chromium que NOUS installons
const CHROME_PATH = "/opt/render/project/src/chromium/chrome-linux/chrome";

app.get("/peages", async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.json({ error: "missing parameters" });
  }

  // Vérifier que Chromium existe
  if (!fs.existsSync(CHROME_PATH)) {
    return res.json({ error: "Chromium not installed on Render" });
  }

  try {
    const browser = await playwright.chromium.launch({
      headless: true,
      executablePath: CHROME_PATH,
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
