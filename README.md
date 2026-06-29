# PixelForge AI

Intelligent image generation platform for creating realistic visuals and professional product images. Describe what you want, upload product photos, and apply predefined styles (luxury, minimal, outdoor) to produce advertisement-ready results.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI, Python |
| Frontend | Next.js, React, Tailwind CSS |
| Database | PostgreSQL |
| Image generation | Stable Diffusion via Hugging Face, Replicate, Stability AI |
| Background removal | remove.bg API |

## Project Structure

```
PixelForge-AI/
├── backend/          # FastAPI application
├── frontend/         # Next.js application
└── docs/             # Architecture & API documentation
```

## Getting Started

No Docker required — run PostgreSQL, the backend, and the frontend directly on your machine.

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ ([setup guide](docs/DATABASE.md))
- API keys for image providers (see `.env.example`)

### 1. PostgreSQL

Install PostgreSQL locally, then create the database:

```powershell
psql -U postgres -f backend/scripts/setup_postgres.sql
```

See [docs/DATABASE.md](docs/DATABASE.md) for full instructions.

### 2. Environment setup

From the project root:

```powershell
copy .env.example .env
```

Edit `.env` with your PostgreSQL credentials and API keys.

### 3. Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

### 4. Frontend

Open a second terminal:

```powershell
cd frontend
npm install
copy ..\.env.example .env.local
npm run dev
```

App: http://localhost:3000

## Features (planned)

- **Text-to-image** — Generate images from natural language prompts
- **Product enhancement** — Upload product photos and improve backgrounds, lighting, and appeal
- **Style presets** — Luxury, minimal, outdoor, and more
- **Multi-provider** — Switch between Hugging Face, Replicate, and Stability AI

## License

MIT
