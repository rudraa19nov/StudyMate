const { embeddingModel } = require("../config");

/**
 * Local, in-process embeddings — the NodeJS equivalent of the Python app's
 *   HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
 *
 * @xenova/transformers runs the ONNX build of the same bge-small-en-v1.5
 * model fully on-device (no external API key needed), so behaviour stays
 * close to the original Streamlit app.
 */

let extractorPromise = null;

async function getExtractor() {
  if (!extractorPromise) {
    // Lazy import because @xenova/transformers is an ESM package
    extractorPromise = import("@xenova/transformers").then(({ pipeline }) =>
      pipeline("feature-extraction", embeddingModel)
    );
  }
  return extractorPromise;
}

/**
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
async function embedTexts(texts) {
  const extractor = await getExtractor();
  const vectors = [];

  for (const text of texts) {
    const output = await extractor(text, { pooling: "mean", normalize: true });
    vectors.push(Array.from(output.data));
  }

  return vectors;
}

async function embedQuery(text) {
  const [vector] = await embedTexts([text]);
  return vector;
}

module.exports = { embedTexts, embedQuery };
