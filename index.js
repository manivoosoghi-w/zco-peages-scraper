import express from "express";
import playwright from "playwright-core";

const app = express();
app.use(express.json());

app.get("/peages", async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.json({ error: "missing parameters" });
  }

  try {
    const browser = await playwright.chromium.launch({
      headless: true,
      executablePath: "/usr/bin/google-chrome-stable",
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
