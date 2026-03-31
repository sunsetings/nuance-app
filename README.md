# nuance.

A translation app with tone refinement.

## Setup

1. Clone this repo
2. Run `npm install`
3. Create a `.env` file in the root with your server-side OpenAI key:

```
OPENAI_API_KEY=sk-your-key-here
```

4. Run `npm run dev` to start locally
5. Open http://localhost:5173

## Deploy to Vercel

1. Push to GitHub
2. Connect repo in Vercel dashboard
3. Add `OPENAI_API_KEY` as an environment variable in Vercel settings
4. Deploy

## Screens

- **Home** — Refine & Translate / Quick Translate toggle
- **Results (Refine)** — 3 panels with tone stacking
- **Results (Quick)** — 2 panels, straight translation
- **Account** — usage stats, display mode, language
- **Upgrade** — Pro plan page
- **Saved** — saved favourites (Pro)
