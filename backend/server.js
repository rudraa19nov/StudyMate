const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { port, corsOrigin } = require("./src/config");
const documentsRouter = require("./src/routes/documents");
const chatRouter = require("./src/routes/chat");

const app = express();

app.use(cors({ origin: corsOrigin }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "studymate-backend" });
});

app.use("/api/documents", documentsRouter);
app.use("/api/chat", chatRouter);

// Centralized error handler (e.g. Multer file-type errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong." });
});

app.listen(port, () => {
  console.log(`🪄 StudyMate backend running on http://localhost:${port}`);
});
