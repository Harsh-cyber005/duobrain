# 🧠 duobrain

**duobrain** is your personal "Second Brain"—a central hub to store, organize, and retrieve everything that matters. Whether it's a deep-dive YouTube video, a viral tweet, a random thought, or an essential document, duobrain keeps it all in one place.

Unlike a simple bookmarking app, duobrain uses **AI-powered vector embeddings** to help you find your content based on meaning, not just keywords.

---

## ✨ Features

* **Multi-Format Support:** Native embedding for YouTube, X (Twitter), Instagram, Pinterest, Documents, and Web Links.
* **AI Search:** Integrated with Hugging Face models to provide semantic search—find that "video about pasta" even if the title doesn't contain the word "pasta."
* **Brain Sharing:** Generate a unique link to share your entire collection or just a specific selection of items.
* **Knowledge Merging:** One-click import to merge a friend's shared brain into your own.
* **Smart Filtering:** Instantly toggle between content types using the sleek sidebar navigation.
* **Secure Auth:** OTP-based email verification and JWT-protected sessions.

---

## 🛠 Tech Stack

| Component | Technology |
| --- | --- |
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript, Zod |
| **Database** | MongoDB (Atlas), Mongoose |
| **AI/ML** | Hugging Face Inference (`all-MiniLM-L6-v2` for embeddings) |
| **Mailing** | Nodemailer (Gmail SMTP) |

---

## 🏗 System Architecture

1. **Ingestion:** When you add a link or text, the backend sends the content to an embedding model.
2. **Vector Storage:** The resulting high-dimensional vector is stored alongside your content in MongoDB.
3. **Retrieval:** Searching triggers a vector search (`$vectorSearch`), comparing your query's "meaning" against your stored data.
4. **UI:** A responsive dashboard built with Next.js renders the content using social media embed providers for a rich preview experience.

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd server
npm install
# Create a .env or modify config.ts with your:
# MONGO_URL, JWT_SECRET, HF_TOKEN, GMAIL_PASSWORD
npm run build
npm start

```

### 2. Frontend Setup

```bash
cd client
pnpm install
pnpm run dev

```

Open `http://localhost:3000/duobrain` to start building your brain.

---

## 📂 Project Structure

* `client/app/`: Next.js pages and AI search logic.
* `client/app/_components/ui/`: Modular UI components like `Card`, `SearchBar`, and `Modal`.
* `server/src/index.ts`: Main Express entry point with CRUD and Search routes.
* `server/src/generate_embeddings.ts`: The bridge to Hugging Face for semantic analysis.
* `server/src/model.ts`: MongoDB schemas for Users, Content, and Cache.

---
