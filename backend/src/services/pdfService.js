const fs = require("fs");
const pdfParse = require("pdf-parse");

/**
 * Loads a PDF from disk and returns it as an array of "documents" (one per
 * page), mirroring LangChain's PyPDFLoader output shape used by the
 * original Python app (loader.load() -> List[Document]).
 *
 * @param {string} filePath
 * @param {string} fileName
 * @returns {Promise<Array<{pageContent: string, metadata: object}>>}
 */
async function loadPdfAsDocuments(filePath, fileName) {
  const buffer = fs.readFileSync(filePath);

  const pages = [];
  await pdfParse(buffer, {
    // pagerender is called once per page by pdf-parse internals
    pagerender: async (pageData) => {
      const textContent = await pageData.getTextContent();
      const text = textContent.items.map((item) => item.str).join(" ");
      pages.push(text);
      return text;
    },
  });

  return pages.map((text, index) => ({
    pageContent: text,
    metadata: { source: fileName, page: index + 1 },
  }));
}

module.exports = { loadPdfAsDocuments };
