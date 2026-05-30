## Gluttony

Gluttony is a multi-restaurant food delivery app. This repo now includes:

- a Vite React frontend
- a same-repo Express backend under `server/`
- Supabase placeholders for auth and data
- free map/routing integration points via `Nominatim` and `OSRM`

## Current backend shape

Frontend:

- Supabase auth via [`src/lib/AuthContext.jsx`](/home/dizzy/Desktop/gluttony/src/lib/AuthContext.jsx:1)
- API client via [`src/lib/apiClient.js`](/home/dizzy/Desktop/gluttony/src/lib/apiClient.js:1)
- backend fallbacks via [`src/lib/backend.js`](/home/dizzy/Desktop/gluttony/src/lib/backend.js:1)

Backend:

- Express app in [`server/src/app.js`](/home/dizzy/Desktop/gluttony/server/src/app.js:1)
- restaurants endpoints in [`server/src/routes/restaurants.js`](/home/dizzy/Desktop/gluttony/server/src/routes/restaurants.js:1)
- delivery quote/geocode endpoints in [`server/src/routes/delivery.js`](/home/dizzy/Desktop/gluttony/server/src/routes/delivery.js:1)
- order endpoints in [`server/src/routes/orders.js`](/home/dizzy/Desktop/gluttony/server/src/routes/orders.js:1)

Database:

- initial Supabase schema in [`supabase/schema.sql`](/home/dizzy/Desktop/gluttony/supabase/schema.sql:1)

## Environment

Frontend `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://localhost:4000/api
```

Backend `server/.env`:

```bash
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
OSRM_BASE_URL=https://router.project-osrm.org
```

Templates are checked in as [`.env.example`](/home/dizzy/Desktop/gluttony/.env.example:1) and [`server/.env.example`](/home/dizzy/Desktop/gluttony/server/.env.example:1).

## Intended flow

1. Create a Supabase project.
2. Run the SQL from [`supabase/schema.sql`](/home/dizzy/Desktop/gluttony/supabase/schema.sql:1).
3. Seed `restaurants` and `menu_items`.
4. Fill frontend and backend env files.
5. Install root dependencies and server dependencies.
6. Run the frontend and backend together.

## Notes

- The app is still demo-friendly: frontend data routes fall back to mock data if the backend or Supabase is not ready.
- Realtime driver tracking is not implemented yet.
- `package-lock.json` was not regenerated in this environment because Node/npm is not available here.
