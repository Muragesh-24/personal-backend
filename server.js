// server.js  –  minimal visitor counter + contact form
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";

const PORT = process.env.PORT || 3000;
const app  = express();
app.use(cors());
app.use(express.json());

// ---------- file helpers ----------
const DATA_DIR      = path.resolve("./");
const COUNTER_FILE  = path.join(DATA_DIR, "counter.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

function safeRead(filePath, fallback) {
  try {
    const txt = fs.readFileSync(filePath, "utf-8");
    return txt.trim() ? JSON.parse(txt) : fallback;
  } catch {
    // any error → return fallback
    return fallback;
  }
}

function safeWrite(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// create files with defaults the first time
if (!fs.existsSync(COUNTER_FILE))  safeWrite(COUNTER_FILE, { total: 0 });
if (!fs.existsSync(MESSAGES_FILE)) safeWrite(MESSAGES_FILE, []);


// ---------- routes ----------
app.get("/visit", (req, res) => {
  const noIncrement = req.query.noIncrement === 'true'; // Check for noIncrement flag
  const counter = safeRead(COUNTER_FILE, { total: 0 });

  if (!noIncrement) {
    counter.total += 1;
    safeWrite(COUNTER_FILE, counter);
  }

  res.json({ visitors: counter.total });
});


app.post("/message", (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message)
    return res.status(400).json({ error: "All fields required." });

  const messages = safeRead(MESSAGES_FILE, []);
  messages.push({ name, email, message, time: new Date().toISOString() });
  safeWrite(MESSAGES_FILE, messages);

  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
