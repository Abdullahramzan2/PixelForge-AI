# Architecture

## Overview

PixelForge AI is a monorepo with a **FastAPI** backend and **Next.js** frontend.

```
┌─────────────┐     REST API      ┌─────────────┐
│   Next.js   │ ◄──────────────► │   FastAPI   │
│  Frontend   │                   │   Backend   │
└─────────────┘                   └──────┬──────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
              Hugging Face          Replicate           Stability AI
              (SD free)             (SD API)            (Official SD)
                    │
                    ▼
               remove.bg
            (background removal)
```

## Image Generation Flow

1. User submits prompt or uploads product image via frontend
2. Backend validates request and selects provider (Hugging Face / Replicate / Stability)
3. For product enhancement: remove.bg strips background, then SD generates new scene
4. Result stored in `generated/` and metadata saved to database
5. Frontend displays result and history

## Style Presets

| Style   | Use case                          |
|---------|-----------------------------------|
| Luxury  | Premium products, jewelry, fashion |
| Minimal | Clean catalog, tech products       |
| Outdoor | Lifestyle, sports, nature products |

## Database

PostgreSQL runs locally on your machine (no Docker). See [DATABASE.md](DATABASE.md) for install and migration steps.

| Table           | Purpose                          |
|-----------------|----------------------------------|
| `users`         | User accounts                    |
| `generations`   | Text-to-image history            |
| `product_images`| Product uploads & enhancements   |

## API Routes

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| POST   | `/api/v1/generation/text-to-image` | Generate from prompt |
| GET    | `/api/v1/generation/history`         | List past generations |
| POST   | `/api/v1/products/upload`            | Upload product photo  |
| POST   | `/api/v1/products/enhance`           | Enhance product image |
| GET    | `/api/v1/styles/`                    | List style presets    |
