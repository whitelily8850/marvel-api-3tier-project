const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URL =
  process.env.MONGO_URL ||
  `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST || "mongo-service"}:${process.env.MONGO_PORT || 27017}/${process.env.MONGO_DB || "admin"}`;

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

const avengerSchema = new mongoose.Schema({
  name: String,
  power: String
});

const Avenger = mongoose.model("Avenger", avengerSchema);

// Liveness: process is up and serving requests
app.get("/health/live", (req, res) => {
  res.json({ status: "UP" });
});

// Readiness: process is up AND its database dependency is reachable
app.get("/health/ready", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? "READY" : "NOT_READY" });
});

app.get("/", (req, res) => {
  res.json({ service: "avengers-api", status: "running" });
});

// Add avenger
app.post("/avengers", async (req, res) => {
  try {
    const { name, power } = req.body;

    if (!name || !power) {
      return res.status(400).json({ message: "name and power required" });
    }

    const newAvenger = new Avenger({ name, power });
    await newAvenger.save();

    res.status(201).json({ message: "✅ Avenger added", data: newAvenger });
  } catch (err) {
    console.error("❌ Failed to add avenger:", err);
    res.status(500).json({ message: "Failed to add avenger" });
  }
});

// Get all avengers
app.get("/avengers", async (req, res) => {
  try {
    const avengers = await Avenger.find();
    res.json(avengers);
  } catch (err) {
    console.error("❌ Failed to fetch avengers:", err);
    res.status(500).json({ message: "Failed to fetch avengers" });
  }
});

app.listen(PORT, () => console.log(`🚀 Node API running on port ${PORT}`));
