# Ajna · Speak English

A mobile-first app (installable PWA) for a Czech B1 learner who understands English but freezes when speaking.
It trains active sentence building, speaking aloud and vocabulary in context. Everything runs in the browser:
no backend, data lives in `localStorage`, and AI calls go straight from the browser to Google Gemini (free key from
https://aistudio.google.com/apikey), Anthropic Claude or OpenAI, using your own API key.

## Modes
- **A · Nabalování vět**: a sentence-expansion ladder (core sentence → add a reason → add a contrast), with AI feedback on the final multi-clause sentence.
- **B · Aktivní překlad**: Czech → English with two required fluency chunks ("To be honest…", "It turns out that…").
- **C · 60s monolog**: a 60-second free monologue → lightly corrected version + native B2 reformulation + shadowing with a match score.
- **D · Hraní rolí**: 4–6 turn spoken roleplays (hotel, pharmacy, small talk…). The AI replies by voice and adds collapsible Coach Tips.
- **E · Aktivní slovíčka**: SM-2 spaced repetition with a 2-step speaking test (fill the gap aloud → say your own sentence, checked by the AI).
- **Banka chyb**: Czenglish mistakes are saved automatically; practice generates *new* sentences that test the same trap. A mistake counts as mastered after 2 successes.
- **Word Rescue** (`Ctrl+K`, `/`, or the "Nevím slovo?" bar under every answer box): type a Czech word, get the English word for the current context, and it is added to your vocabulary.
- Every word in the native versions is tappable → Czech translation, collocation, pronunciation, "Uložit do slovíček".

## Speech
- `SpeechRecognition` with `continuous` + `interimResults`. Recognition restarts automatically after pauses (Android stops it after silence), so you can stop and think mid-sentence.
- **Toggle** (tap to start/stop) or **Push-to-talk** (hold the button or Space). US/UK accent.
- The transcript stays editable before you submit. TTS on every example at 0.8× or 1.0×.
- Best support: **Chrome on Android**, **Safari on iOS** (14.5+). The microphone needs **HTTPS** (or localhost).

## Offline
After the first visit, the whole app is stored on the device (service worker), so it opens and works without internet.
The dashboard, vocabulary list, mistake bank, pronunciation (TTS) and vocabulary review work offline; in vocabulary review
you grade your own sentence instead of the AI. AI feedback (modes A–D, the AI check in vocabulary step 2, mistake practice)
needs a connection. Speech recognition in Chrome also needs internet; offline you can type, or use your keyboard's dictation.

## Keyboard (desktop)
Space = record / push-to-talk · Enter = submit · R = replay native version · S = save to the mistake bank · Ctrl+K = Word Rescue

## Development
```bash
npm install
npm run dev      # http://localhost:5173 (also available on your LAN thanks to --host)
npm run build    # output in dist/
```

## Deploying to your phone
The `.github/workflows/deploy.yml` workflow builds the app and publishes it to **GitHub Pages**
(in the repo: Settings → Pages → Source: *GitHub Actions*). Open the URL on your phone and choose
"Add to Home Screen". Then add your API key under **Nastavení** (Settings).

Any other static host works too (Netlify, Vercel, Cloudflare Pages): just publish the `dist/` folder.

## Backup
Nastavení → Export JSON / Import. API keys are never included in the export.

## Motivation & quick practice

- **Daily goal (XP)**: every answer earns XP (more for longer answers); pick the goal in Settings (50–300 XP). The dashboard shows a progress ring, the week, the streak and a rank.
- **Daily plan**: vocabulary review, one round of quick phrases, a rotating AI challenge and mistake practice. One button takes you to the next unfinished step.
- **Quick phrases (Rychlé fráze)**: 108 high-frequency spoken sentences in four levels. Czech → say it in English, with an instant offline check that tolerates contractions, numbers and small recognition errors. Phrases you get wrong come back first.
- **Vocabulary packs**: false friends, make/do/take/have, linking words, feelings & opinions, everyday life (plus the original four).
