const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const { uploadsDir, chunkSize, chunkOverlap } = require("../config");
const { loadPdfAsDocuments } = require("../services/pdfService");
const { splitDocuments } = require("../services/textSplitter");
const { embedTexts } = require("../services/embeddingService");
const vectorStore = require("../services/vectorStore");

const router = express.Router();

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are supported"));
    }
    cb(null, true);
  },
  limits: { fileSize: 300 * 1024 * 1024 }, // 300MB
});

// Step 1 — upload a PDF
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file was received." });
  }
  res.json({
    fileId: req.file.filename,
    fileName: req.file.originalname,
    sizeBytes: req.file.size,
  });
});

// Step 2 — build the knowledge base (chunk + embed + persist)
router.post("/build", async (req, res) => {
  try {
    const { fileId, fileName } = req.body;
    if (!fileId) return res.status(400).json({ error: "fileId is required." });

    const filePath = path.join(uploadsDir, fileId);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Uploaded file was not found. Please upload again." });
    }

    const docs = await loadPdfAsDocuments(filePath, fileName || fileId);
    const chunks = splitDocuments(docs, chunkSize, chunkOverlap);

    if (!chunks.length) {
      return res.status(422).json({ error: "No extractable text was found in this PDF." });
    }

    const embeddings = await embedTexts(chunks.map((c) => c.pageContent));
    const chunkCount = vectorStore.addDocuments(chunks, embeddings, fileName || fileId);

    res.json({ success: true, chunkCount, sourceFile: fileName || fileId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to build the knowledge base." });
  }
});

// Knowledge base status
router.get("/status", (req, res) => {
  res.json(vectorStore.getStats());
});

// Reset / clear the knowledge base
router.delete("/reset", (req, res) => {
  vectorStore.reset();
  res.json({ success: true });
});

module.exports = router;
