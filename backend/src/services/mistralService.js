const { mistralApiKey, mistralModel } = require("../config");

const SYSTEM_PROMPT = `You are a helpful AI assistant.

Use ONLY the provided context to answer the question.

If the answer is not present in the context,
say: "I could not find the answer in the document."`;

/**
 * @param {string} context
 * @param {string} question
 * @returns {Promise<string>}
 */
async function askMistral(context, question) {
  if (!mistralApiKey) {
    throw new Error(
      "MISTRAL_API_KEY is missing. Add it to backend/.env before asking questions."
    );
  }

  const humanPrompt = `Context:\n${context}\n\nQuestion:\n${question}\n`;

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mistralApiKey}`,
    },
    body: JSON.stringify({
      model: mistralModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: humanPrompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Mistral API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

module.exports = { askMistral };
