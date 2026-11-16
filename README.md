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
- **Quick phrases (Rychlé fráze)**: 118 high-frequency spoken sentences in four levels (A1–B2). Czech → say it in English, with an instant offline check that tolerates contractions, numbers and small recognition errors. Phrases you get wrong come back first.
- **Vocabulary packs**: false friends, make/do/take/have, linking words, feelings & opinions, everyday life (plus the original four).

## Difficulty levels

| Level | CEFR | What it means |
|---|---|---|
| 1 Úplné základy | A1 | 3–6 words, present tense only (be, have, like, can, there is), first 300 words |
| 2 Základy | A2 | up to 9 words, past simple, going to, will, comparatives, and/but/because |
| 3 Střední | B1 | present perfect, conditionals 1–2, modals, relative clauses, phrasal verbs |
| 4 Pokročilý | B2 | all tenses, passive, reported speech, 3rd conditional |
| 5 Expert | C1 | mixed conditionals, inversion, idioms, style |

Every exercise follows the level: sentence length and grammar in the drill and the ladder, which fluency chunks are offered, the monologue topics and their length, the roleplay scenes (tagged lehčí / pro tebe / těžší), the quick phrases, and the order of the vocabulary packs.

## Games, reading and progress (offline-first)

- **Games** (work offline): Word of the day (Wordle-style spelling with a Czech clue), Traps (typical Czech mistakes + your own from the Mistake Bank), Quick phrases, Quiz (4 question types, timer, combo), Sentence builder (word tiles with decoys), Listening (TTS dictation with slow replay), Matching (timed boards), Grammar (48 gap-fill questions A1–B2 with Czech explanations). Material comes from level-matched packs, textbook vocabulary and your own cards.
- **Stories**: AI-written graded stories on any topic plus built-in offline stories: read-along, tap-to-translate, Czech toggle, comprehension questions and a spoken retelling evaluated by AI.
- **Free conversation** with a friendly native speaker on any topic (in Roleplay).
- **Placement test**: 4 questions per level from A1 up; sets the recommended level.
- **Progress**: rank, XP chart, totals, game records and 21 achievements with unlock banners; confetti and sound effects (can be turned off).
- **Welcome tour** for new users: goal, level (or placement test), AI key.
- **Speech-to-text**: browser engine, or on iPhone a recording transcribed by your Gemini/OpenAI key (selectable in Settings).
- **Grammar cheat sheet**: every level topic and textbook topic; AI writes a Czech explanation with forms, examples and typical Czech mistakes (cached for offline), one tap to practise it.
- **Daily plan chaining**: game end screens offer the next unfinished task of the plan; exercises are full-screen without the tab bar.
- **Accent colours**: six app colours in Settings.
