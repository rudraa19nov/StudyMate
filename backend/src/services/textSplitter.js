/**
 * A JS re-implementation of LangChain's RecursiveCharacterTextSplitter,
 * used previously in app.py / createDb.py:
 *
 *   RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
 *
 * It tries a list of separators from "biggest" to "smallest" and only
 * falls back to a smaller separator when a piece is still too large.
 */

const DEFAULT_SEPARATORS = ["\n\n", "\n", ". ", " ", ""];

function splitOnSeparator(text, separator) {
  if (separator === "") return text.split("");
  return text.split(separator);
}

function mergeSplits(splits, separator, chunkSize, chunkOverlap) {
  const docs = [];
  let currentDoc = [];
  let total = 0;

  const joinDoc = (doc) => doc.join(separator).trim();

  for (const s of splits) {
    const len = s.length;
    if (total + len + (currentDoc.length > 0 ? separator.length : 0) > chunkSize && currentDoc.length > 0) {
      const joined = joinDoc(currentDoc);
      if (joined) docs.push(joined);

      // Backtrack for overlap
      while (
        total > chunkOverlap ||
        (total + len + (currentDoc.length > 0 ? separator.length : 0) > chunkSize && total > 0)
      ) {
        total -= currentDoc[0].length + (currentDoc.length > 1 ? separator.length : 0);
        currentDoc.shift();
      }
    }
    currentDoc.push(s);
    total += len + (currentDoc.length > 1 ? separator.length : 0);
  }

  const joined = joinDoc(currentDoc);
  if (joined) docs.push(joined);

  return docs;
}

function recursiveSplit(text, separators, chunkSize, chunkOverlap) {
  const finalChunks = [];
  let separator = separators[separators.length - 1];
  let nextSeparators = [];

  for (let i = 0; i < separators.length; i++) {
    const sep = separators[i];
    if (sep === "" || text.includes(sep)) {
      separator = sep;
      nextSeparators = separators.slice(i + 1);
      break;
    }
  }

  const splits = splitOnSeparator(text, separator).filter((s) => s !== "");

  const goodSplits = [];
  for (const s of splits) {
    if (s.length < chunkSize) {
      goodSplits.push(s);
    } else {
      if (goodSplits.length) {
        finalChunks.push(...mergeSplits(goodSplits, separator, chunkSize, chunkOverlap));
        goodSplits.length = 0;
      }
      if (!nextSeparators.length) {
        finalChunks.push(s);
      } else {
        finalChunks.push(...recursiveSplit(s, nextSeparators, chunkSize, chunkOverlap));
      }
    }
  }

  if (goodSplits.length) {
    finalChunks.push(...mergeSplits(goodSplits, separator, chunkSize, chunkOverlap));
  }

  return finalChunks;
}

/**
 * @param {Array<{pageContent: string, metadata: object}>} docs
 * @param {number} chunkSize
 * @param {number} chunkOverlap
 */
function splitDocuments(docs, chunkSize = 1000, chunkOverlap = 200) {
  const chunks = [];
  for (const doc of docs) {
    const pieces = recursiveSplit(doc.pageContent, DEFAULT_SEPARATORS, chunkSize, chunkOverlap);
    for (const piece of pieces) {
      chunks.push({ pageContent: piece, metadata: { ...doc.metadata } });
    }
  }
  return chunks;
}

module.exports = { splitDocuments };
