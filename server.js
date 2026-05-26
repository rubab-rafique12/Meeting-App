require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

/* ----------------------------- */
/* Ensure uploads folder exists  */
/* ----------------------------- */

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads/ directory");
}

/* Gemini setup */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

/* Multer storage */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + ".m4a");
  }
});

const upload = multer({ storage: storage });

/* Test route */

app.get("/", (req, res) => {
  res.json({ message: "Meeting Notes Backend Running" });
});

/* ----------------------------- */
/* AUDIO → TRANSCRIPT (GEMINI)  */
/* ----------------------------- */

app.post("/upload-audio", upload.single("audio"), async (req, res) => {

  try {

    /* Guard: no file received */
    if (!req.file) {
      return res.status(400).json({
        message: "No audio file received"
      });
    }

    const filePath = req.file.path;

    console.log("Audio file received:", filePath);

    // Upload the audio file to Gemini
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: "audio/mp4",
      displayName: "Meeting Audio",
    });

    // Transcribe with gemini-2.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([
      { fileData: { fileUri: uploadResult.file.uri, mimeType: uploadResult.file.mimeType } },
      { text: "Please transcribe this audio exactly as it is spoken. Do not add any extra text or summaries. The language is likely English." }
    ]);
    
    const transcriptText = result.response.text();
    console.log("Transcript:", transcriptText);

    // Cleanup: delete the file from Gemini
    await fileManager.deleteFile(uploadResult.file.name);

    res.json({
      message: "Audio processed",
      transcript: transcriptText
    });

  } catch (error) {

    console.error("Transcription error:", error.message || error);

    // Provide a simulated fallback if the API key is out of quota or invalid
    if (error.status === 429 || error.status === 401 || (error.message && (error.message.includes("429") || error.message.includes("401") || error.message.includes("API key not valid")))) {
      return res.json({
        message: "Audio processed (Simulated)",
        transcript: `This is a simulated transcript. The backend successfully received your audio, but the Gemini API key encountered an error. To get real transcriptions, please ensure your API key has quota.`
      });
    }

    res.status(500).json({
      message: "Transcription failed",
      error: error.message || "Unknown error"
    });

  }

});

/* ----------------------------- */
/* TRANSCRIPT → SUMMARY (GEMINI)*/
/* ----------------------------- */

app.post("/generate-summary", async (req, res) => {

  try {

    const { transcript } = req.body;

    /* Guard: no transcript provided */
    if (!transcript || transcript.trim() === "") {
      return res.status(400).json({
        message: "No transcript provided"
      });
    }

    console.log("Transcript received for summary:", transcript.substring(0, 100) + "...");

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are a meeting assistant. Summarize the meeting transcript into clear bullet points."
    });
    
    const result = await model.generateContent(transcript);
    const summary = result.response.text();

    console.log("Summary generated successfully");

    res.json({
      summary: summary
    });

  } catch (error) {

    console.error("Summary error:", error.message || error);

    // Provide a simulated fallback if the API key is out of quota or invalid
    if (error.status === 429 || error.status === 401 || (error.message && (error.message.includes("429") || error.message.includes("401") || error.message.includes("API key not valid")))) {
      return res.json({
        summary: `• Simulated Summary Point 1: The user successfully uploaded an audio file.\n• Simulated Summary Point 2: The Gemini API key encountered an error.\n• Simulated Summary Point 3: The backend returned this dummy summary so the app UI can still be tested.`
      });
    }

    res.status(500).json({
      message: "Summary generation failed",
      error: error.message || "Unknown error"
    });

  }

});

/* ----------------------------- */
/* USER AUTH                     */
/* ----------------------------- */

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const USERS_FILE = path.join(__dirname, "users.json");

const readUsers = () => {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
};
const writeUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });
    
    const users = readUsers();
    if (users.find(u => u.email === email)) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), name, email, password: hashedPassword };
    users.push(newUser);
    writeUsers(users);

    const token = jwt.sign({ id: newUser.id, email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "User created", token, user: { id: newUser.id, name, email } });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, email } });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

/* Start server */

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} at 0.0.0.0`);
});