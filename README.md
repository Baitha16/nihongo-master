# 日本語マスター — Nihongo Master

Awwwards-style gamified Japanese language learning web app. Practice kana, vocabulary, kanji, and grammar with quizzes, streaks, and a community leaderboard.

**Live:** https://nihongo-master-alpha.vercel.app

## Features

- **Hiragana & Katakana** — basic chart, dakuten, and youon (combination) reference tabs before practice
- **Quiz modes** — shuffle/sequential, 🇯🇵 Japanese questions or 🇮🇩 Indonesian questions
- **Kosakata N5** — large JLPT N5 vocabulary bank with levels and scoring
- **Kosakata Campuran N5–N4** — nouns, verbs, and adjectives (mixed difficulty)
- **Tata Bahasa N5** — grammar points with reading + understanding tracking
- **Marked words** — flag hard words and review them later
- **Streaks 🔥** — track daily answer streaks
- **Leaderboard 🏆** — ranked by streak (Nihongo Master licenses only)
- **License login** — HWID-bound activation with progress sync to the cloud
- **Light/dark theme**

## Tech

- Vanilla HTML / CSS / JavaScript (no framework)
- Static JSON data under `data/`
- Optional local server: `server.js` (port 8080)
- Deployed as a static site on Vercel
- Progress + leaderboard API: see [autohotkey](https://github.com/Baitha16/autohotkey) (License Dashboard)

## Run locally

```bash
# Option A — simple static server
node server.js
# open http://localhost:8080

# Option B — any static server
npx serve .
```

For full login + progress sync locally, also run the License Dashboard API on port 3000.

## Project structure

```
index.html          # App shell
css/style.css       # Styles & themes
js/app.js           # Core app logic (quiz, sync, leaderboard)
js/data-loader.js   # JSON data loader
data/               # Quiz data (hiragana, katakana, nouns, verbs, …)
data/database/      # N5/N4 kotoba, kanji, bunpou
server.js           # Optional local static server
vercel.json         # Vercel static deploy config
```

## Deployment

```bash
vercel --prod --yes
```

## License

Private / All rights reserved.
