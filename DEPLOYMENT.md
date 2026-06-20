# Deploying CampusVerse

This gets you a public link friends can join over the internet. Two pieces:

1. **Server** (Colyseus / WebSockets) → a host that supports a long-running
   Node process: **Render**, **Railway**, or **Fly.io**.
   ⚠️ Serverless platforms (Vercel/Netlify Functions) will **not** work for the
   WebSocket server.
2. **Client** (static Vite build) → **Vercel**, **Netlify**, or **Cloudflare Pages**.

> Order matters: deploy the **server first** so you know its public URL, then
> build the client pointing at it.

---

## 1. Deploy the server

### Option A — Render (uses the included `render.yaml` / `Dockerfile`)

1. Push this repo to GitHub.
2. In Render: **New + → Blueprint**, select the repo. It reads `server/render.yaml`.
   (Or **New + → Web Service**, choose "Docker", set root directory to `server/`.)
3. Set environment variables on the service:
   - `NODE_ENV` = `production`
   - `CLIENT_ORIGIN` = your client URL (add after step 2 below, e.g.
     `https://campusverse.vercel.app`)
   - `MONITOR_USER` = an admin username
   - `MONITOR_PASS` = a strong password
4. Deploy. Your server URL will look like
   `https://campusverse-server.onrender.com`.
   The WebSocket URL is the same host with `wss://`:
   `wss://campusverse-server.onrender.com`.

### Option B — Railway

1. **New Project → Deploy from GitHub repo**.
2. Set the service root to `/server`. Railway auto-detects the `Dockerfile`.
3. Add the same env vars as above.
4. Railway gives you a public domain; use it as `wss://<that-domain>`.

### Verify
Visit `https://<your-server-host>/` → should say "CampusVerse server is running."
The monitor is at `/monitor` (will prompt for `MONITOR_USER` / `MONITOR_PASS`).

---

## 2. Deploy the client

### Vercel / Netlify / Cloudflare Pages

- **Root / base directory:** `client`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:**
  - `VITE_SERVER_URL` = `wss://<your-server-host>`  ← from step 1

Deploy. You'll get a URL like `https://campusverse.vercel.app`.

### Close the loop
Go back to the **server** and set `CLIENT_ORIGIN` to that client URL, then
redeploy the server so CORS allows your site.

---

## Local development (unchanged)

```bash
# terminal 1
cd server && npm install && npm run dev      # ws://localhost:2567

# terminal 2
cd client && npm install && npm run dev      # http://localhost:5173
```
The client reads `client/.env` (`VITE_SERVER_URL=ws://localhost:2567`).

---

## Environment variables reference

**Server** (`server/.env.example`)
| Var | Purpose |
|-----|---------|
| `PORT` | Listen port (most hosts inject this automatically) |
| `NODE_ENV` | `production` in prod |
| `CLIENT_ORIGIN` | Comma-separated allowed browser origins (CORS) |
| `MONITOR_USER` / `MONITOR_PASS` | Protect `/monitor`; required to expose it in prod |

**Client** (`client/.env.example`)
| Var | Purpose |
|-----|---------|
| `VITE_SERVER_URL` | `wss://` URL of the deployed server |

---

## Important caveats (this is a deployable prototype, not hardened)

These still apply after deploying — see the production checklist:

- **Movement is client-authoritative.** Clients can cheat (teleport, speed,
  spoof shoves). Make the server validate/own movement before any real launch.
- **No accounts / persistence / moderation** (name filtering, rate limits, ban).
- **Single process.** For large numbers of players, add Redis presence + the
  Colyseus Redis driver and run multiple instances behind a load balancer.
- **Free tiers sleep.** Render/Railway free tiers idle out; first connection
  after idle is slow. Use a paid tier for always-on.
- Add error tracking (Sentry) and client reconnection handling for resilience.
