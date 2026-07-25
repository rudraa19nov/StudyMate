const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { storeDir, storeFile } = require("../config");

/**
 * A small on-disk vector store that plays the same role Chroma played in
 * the Python app (persist_directory="chroma_db"). It stores
 * { id, content, metadata, embedding } records as JSON and supports both
 * plain similarity search and Maximal Marginal Relevance (MMR) search,
 * matching the original retriever config:
 *
 *   vectorstore.as_retriever(
 *       search_type="mmr",
 *       search_kwargs={"k": 4, "fetch_k": 10, "lambda_mult": 0.5}
 *   )
 */

function ensureStoreDir() {
  if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true });
}

function loadStore() {
  ensureStoreDir();
  if (!fs.existsSync(storeFile)) return { documents: [], sourceFile: null, createdAt: null };
  try {
    return JSON.parse(fs.readFileSync(storeFile, "utf-8"));
  } catch (e) {
    return { documents: [], sourceFile: null, createdAt: null };
  }
}

function saveStore(store) {
  ensureStoreDir();
  fs.writeFileSync(storeFile, JSON.stringify(store), "utf-8");
}

function dotProduct(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function magnitude(a) {
  return Math.sqrt(dotProduct(a, a));
}

function cosineSimilarity(a, b) {
  const denom = magnitude(a) * magnitude(b);
  if (denom === 0) return 0;
  return dotProduct(a, b) / denom;
}

function exists() {
  const store = loadStore();
  return store.documents.length > 0;
}

function reset() {
  saveStore({ documents: [], sourceFile: null, createdAt: null });
}

/**
 * @param {Array<{pageContent: string, metadata: object}>} chunks
 * @param {number[][]} embeddings
 * @param {string} sourceFile
 */
function addDocuments(chunks, embeddings, sourceFile) {
  const documents = chunks.map((chunk, i) => ({
    id: uuidv4(),
    content: chunk.pageContent,
    metadata: chunk.metadata,
    embedding: embeddings[i],
  }));

  saveStore({ documents, sourceFile, createdAt: new Date().toISOString() });
  return documents.length;
}

function getStats() {
  const store = loadStore();
  return {
    exists: store.documents.length > 0,
    chunkCount: store.documents.length,
    sourceFile: store.sourceFile,
    createdAt: store.createdAt,
  };
}

/**
 * Plain top-k similarity search.
 */
function similaritySearch(queryEmbedding, k = 4) {
  const store = loadStore();
  const scored = store.documents.map((doc) => ({
    doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

/**
 * Maximal Marginal Relevance search — same algorithm family LangChain/Chroma
 * use under the hood: first grab `fetchK` nearest neighbours by similarity,
 * then greedily pick `k` of them balancing relevance vs. diversity using
 * `lambdaMult`.
 */
function mmrSearch(queryEmbedding, { k = 4, fetchK = 10, lambdaMult = 0.5 } = {}) {
  const store = loadStore();
  if (!store.documents.length) return [];

  const candidates = store.documents
    .map((doc) => ({ doc, relevance: cosineSimilarity(queryEmbedding, doc.embedding) }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, Math.min(fetchK, store.documents.length));

  const selected = [];
  const remaining = [...candidates];

  while (selected.length < Math.min(k, candidates.length) && remaining.length) {
    let bestIdx = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      let maxSim = 0;
      for (const sel of selected) {
        const sim = cosineSimilarity(candidate.doc.embedding, sel.doc.embedding);
        if (sim > maxSim) maxSim = sim;
      }
      const mmrScore = lambdaMult * candidate.relevance - (1 - lambdaMult) * maxSim;
      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIdx = i;
      }
    }

    selected.push(remaining[bestIdx]);
    remaining.splice(bestIdx, 1);
  }

  return selected;
}

module.exports = {
  exists,
  reset,
  addDocuments,
  getStats,
  similaritySearch,
  mmrSearch,
};
