# Gym MFE — Micro Frontend Architecture

## Structure
- `packages/shared` — shared webpack configuration (no runtime code)
- `packages/host` — shell app (port 4000): auth, header, footer, routing, exposes stores/context via MF
- `packages/client-app` — MFE1 (port 4001): dashboard, profile, subscriptions pages
- `packages/admin-app` — MFE2 (port 4002): admin panel (client table, create user, subscription management)

## Running

```bash
cd mfe
npm install
npm start
```

This starts all three apps concurrently:
- Host: http://localhost:4000
- Client App: http://localhost:4001
- Admin App: http://localhost:4002

## How it works

Module Federation allows each app to be developed and deployed independently.

The host app loads remotes at runtime from:
- `clientApp`: http://localhost:4001/remoteEntry.js
- `adminApp`: http://localhost:4002/remoteEntry.js

The host **exposes** via Module Federation:
- `host/stores` — MobX RootStore (AuthStore, ClientStore, AdminStore)
- `host/AuthContext` — React AuthContext + useAuth hook
- `host/api/auth` — auth API functions
- `host/api/gym` — gym service API functions

MobX stores are defined in host and shared as singletons via Module Federation shared config — all apps use the same store instance.

## API Services (Docker)
- **auth_service**: http://localhost:3000
- **gym_service**: http://localhost:3001
