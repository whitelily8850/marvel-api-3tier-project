const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

const avengerSchema = new mongoose.Schema({
  name: String,
  power: String
});

const Avenger = mongoose.model("Avenger", avengerSchema);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

// Add avenger
app.post("/avengers", async (req, res) => {
  const { name, power } = req.body;

  if (!name || !power) {
    return res.status(400).json({ message: "name and power required" });
  }

  const newAvenger = new Avenger({ name, power });
  await newAvenger.save();

  res.json({ message: "✅ Avenger added", data: newAvenger });
});

// Get all avengers
app.get("/avengers", async (req, res) => {
  const avengers = await Avenger.find();
  res.json(avengers);
});

app.listen(3000, () => console.log("🚀 Node API running on port 3000"));