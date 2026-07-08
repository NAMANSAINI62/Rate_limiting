# Rate Limiting Learning Project

> A **production-style, fully documented** full-stack application that teaches
> API rate limiting from first principles — not just how to use it, but **why**
> it exists and how it works in real systems.

---

## What You Will Learn

| Concept | Description |
|---|---|
| **What is rate limiting?** | Controlling how many requests a client can make in a time window |
| **Why is it required?** | Protect servers from abuse, ensure fair usage, prevent DDoS |
| **SlowAPI integration** | How to add rate limiting to FastAPI with 3 lines of code |
| **HTTP 429** | The exact response when a client exceeds their limit |
| **Retry-After header** | How servers tell clients when they can try again |
| **Cooldown system** | Frontend lockout + countdown timer after hitting the limit |
| **Redis as storage** | Why in-memory counters are unsafe; how Redis solves it |
| **JWT + RBAC** | Role-based access control with Admin / Manager / User roles |
| **Async Python** | FastAPI + SQLAlchemy async patterns |
| **Docker Compose** | Running PostgreSQL + Redis with one command |

---

## Tech Stack

### Backend
- **Python 3.12+** — Language
- **FastAPI** — Web framework
- **SlowAPI** — Rate limiting library (wraps `limits`)
- **Redis** — Rate limit counter storage
- **PostgreSQL** — Main database
- **SQLAlchemy 2.x** — Async ORM
- **Alembic** — Database migrations
- **Pydantic v2** — Data validation
- **python-jose** — JWT tokens
- **passlib[bcrypt]** — Password hashing

### Frontend
- **React 18** — UI library
- **TypeScript** — Type-safe JavaScript
- **Vite** — Build tool / dev server
- **Axios** — HTTP client
- **React Router v6** — Client-side routing
- **Plain CSS** — No Tailwind

### Infrastructure
- **Docker Compose** — Local PostgreSQL + Redis
- **Uvicorn** — ASGI server

---

## Project Architecture

```
Browser (React + TypeScript)
        │ HTTP/JSON (Axios)
        ▼
┌─────────────────────────────────────┐
│ FastAPI (Uvicorn)                   │
│                                     │
│  Presentation Layer  ← HTTP routes  │
│  API Layer           ← Handlers     │
│  Service Layer       ← Business logic│
│  Middleware Layer    ← Rate limiting │
│  Database Layer      ← SQLAlchemy   │
└─────────────────────────────────────┘
        │                  │
        ▼                  ▼
   PostgreSQL           Redis
   (data)          (rate limit counters)
```

---

## Quick Start

### Prerequisites
- Docker Desktop (running)
- Python 3.12+
- Node.js 20+

### 1. Clone and enter the project
```bash
git clone <your-repo>
cd Rate_limitation
```

### 2. Start infrastructure (PostgreSQL + Redis)
```bash
docker compose up -d
```

### 3. Set up the backend
```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
copy .env.example .env          # Windows
# cp .env.example .env          # Mac/Linux

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload --port 8000
```

### 4. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the application
| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

---

## Folder Structure

```
Rate_limitation/
├── docker-compose.yml          # Start PostgreSQL + Redis
├── .gitignore
├── README.md
│
├── backend/
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variable template
│   ├── .env                    # Your actual secrets (NOT in git)
│   ├── alembic.ini             # Alembic migration config
│   ├── alembic/
│   │   ├── env.py              # Migration environment script
│   │   ├── script.py.mako      # Migration file template
│   │   └── versions/           # Generated migration files
│   └── app/
│       ├── main.py             # FastAPI app entry point
│       ├── config/
│       │   └── settings.py     # Loads .env into typed Python config
│       ├── database/
│       │   └── base.py         # Engine, session, Base class, get_db()
│       ├── models/             # SQLAlchemy ORM models (Phase 2)
│       ├── schemas/            # Pydantic request/response schemas (Phase 2)
│       ├── api/                # Route handlers (Phase 3+)
│       ├── services/           # Business logic (Phase 3+)
│       ├── middleware/         # Rate limiting, logging (Phase 6+)
│       ├── core/               # JWT, RBAC dependencies (Phase 3)
│       └── utils/              # Helper functions
│
└── frontend/                   # React app (Phase 4+)
    ├── src/
    │   ├── components/         # Reusable UI components
    │   ├── pages/              # Full page components
    │   ├── hooks/              # Custom React hooks
    │   ├── services/           # Axios API calls
    │   ├── types/              # TypeScript interfaces
    │   └── styles/             # CSS files
    ├── package.json
    └── vite.config.ts
```

---

## Database Schema

### users
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Auto-incrementing ID |
| username | VARCHAR(50) UNIQUE | Login username |
| email | VARCHAR(100) UNIQUE | Email address |
| hashed_password | VARCHAR | bcrypt hash (NEVER plain text) |
| role | ENUM | admin / manager / user |
| created_at | TIMESTAMP | Account creation time |

### request_logs
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Auto-incrementing ID |
| user_id | FK → users.id | Who made the request |
| endpoint | VARCHAR(200) | Which URL was called |
| ip_address | VARCHAR(50) | Client IP |
| request_time | TIMESTAMP | When the request was made |
| status | VARCHAR(20) | "allowed" or "blocked" |
| http_status | INTEGER | 200, 429, etc. |
| response_time | FLOAT | Milliseconds to respond |

### rate_limit_config
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Single config row |
| requests_allowed | INTEGER | Max requests per window |
| window_seconds | INTEGER | Time window duration |
| enabled | BOOLEAN | Rate limiting on/off toggle |

---

## API Endpoints

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | /auth/signup | ✗ | — | Create account |
| POST | /auth/login | ✗ | — | Get JWT token |
| GET | /users/profile | ✓ | any | Own profile |
| POST | /rate/generate-request | ✓ | user+ | Single rate-limited request |
| POST | /rate/generate-multiple | ✓ | user+ | Send N requests at once |
| GET | /rate/logs | ✓ | manager+ | Paginated request logs |
| GET | /rate/statistics | ✓ | manager+ | Aggregate stats |
| POST | /admin/change-limit | ✓ | admin | Update rate limit config |
| POST | /admin/enable | ✓ | admin | Enable rate limiting |
| POST | /admin/disable | ✓ | admin | Disable rate limiting |
| POST | /admin/reset-logs | ✓ | admin | Clear all logs |

---

## Build Phases

- [x] **Phase 1**: Project Setup (this phase)
- [ ] **Phase 2**: Database Models & Migrations
- [ ] **Phase 3**: Authentication (Signup, Login, JWT, RBAC)
- [ ] **Phase 4**: Frontend Setup (React + TypeScript + Vite)
- [ ] **Phase 5**: Dashboard UI Shell
- [ ] **Phase 6**: SlowAPI Rate Limiting Integration
- [ ] **Phase 7**: Request Playground (+1, +10, +20, +50, +100 buttons)
- [ ] **Phase 8**: Cooldown Timer (30-second lockout)
- [ ] **Phase 9**: Admin Settings Page
- [ ] **Phase 10**: Logging System
- [ ] **Phase 11**: Testing
- [ ] **Phase 12**: Full Documentation

---

*Built for learning. Every file is commented. Every decision is explained.*
