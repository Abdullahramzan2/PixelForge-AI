# PostgreSQL Setup

PixelForge AI uses **PostgreSQL** as its database. Install and run PostgreSQL locally on your machine — no Docker required.

## 1. Install PostgreSQL (Windows)

**Option A — Installer (recommended)**

1. Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run the installer and note the password you set for the `postgres` superuser
3. Keep the default port `5432`

**Option B — winget**

```powershell
winget install PostgreSQL.PostgreSQL
```

## 2. Create the database and user

Open **SQL Shell (psql)** or run `psql` from a terminal as the `postgres` user:

```sql
CREATE USER pixelforge WITH PASSWORD 'pixelforge';
CREATE DATABASE pixelforge OWNER pixelforge;
GRANT ALL PRIVILEGES ON DATABASE pixelforge TO pixelforge;
```

Or use the provided script from the project root:

```powershell
psql -U postgres -f backend/scripts/setup_postgres.sql
```

## 3. Configure environment

Copy `.env.example` to `.env` and verify the PostgreSQL settings match your setup:

```env
POSTGRES_USER=pixelforge
POSTGRES_PASSWORD=pixelforge
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=pixelforge
```

## 4. Run migrations

From the `backend` folder with your virtual environment active:

```powershell
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
```

This creates the `users`, `generations`, and `product_images` tables.

## 5. Verify connection

Start the backend:

```powershell
uvicorn app.main:app --reload
```

Visit http://localhost:8000/health — you should get `{"status":"ok",...}`.

## Schema

| Table           | Purpose                              |
|-----------------|--------------------------------------|
| `users`         | User accounts                        |
| `generations`   | Text-to-image generation history     |
| `product_images`| Product uploads and enhancements     |

## Useful commands

```powershell
# Check migration status
alembic current

# Create a new migration after model changes
alembic revision --autogenerate -m "describe change"

# Apply pending migrations
alembic upgrade head

# Roll back one migration
alembic downgrade -1
```

## Cloud PostgreSQL (optional)

You can also use a hosted provider (Neon, Supabase, Railway, etc.). Set `DATABASE_URL` in `.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

This overrides the individual `POSTGRES_*` variables.
