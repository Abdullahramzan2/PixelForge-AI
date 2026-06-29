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

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/signup` | No | Register a new account |
| POST | `/api/v1/auth/login` | No | Log in with email or username |
| GET | `/api/v1/auth/me` | Yes | Get current user profile |
| PUT | `/api/v1/auth/username` | Yes | Update username |
| PUT | `/api/v1/auth/password` | Yes | Update password |
| DELETE | `/api/v1/auth/account` | Yes | Delete account |
| GET | `/api/v1/generation/styles` | No | List style presets |
| POST | `/api/v1/generation/text-to-image` | Yes | Generate image from prompt |
| GET | `/api/v1/generation/history` | Yes | List past generations |
| GET | `/api/v1/generation/{id}/image` | Yes | Download generated image |
| GET | `/health` | No | Health check |
