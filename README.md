# Doc2SDK: AI-Powered API Integration Assistant

Doc2SDK is an intelligent API integration platform that automatically extracts API documentation, understands API behavior, generates production-ready SDK code, creates comprehensive tests, and provides an interactive playground for developers.

## 📺 Demo

https://github.com/rajaganapathi672/Doc2SDK/raw/master/InShot_compressed.mp4

> [!TIP]
> This video is located at `./InShot_compressed.mp4` in this repository.


## 🚀 Key Features

- **Multi-Source Extraction**: Parse OpenAPI, Swagger, Postman, and more.
- **Smart Code Gen**: Generate type-safe SDKs in Python, TypeScript, and more.
- **Auto-Testing**: Get unit and integration tests for every endpoint.
- **Interactive Playground**: Test APIs directly from the dashboard.
- **Change Monitoring**: Detect breaking changes in external APIs automatically.

## 🛠️ Technology Stack

- **Backend**: FastAPI (Python), SQLAlchemy, PostgreSQL, Redis, Celery.
- **Frontend**: React (Vite), TypeScript, Framer Motion, Lucide Icons.
- **AI**: Integrates **Google Gemini 2.0/1.5** for intelligent parsing and API specification extraction.

## 🏁 Getting Started

### Using Docker (Recommended)

```bash
docker-compose up --build
```
*Frontend runs on `http://localhost:5173` | Backend on `http://localhost:8000`*

### Manual Setup

1. **Backend**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   # Runs on http://localhost:5173
   ```

## 📂 Project Structure

- `backend/`: FastAPI application, services, and AI logic.
- `frontend/`: React application with modern UI components.
- `docker-compose.yml`: Infrastructure orchestration.

## 📄 License

MIT
