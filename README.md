# Nexa – NLP-Based Voice-Controlled Personal Assistant for Windows

Nexa is a local Windows personal assistant built without an AI model and without an external/paid AI API.

## Technologies

- React + Vite + JavaScript + CSS
- Python + FastAPI
- Rule-based NLP
- Windows local automation
- Browser Speech Recognition / Speech Synthesis where supported

## Architecture

User Voice/Text
→ Speech Recognition
→ NLP Preprocessing
→ Rule-Based Intent Detection
→ Entity Extraction
→ FastAPI
→ Python Windows Automation
→ Response
→ Text-to-Speech

## Run

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Important

This project intentionally does not use:
- Ollama
- Qwen
- OpenAI API
- Gemini API
- Claude API
- LLMs
- Cloud AI APIs
- AI API keys

Some browser searches naturally require an internet connection, but no AI service is used.
