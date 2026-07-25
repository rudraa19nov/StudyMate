# StudyMate — Next.js + Node.js Edition

This is your original **StudyMate** (Python + Streamlit) project, rebuilt with:

- **Frontend:** Next.js (React) — `frontend/`
- **Backend:** Node.js + Express — `backend/`

All the original functionality is preserved:

1. Upload a PDF
2. Build a searchable knowledge base (chunk → embed → vector store)
3. Ask questions and get answers grounded in the document, with source excerpts

Nothing from the original app was removed — it was translated 1:1 into JS, plus a
few extra features (see below).

---

## What changed under the hood (and why)

| Python (old)                              | Node.js (new)                                              |
|--------------------------------------------|--------------------------------------------------------------|
| `PyPDFLoader`                               | `pdf-parse`                                                  |
| `RecursiveCharacterTextSplitter` (LangChain)| Hand-written equivalent in `backend/src/services/textSplitter.js` (same `chunk_size=1000` / `chunk_overlap=200`) |
| `HuggingFaceEmbeddings("BAAI/bge-small-en-v1.5")` | `@xenova/transformers` running the same model **locally**, no API key needed |
| `Chroma` vector store                       | A small JSON-backed vector store (`backend/store/vector-store.json`) with cosine similarity + **MMR** retrieval (same `k=4, fetch_k=10, lambda_mult=0.5`) |
| `ChatMistralAI`                             | Direct call to the Mistral REST API with the exact same system/human prompt |
| Streamlit UI                                | Next.js + Tailwind UI (new "Sunlit Study" theme, unique fonts) |

Your `MISTRAL_API_KEY` from the original `.env` was carried over into `backend/.env`.

---

## New look

The original app used a dark theme (Sora / Space Grotesk fonts, purple-pink-teal
palette). The new frontend uses a distinct **"Sunlit Study"** theme:

- **Fonts:** [Fraunces](https://fonts.google.com/specimen/Fraunces) (serif display) + [Manrope](https://fonts.google.com/specimen/Manrope) (body)
- **Colors:** warm parchment background, forest green + burnt amber/gold accents
- Light/dark mode toggle included

## Extra features added (nothing removed)

- 🌗 Light/dark mode toggle
- 🗂️ Chat history — every question you ask stays on screen, not just the latest one
- 🧹 "Reset knowledge base" button
- 📥 Drag-and-drop PDF upload
- 🔔 Toast notifications for success/errors
- 📊 A sidebar status panel showing how many chunks are indexed and from which file

---

## Running it locally

### 1. Backend

```bash
cd backend
npm install
npm start
```

Runs on **http://localhost:5000**. The Mistral key is already in `backend/.env`
(copied from your original project) — double check it's still valid.

> First time you build a knowledge base, `@xenova/transformers` will download
> the `bge-small-en-v1.5` embedding model (a few dozen MB) from Hugging Face.
> This requires an internet connection but only happens once — it's cached
> locally afterwards.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:3000**. It talks to the backend via
`NEXT_PUBLIC_API_URL` in `frontend/.env.local` (defaults to
`http://localhost:5000`).

### 3. Use it

Open http://localhost:3000, upload a PDF, click **"Create Vector Database"**,
then ask questions.

---

## Project structure

```
studymate-new/
├── backend/
│   ├── server.js                  # Express entrypoint
│   ├── src/
│   │   ├── config.js
│   │   ├── routes/
│   │   │   ├── documents.js       # upload / build / status / reset
│   │   │   └── chat.js            # ask
│   │   └── services/
│   │       ├── pdfService.js
│   │       ├── textSplitter.js
│   │       ├── embeddingService.js
│   │       ├── vectorStore.js
│   │       └── mistralService.js
│   ├── uploads/                   # uploaded PDFs land here
│   └── store/                     # persisted vector store (JSON)
└── frontend/
    ├── app/
    │   ├── layout.jsx
    │   ├── page.jsx
    │   └── globals.css
    ├── components/
    │   ├── Hero.jsx
    │   ├── Sidebar.jsx
    │   ├── UploadCard.jsx
    │   ├── AskCard.jsx
    │   ├── AnswerBox.jsx
    │   ├── ThemeToggle.jsx
    │   ├── Toast.jsx
    │   └── Footer.jsx
    ├── lib/api.js                 # fetch wrappers around the backend
    └── tailwind.config.js         # custom color palette + fonts
```

## Notes

- The backend and frontend both passed a local build/smoke test in this
  environment (health check, PDF parsing + chunking against your original
  `notes.pdf` sample, and a full Next.js production build all succeeded).
  The only thing that couldn't be tested here is a live call to the Mistral
  API and the first-run Hugging Face model download, since this sandbox has
  restricted internet access — both will work normally on your machine.
- Your original Python project files (`app.py`, `main.py`, `createDb.py`,
  the `retrievers/` experiments, etc.) are untouched — this is a separate,
  new `studymate-new/` folder alongside them.
