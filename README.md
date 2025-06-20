# AI-Powered BIM Chatbot

A full-stack web application for semantic search and question-answering over BIM documents.

It allows users to upload and query architectural or engineering documentation using natural language. The system processes documents through OCR, parsing, and cleaning, generates vector embeddings, and delivers relevant answers in real-time using an AI model.


---

## What the App Does

- Semantic search and Q&A over BIM-related documents (PDFs, scans, etc.)
- OCR processing using Tesseract for image-based text extraction
- Text cleaning with regex-based rules
- Embeddings generated using Sentence Transformers
- Similarity search powered by FAISS (Quadrant indexing)
- Real-time AI responses using the Mistral model

---

## Tools and Technologies

- Frontend: React (JavaScript), responsive UI with editable chat history
- Backend: FastAPI
- Authentication: Auth0
- Database: PostgreSQL
- Vector Database: FAISS
- NLP Tools: Sentence Transformers, Tesseract OCR
- Integrations: Autodesk Forge, Revit API, BIM 360

---

## Preview

