const express = require("express");

const { retriever } = require("../config");
const { embedQuery } = require("../services/embeddingService");
const vectorStore = require("../services/vectorStore");
const { askMistral } = require("../services/mistralService");

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "question is required." });
    }

    if (!vectorStore.exists()) {
      return res.status(409).json({
        error: "No knowledge base found yet. Upload a PDF and build the knowledge base first.",
      });
    }

    const queryEmbedding = await embedQuery(question);

    const results = vectorStore.mmrSearch(queryEmbedding, {
      k: retriever.k,
      fetchK: retriever.fetchK,
      lambdaMult: retriever.lambdaMult,
    });

    const context = results.map((r) => r.doc.content).join("\n\n");
    const answer = await askMistral(context, question);

    res.json({
      answer,
      sources: results.map((r, i) => ({
        index: i + 1,
        excerpt: r.doc.content.slice(0, 400) + (r.doc.content.length > 400 ? "..." : ""),
        metadata: r.doc.metadata,
        relevance: r.relevance,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to answer the question." });
  }
});

module.exports = router;
