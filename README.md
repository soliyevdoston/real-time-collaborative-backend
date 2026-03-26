# Real-time Collaborative Notes App Backend

Ushbu loyiha real-time jamoaviy note ilovasining backend qismi.
Backend REST API, Socket.IO va Hocuspocus serverni birga ishlatib, hujjat hamkorligini ta'minlaydi.

## Asosiy imkoniyatlar

- Auth:
  - `register`, `login`, `refresh`, `logout`, `me`
  - JWT access token + httpOnly refresh cookie
- Profil:
  - ism yangilash
  - avatar yuklash (`/uploads/avatars`, max 3MB)
- Notes:
  - CRUD
  - kollaborator qo'shish/o'chirish
  - pending invite oqimi
  - share sozlamalari (`RESTRICTED` / `ANYONE_WITH_LINK`, `VIEW` / `EDIT`)
- Real-time:
  - Hocuspocus (Y.js hujjat sinxroni)
  - Socket.IO (presence, comment eventlari, share/collaborator update)
- Comments:
  - yaratish, ro'yxat, resolve
- Versions:
  - real-time o'zgarishlardan snapshot saqlash
  - restore

## Texnologiyalar

- Node.js + Express (TypeScript)
- Prisma ORM + PostgreSQL
- Socket.IO
- Hocuspocus Server + Y.js
- Zod (validation)
- JWT, bcryptjs, cookie-parser, cors, helmet

## Arxitektura

1. `REST API`:
   - Auth, note metadata, collaborators, comments, versions.
2. `Hocuspocus`:
   - note body real-time Y.js state.
3. `Socket.IO`:
   - online users/presence, comment eventlari, collaborator/share signal.
4. `Prisma`:
   - foydalanuvchi, note, member, invite, comment, version, refresh token saqlash.

## Muhim papkalar

- `src/app.ts` - Express app, middleware (CORS, JSON, cookie, rate-limit)
- `src/server.ts` - HTTP server + Socket + Hocuspocus bootstrap
- `src/routes/index.ts` - API router mount
- `src/modules/` - domain modullar (`auth`, `notes`, `comments`, `versions`, `presence`)
- `src/socket/socket.server.ts` - Socket event handling
- `src/collab/hocuspocus.server.ts` - real-time document server
- `src/shared/config/` - env va CORS konfiguratsiyasi
- `prisma/schema.prisma` - ma'lumotlar modeli

## Lokal ishga tushirish

1. Dependency:

```bash
npm install
```

2. Env fayl:

```bash
cp .env.example .env
```

3. Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Server:

```bash
npm run dev
```

Ishlaydigan portlar:

- API: `http://localhost:4000`
- Hocuspocus: `ws://localhost:1234`

## Environment variables

`.env` uchun asosiy qiymatlar:

```env
NODE_ENV=development
PORT=4000
HOCUSPOCUS_PORT=1234
FRONTEND_URL=http://localhost:3000
FRONTEND_URLS=http://localhost:3000,https://google-docs-example.vercel.app
BACKEND_PUBLIC_URL=http://localhost:4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/realtime_notes?schema=public
JWT_ACCESS_SECRET=replace_with_long_access_secret
JWT_REFRESH_SECRET=replace_with_long_refresh_secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=7
```

`FRONTEND_URLS` comma-separated ro'yxat bo'lib, CORS uchun bir nechta originni qo'llaydi.

## API endpointlar

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`
- `POST /api/auth/avatar`

### Notes

- `GET /api/notes`
- `POST /api/notes`
- `GET /api/notes/:noteId`
- `PATCH /api/notes/:noteId`
- `DELETE /api/notes/:noteId`
- `PATCH /api/notes/:noteId/share`
- `POST /api/notes/:noteId/collaborators`
- `GET /api/notes/:noteId/collaborators/suggestions`
- `GET /api/notes/:noteId/invites`
- `DELETE /api/notes/:noteId/collaborators/:userId`
- `DELETE /api/notes/:noteId/invites/:inviteId`

### Comments

- `GET /api/notes/:noteId/comments`
- `POST /api/notes/:noteId/comments`
- `PATCH /api/comments/:commentId/resolve`

### Versions

- `GET /api/notes/:noteId/versions`
- `POST /api/notes/:noteId/versions/:versionId/restore`

## Socket eventlar

Client emits:

- `presence:join`
- `presence:leave`
- `presence:cursor`
- `comment:create`
- `comment:resolve`

Server emits:

- `presence:update`
- `comment:created`
- `comment:resolved`
- `version:created`
- `share:updated`
- `collaborator:changed`
- `collaboration:access-removed`

## CORS va cookie (production)

Cross-site frontend bilan ishlash uchun:

- CORS `FRONTEND_URL` + `FRONTEND_URLS` orqali boshqariladi
- refresh cookie productionda:
  - `httpOnly: true`
  - `secure: true`
  - `sameSite: "none"`

Shu sozlama Vercel frontend -> Render backend oqimida refresh ishlashi uchun kerak.

## NPM scriptlar

- `npm run dev` - dev server (watch mode)
- `npm run build` - TypeScript build (`dist/`)
- `npm run start` - production start (`node dist/server.js`)
- `npm run test` - vitest integration smoke test
- `npm run prisma:generate` - Prisma client generatsiya
- `npm run prisma:migrate` - lokal migration
- `npm run prisma:studio` - Prisma Studio

## Test

Integration smoke test auth, notes, comments, invite va share oqimlarini tekshiradi:

```bash
npm test
```

## Deploy (Render)

`render.yaml`da production envlar bor:

- `NODE_ENV=production`
- `FRONTEND_URL`, `FRONTEND_URLS`
- `BACKEND_PUBLIC_URL`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`

Deploydan keyin frontend envlari backend domainga mos bo'lishi kerak:

- `NEXT_PUBLIC_API_URL=https://<backend>/api`
- `NEXT_PUBLIC_SOCKET_URL=https://<backend>`
- `NEXT_PUBLIC_COLLAB_URL=wss://<backend>`
