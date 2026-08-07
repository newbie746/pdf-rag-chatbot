# AI PDF Chatbot using RAG

A full-stack chatbot that lets you upload PDFs and ask questions about their content, using
Retrieval-Augmented Generation (RAG) with Google Gemini + ChromaDB.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Axios, React Router, React Icons
- **Backend:** Node.js, Express.js
- **AI / Embeddings:** Google Gemini API (`gemini-1.5-flash`) + Google `text-embedding-004`
- **Vector DB:** ChromaDB
- **PDF Parsing:** pdf-parse

## Folder Structure

```
pdf-rag-chatbot/
├── frontend/     React + Vite app
├── backend/      Express API (upload, chat, RAG pipeline)
└── README.md
```

## 1. Prerequisites

- Node.js 18+
- Python 3.9+ (only to run the ChromaDB server) OR Docker
- A Google Gemini API key: https://aistudio.google.com/app/apikey

## 2. Start ChromaDB (vector database)

Option A — via pip:

```bash
pip install chromadb
chroma run --path ./chroma_data --port 8000
```

Option B — via Docker:

```Shell
docker run -p 8000:8000 chromadb/chroma
```

Leave this running in its own terminal. The backend connects to it at `CHROMA_URL`
(default `http://localhost:8000`).

## 3. Backend setup

```bash
cd backend
cp .env.example .env      # then edit .env and add your GEMINI_API_KEY
npm install
npm run dev                # or: npm start
```

Backend runs on `http://localhost:5000`.

### Backend environment variables (`backend/.env`)

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
CHROMA_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

## 4. Frontend setup

```bash
cd frontend
cp .env.example .env      # defaults to http://localhost:5000, edit if deployed elsewhere
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## 5. Using the app

1. Open `http://localhost:5173`
2. Upload a PDF (drag & drop or click to browse) from the sidebar
3. Once processing finishes, ask questions in the chat box
4. Answers are generated only from the uploaded PDF content, with page-number source citations
5. Switch between documents, delete documents, toggle dark mode, or download the chat as .txt

## API Reference

### `POST /upload`

`multipart/form-data`, field name `pdf`. Extracts text, chunks it (500 words / 100-word overlap
per page), embeds each chunk, and stores it in ChromaDB.

Response:

```json
{ "success": true, "docId": "...", "fileName": "...", "numPages": 10, "numChunks": 24 }
```

### `POST /chat`

```json
{ "question": "What is Kubernetes?", "docId": "optional-doc-id" }
```

Flow: embed question → similarity search in Chroma (top 5 chunks) → build prompt → Gemini → answer.

Response:

```json
{ "success": true, "answer": "...", "sources": [3, 4] }
```

### `GET /documents`

Lists uploaded documents.

### `DELETE /documents/:docId`

Deletes a document's chunks from the vector store.

## Deploying to a server

- Run ChromaDB as a persistent service (systemd, Docker, or a managed Chroma Cloud instance) and
  point `CHROMA_URL` at it.
- Run the backend with a process manager, e.g. `pm2 start server.js --name pdf-rag-backend`.
- Build the frontend for production and serve the static files:
  ```bash
  cd frontend
  npm run build
  # serve the dist/ folder with nginx, or `npm run preview`, or any static host
  ```
- Set `FRONTEND_URL` in the backend `.env` to your deployed frontend origin (for CORS), and
  `VITE_API_URL` in the frontend `.env` to your deployed backend URL before building.

## Notes

- The prompt template restricts Gemini to answering only from retrieved context, minimizing
  hallucinations. If the answer isn't in the document, it replies:
  _"I couldn't find this information in the uploaded document."_
- Chunking is done per PDF page (500 words, 100-word overlap) so each chunk keeps a page number
  for source citation in the UI.
