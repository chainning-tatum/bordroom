# BORDROOM

**A meeting verdict machine.** Paste your notes, get an honest verdict.

---

## Deploy in ~10 minutes (no coding required)

### Step 1 — Install tools (one time only)

1. Install **Node.js**: https://nodejs.org → download the LTS version, run the installer
2. Install **Git**: https://git-scm.com/downloads → run the installer
3. Sign up for **Vercel** (free): https://vercel.com → "Sign up with GitHub"
4. Install the Vercel CLI: open Terminal (Mac) or Command Prompt (Windows) and run:
   ```
   npm install -g vercel
   ```

### Step 2 — Get your Anthropic API key

1. Go to https://console.anthropic.com
2. Sign in or create an account
3. Click **API Keys** in the left sidebar → **Create Key**
4. Copy the key (starts with `sk-ant-...`) — save it somewhere safe

### Step 3 — Set up the project

Open Terminal and run these commands one at a time:

```bash
cd ~/Desktop
cd bordroom
npm install
```

### Step 4 — Deploy to Vercel

```bash
vercel
```

Follow the prompts (press Enter to accept defaults). When it finishes, it'll give you a URL like `bordroom.vercel.app`.

### Step 5 — Add your API key

1. Go to https://vercel.com/dashboard
2. Click your **bordroom** project
3. Go to **Settings → Environment Variables**
4. Add a new variable:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: your key from Step 2
   - Check all three environments (Production, Preview, Development)
5. Click **Save**
6. Go to **Deployments** tab → click **...** on the latest deploy → **Redeploy**

Your app is live! 🎉

---

## Custom domain (optional)

In Vercel dashboard → your project → **Settings → Domains** → add `bordroom.com` (or whatever you register).

Buy a domain at: Namecheap, Cloudflare Registrar, or Google Domains.

---

## Rate limiting

The app has basic in-memory rate limiting (10 requests/minute per IP). This resets if the server restarts.

For production with real traffic, upgrade to **Upstash Redis** (free tier):
1. Sign up at https://upstash.com
2. Create a Redis database
3. Install: `npm install @upstash/ratelimit @upstash/redis`
4. Replace the rate limit section in `app/api/analyze/route.ts` with Upstash's built-in limiter

---

## Local development

```bash
# Create a .env.local file with your API key
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env.local

# Run the dev server
npm run dev
```

Then open http://localhost:3000

---

## Cost estimate

Each analysis uses ~500-800 tokens. At Claude Sonnet pricing (~$3/million input tokens):
- 1,000 analyses ≈ $2–4
- You'd need serious traffic before it costs anything notable.
