const path = require("path");

require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  mistralApiKey: process.env.MISTRAL_API_KEY,
  mistralModel: process.env.MISTRAL_MODEL || "mistral-small-2506",

  // Same numbers the original Streamlit app used
  chunkSize: 1000,
  chunkOverlap: 200,

  retriever: {
    k: 4,
    fetchK: 10,
    lambdaMult: 0.5,
  },

  // Local, on-disk equivalent of the old "chroma_db" persist directory
  uploadsDir: path.join(__dirname, "..", "uploads"),
  storeDir: path.join(__dirname, "..", "store"),
  storeFile: path.join(__dirname, "..", "store", "vector-store.json"),

  embeddingModel: "Xenova/bge-small-en-v1.5",
};
