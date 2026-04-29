import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/peages", async (req, res) => {
  const from = req.query.from;
  const to = req.query.to;

  if (!from || !to) {
    return res.status(400).json({
      error: "Paramètres 'from' et 'to' obligatoires",
    });
  }

  try {
    // Pour l'instant : 0 (ton Worker gère)
    const total = 0;

    return res.json({
      total,
      details: [],
    });
  } catch (err) {
    return res.status(500).json({
      error: "Erreur interne Render",
      details: `${err}`,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("API péages Render démarrée sur port " + PORT);
});
 
