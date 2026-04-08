# 🏋️ Gym Management — Auth Microservice

A production-ready **authentication microservice** built with Node.js, TypeScript, Express, PostgreSQL (Prisma), and JWT. Part of the Gym Management System.

---

## 📐 Architecture

```
src/
├── config/
│   ├── database.ts        # Prisma client singleton
│   ├── env.ts             # Zod-validated environment config
│   └── swagger.ts         # OpenAPI 3.0 spec definition
├── controllers/
│   └── auth.controller.ts # HTTP layer — thin, delegates to service
├── services/
│   └── auth.service.ts    # Business logic (register, login, getMe)
├── repositories/
│   └── user.repository.ts # Data access layer (Prisma queries)
├── routes/
│   ├── auth.routes.ts     # /auth/* endpoint definitions
│   └── health.routes.ts   # /health liveness probe
├── middlewares/
│   ├── auth.middleware.ts       # JWT authentication guard
│   ├── error.middleware.ts      # Global error handler + 404
│   ├── rateLimiter.middleware.ts# In-memory rate limiting
│   └── validation.middleware.ts # Zod request body validation
├── utils/
│   ├── AppError.ts        # Structured error class + factories
│   ├── hash.ts            # bcrypt password utilities
│   ├── jwt.ts             # Token sign / verify / extract
│   ├── logger.ts          # Winston structured logger
│   └── response.ts        # Standardised API response helpers
├── app.ts                 # Express app factory
└── index.ts               # Bootstrap + graceful shutdown
```

**Clean Architecture layers:**
```
HTTP Request
    ↓
  Routes         (wire up middleware + controllers)
    ↓
  Middleware     (auth guard, validation, rate limiting)
    ↓
  Controllers    (parse request, call service, format response)
    ↓
  Services       (business logic, error throwing)
    ↓
  Repositories   (database queries via Prisma)
    ↓
  PostgreSQL
```

---

## 🚀 Quick Start

### Option A — Docker Compose (recommended)

```bash
# 1. Clone and enter the project
git clone <repo-url> gym-auth-service
cd gym-auth-service

# 2. Create your .env file
cp .env.example .env
# ⚠️  Edit .env — set a strong JWT_SECRET (min 32 chars)

# 3. Build and start all services
docker compose up --build

# Service is live at:
#   API:    http://localhost:3000
#   Docs:   http://localhost:3000/docs
#   Health: http://localhost:3000/health
```

To also start pgAdmin (DB browser at http://localhost:5050):
```bash
docker compose --profile dev up --build
```

---

### Option B — Local Development

**Prerequisites:** Node.js ≥ 20, PostgreSQL ≥ 14

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your local DATABASE_URL and JWT_SECRET

# 3. Run Prisma migrations
npx prisma migrate dev --name init

# 4. Generate Prisma client
npx prisma generate

# 5. Start the dev server (hot-reload)
npm run dev
```

---

## 🔌 API Reference

| Method | Endpoint         | Auth Required | Description              |
|--------|------------------|---------------|--------------------------|
| POST   | `/auth/register` | ❌            | Register a new user      |
| POST   | `/auth/login`    | ❌            | Login, receive JWT token |
| GET    | `/auth/me`       | ✅ Bearer     | Get current user profile |
| GET    | `/health`        | ❌            | Liveness / readiness     |

### Interactive Docs
Visit **`http://localhost:3000/docs`** for the full Swagger UI.

---

### Register

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Str0ngP@ss1",
    "name": "John Doe",
    "role": "client"
  }'
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": "7d",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "client",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

---

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Str0ngP@ss1"
  }'
```

---

### Get Current User

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <your-token-here>"
```

---

## ⚙️ Environment Variables

| Variable             | Required | Default       | Description                          |
|----------------------|----------|---------------|--------------------------------------|
| `NODE_ENV`           | No       | `development` | `development` / `production` / `test`|
| `PORT`               | No       | `3000`        | HTTP port                            |
| `DATABASE_URL`       | ✅       | —             | PostgreSQL connection string         |
| `JWT_SECRET`         | ✅       | —             | Min 32 chars. Keep secret!           |
| `JWT_EXPIRES_IN`     | No       | `7d`          | JWT expiry (e.g. `1h`, `7d`)         |
| `BCRYPT_SALT_ROUNDS` | No       | `12`          | bcrypt cost factor (10–31)           |
| `CORS_ORIGINS`       | No       | `http://localhost:3000` | Comma-separated allowed origins |

---

## 🛡️ Security Features

- **Passwords** hashed with bcrypt (configurable salt rounds, default 12)
- **JWT** signed with HS256, includes `issuer` + `audience` claims
- **Rate limiting** on `/auth/*` routes (10 req / 15 min per IP)
- **Helmet** sets secure HTTP headers
- **CORS** whitelist with configurable origins
- **Zod validation** rejects malformed request bodies before they reach business logic
- **No user enumeration** — login returns the same error for wrong email or wrong password
- **Non-root Docker user** (`gymauth`) in production image
- **Body size limit** (10kb) to prevent payload attacks

---

## 🗄️ Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String              // bcrypt hash, never returned in API
  name      String
  role      Role     @default(client)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  admin
  client
}
```

---

## 📦 Available Scripts

| Script                   | Description                          |
|--------------------------|--------------------------------------|
| `npm run dev`            | Start dev server with hot-reload     |
| `npm run build`          | Compile TypeScript → `dist/`         |
| `npm start`              | Run compiled production build        |
| `npm run prisma:generate`| Regenerate Prisma Client             |
| `npm run prisma:dev`     | Create a new migration (dev)         |
| `npm run prisma:migrate` | Apply migrations (production)        |
| `npm run prisma:studio`  | Open Prisma Studio (DB browser)      |
| `npm run typecheck`      | TypeScript type-check without build  |

---

## 🐳 Docker

**Build the image:**
```bash
docker build -t gym-auth-service:latest .
```

**Run standalone (requires external Postgres):**
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret-min-32-chars" \
  gym-auth-service:latest
```

The Dockerfile uses a **3-stage multi-stage build**:
1. **deps** — installs `node_modules` + generates Prisma client
2. **builder** — compiles TypeScript
3. **runner** — lean Alpine image with only runtime artifacts

---

## 🏗️ Extending the Service

**Adding a new protected route:**
```typescript
import { authenticate, authorize } from '../middlewares/auth.middleware';

// Any authenticated user
router.get('/profile', authenticate, myController);

// Admin only
router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);
```

**Adding a new validation schema:**
```typescript
import { z } from 'zod';
import { validate } from '../middlewares/validation.middleware';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

router.patch('/profile', authenticate, validate(updateProfileSchema), updateProfile);
```
