# ParallelRead

**ParallelRead** is an AI-powered bilingual reading platform designed to make reading foreign texts effortless. It extracts text from uploaded documents (PDF, DOCX, TXT) or raw text input, splits the content sentence-by-sentence, and displays the source text alongside synchronized translations powered by Google Gemini and MongoDB caching.

---

## 🌟 What It Does

- **Document Ingestion**: Accepts `.pdf`, `.docx`, and `.txt` files or direct raw text input.
- **Smart Sentence Segmentation**: Parses and divides text into clean, individual sentences preserving structure and punctuation.
- **BYOK (Bring Your Own Key)**: Users can enter their own Google Gemini API key directly in the web UI. Keys are stored locally in the browser (`localStorage`) and sent securely per request.
- **Parallel Bilingual Reading View**: Displays original and translated sentences aligned side-by-side or stacked in a distraction-free, modern reading UI.
- **Chunked On-Demand Translation**: Translates text asynchronously in batches (20 sentences at a time) for smooth, non-blocking UI loading.
- **Persistent Translation Caching**: Uses SHA-256 sentence hashing and MongoDB caching to avoid redundant API calls, minimize latency, and reduce Gemini API costs.
- **Interactive Reader Controls**: Includes parallel/stacked layout toggling, font size zoom adjustments (`A-` / `A+`), and on-the-fly language switching (Hindi, Japanese, Spanish, French, etc.).

---

## 🏗️ How It Works (Architecture & Workflow)

```
[ User Upload (PDF / DOCX / TXT / Raw Text) ]
                      │
                      ▼
            [ Next.js Frontend ]
                      │  POST /api/upload
                      ▼
         [ Express.js Backend Server ]
                      │
      ┌───────────────┴───────────────┐
      ▼                               ▼
[ PDF / DOCX / TXT Parsers ]   [ Sentence Splitter ]
(pdf-parse / mammoth)          (textParser.js)
                      │
                      ▼
      [ Return Sentences Array to Client ]
                      │
                      ▼
         [ Client Starts Batching ]
          (POST /api/translate)
                      │
                      ▼
           [ Translation Service ]
                      │
            ┌─────────┴─────────┐
       In Cache?            Missing?
            │                   │
         [ YES ]             [ NO ]
            │                   │
     Return Cached        Call Google Gemini API
     from MongoDB         (gemini-2.5-flash with
                          JSON schema enforcement)
                                │
                          Save to MongoDB
                                │
                      ┌─────────┴─────────┐
                      ▼                   ▼
           [ Synchronized Side-by-Side Reader UI ]
```

### 1. Document Extraction & Sentence Splitting
- When a document is uploaded, Express receives it via `multer.memoryStorage()`.
- Based on the file type:
  - **PDF**: Parsed using `pdf-parse`.
  - **DOCX**: Raw text extracted with `mammoth`.
  - **TXT**: Read directly as UTF-8 string buffer.
- `server/utils/textParser.js` normalizes whitespace and splits the text into sentences using punctuation boundaries (`.`, `!`, `?`).

### 2. Batch Translation & Gemini AI
- The frontend triggers batch requests (`BATCH_SIZE = 20`) to `POST /api/translate`.
- `translationService.js` computes a SHA-256 hash (`${sentence}_${targetLang}`) for each sentence and queries MongoDB.
- Any cache misses are batched into a single prompt sent to Google's `gemini-2.5-flash` model using structured JSON schema output to guarantee sentence count and order preservation.
- New translations are saved to MongoDB with their hashes for instant future retrieval.

### 3. Frontend Parallel UI
- Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Framer Motion**.
- Displays original text paired with the corresponding translation.
- Provides dynamic loading skeletons and indicators while batches resolve in the background.

---

## 📁 Project Structure

```
ParallelRead/
├── package.json              # Next.js frontend dependencies & scripts
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── public/                   # Static assets & illustrations
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout & fonts
│   │   ├── page.tsx          # Landing & file upload coordinator
│   │   └── globals.css       # Global styling & Tailwind directives
│   ├── components/
│   │   ├── ApiKeyModal.tsx   # Modal for users to set/update their Gemini API key
│   │   ├── FileUpload.tsx    # Drag-and-drop file upload & language selection
│   │   └── ReaderView.tsx    # Parallel reading view with zoom & mode toggles
│   └── lib/
│       ├── api.ts            # Axios client communicating with backend
│       └── utils.ts          # Class merging utility (clsx + twMerge)
└── server/
    ├── package.json          # Backend dependencies & scripts
    ├── index.js              # Express app & MongoDB connection
    ├── controllers/
    │   └── readController.js # Upload handling & batch translation endpoints
    ├── models/
    │   ├── Translation.js    # Mongoose schema for cached translations
    │   └── Vocabulary.js     # Mongoose schema for saved vocabulary
    ├── routes/
    │   └── readRoutes.js     # API route declarations (/upload, /translate)
    ├── services/
    │   └── translationService.js # Gemini API integration & cache resolution
    └── utils/
        └── textParser.js     # Sentence boundary parser & cleaner
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB** instance (local or MongoDB Atlas connection URI)
- **Google Gemini API Key** ([Google AI Studio](https://aistudio.google.com/))

---

### Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` folder with the following variables:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/parallelread
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the backend server:
   ```bash
   # Development mode with hot-reloading:
   npm run dev

   # Or standard production mode:
   npm start
   ```
   The backend will start on `http://localhost:3001`.

---

### Frontend Setup

1. In the root directory (`ParallelRead`):
   ```bash
   npm install
   ```

2. Start the Next.js development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ API Reference

| Endpoint | Method | Payload | Description |
|---|---|---|---|
| `/api/upload` | `POST` | `multipart/form-data` with `file` OR JSON `{ rawText, targetLang }` | Parses file or raw text and returns `{ sentences: string[] }`. |
| `/api/translate` | `POST` | JSON `{ sentences: string[], targetLang: string }` | Returns `{ translations: string[] }` checking cache and querying Gemini for uncached items. |

---

## 🧰 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons, Axios.
- **Backend**: Node.js, Express 4, Multer (Memory Storage), `pdf-parse`, `mammoth`.
- **Database & Cache**: MongoDB, Mongoose (indexed SHA-256 hash lookup).
- **AI / LLM**: Google Generative AI (`@google/generative-ai`), `gemini-2.5-flash`.
