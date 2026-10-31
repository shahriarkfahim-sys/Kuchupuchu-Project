# Kuchupuchu — Full Site Guide

Kuchupuchu is a Bangla-first parenting and early-childhood-development website for families from pregnancy through a child's first two years. The interface is also available in English. Its visual language is warm and spacious, with white surfaces, orange accents, soft green and indigo feature colors, rounded cards, and friendly illustrated learning buddies.

This guide describes the site as implemented in this repository. It distinguishes interactive prototypes and local demo state from services that are not yet connected to production backends.

## At a glance

- **Audience:** Expecting parents and families with babies and toddlers.
- **Languages:** Bangla (`bn`, the default) and English (`en`).
- **Primary product areas:** Growth and milestones, age-based play, care tracking, a baby diary, parent community, support directory, and baby products.
- **App shell:** React, TypeScript, Vite, Tailwind CSS, and an Express server for local API routes.
- **Main entry points:** `src/App.tsx`, `src/components/`, `src/data/`, and `server.ts`.

## Site map

### Public navigation

The public header links to:

1. Home
2. Growth and progress
3. Daily play
4. Tracker
5. Baby diary
6. Forum
7. Support
8. Ponno (products)

The public landing page also offers account/login actions and a child-name field to begin onboarding.

### Logged-in dashboard

The dashboard has a dedicated “My dashboard” entry followed by this motherhood-journey sequence:

1. Tracker
2. Progress
3. Play
4. Diary
5. Support
6. Forum
7. Products

The selected journey item is highlighted. On smaller screens the journey links can scroll horizontally; on larger screens they form a vertical sidebar.

## Pages and features

### 1. Home

The landing page introduces Kuchupuchu and invites a parent to start with a child's name or choose signup/login. Its hero combines an animated family/journey illustration with rotating Bangla or English hook text.

Additional landing-page sections include:

- A “how it works” journey.
- Benefits covering play, daily care, memories, parent community, shopping, and support.
- Learning-buddy illustrations.
- Free-versus-subscription feature information and plan cards.
- Frequently asked questions, including product scope, health-advice limitations, and routine tracking.

### 2. Dashboard

The signed-in dashboard is a Bangla-first daily overview, with English labels when the language is switched. It shows a family greeting, the child's age (or pregnancy week), date, and quick access to weather, partner linking, and subscription details. For families with a baby, one-tap shortcuts open the tracker or diary, and today's feeding, sleep, diaper, and play summaries are calculated from the current routine and activity logs. Recent care entries, next-step links for play, vaccines, and milestones, and a growth snapshot with the latest recorded measurements complete the overview. A mood selector updates the child's daily mood. Expecting-parent profiles use pregnancy-aware summary cards and hide infant-specific care and growth sections.

### 3. Growth and progress

The growth page combines:

- A radar/spider-chart assessment across six early-childhood-development domains.
- A month-by-month growth trajectory chart.
- Age-aware assessment and milestone context.
- Links from developmental areas to related play activities.

Assessment content is drawn from the supplied question bank and development dataset. Guidance is informational; it is not a diagnosis.

### 4. Daily play

The play library groups age-appropriate activities by developmental area. Parents can:

- Select an age checkpoint, from the available early-infant checkpoints through 24 months.
- Open a domain and browse activities.
- Read a detailed play guide and use its timer where available.
- Mark activities complete and review progress.
- Arrive with a skill preselected from the growth page.

Activities and age guidance are sourced from the project's local datasets and sample data.

### 5. Tracker

The tracker records day-to-day care and includes:

- **Feeding:** Bottle, breastfeeding, and solid-food entries. The entry form records food type, amount, and an appropriate unit (for example ml/oz, minutes, or spoon/bowl/piece), plus an optional note.
- **Sleep:** Start/finish timer that continues across app reloads, plus manual duration entry.
- **Diaper changes:** Urine, stool, or both; stool consistency, amount, and an optional note.
- **Vaccination journey:** A pregnancy-to-24-month timeline where applicable, with estimated dates, completed-step checkmarks, progress, and reminders to follow the EPI card and health-worker advice. An expecting parent can add the actual birth date after delivery so infant vaccine dates use it.
- **Analysis:** Opens in a centered dialog over a blurred background. It supports daily, monthly, and custom date ranges and summarizes sleep, feeding, diaper, and potty logs with charts and comparisons.
- **Daily history:** Shows entries for the selected date.

Tracker logs and the sleep timer use browser storage. The vaccination journey's completion status is stored per child in browser storage.

### 6. Baby diary

The diary is a direct-parent-input area for recording growth and personal observations, including weight, height, mood, new words, and notes. Saved growth entries feed the child's growth context and dashboard.

### 7. Parent forum

The community page presents topic filters for sleep, feeding, milestones, and health/care. Parents can browse discussion cards, post a question or experience, and use the available upvote/reply interactions. Current posts and interactions are prototype state, not a connected community backend.

### 8. Support and care

The support directory contains clinic/provider cards with institution, address, specialties, service information, and contact actions. Parents can filter the directory by the available divisions, call the national 16263 line, or open an appointment-inquiry form.

The appointment form is currently a front-end interaction; it does not submit a real booking to a provider. The page also links to growth screening.

### 9. Ponno products

The Ponno page is a small product catalog with category filters, search, product cards, quantity controls, a cart, promo-code entry, and an order/checkout dialog. Product inventory is currently hard-coded sample data.

Checkout is not a live payment flow: the server's `/api/payments/bkash/create` endpoint intentionally returns `503` until a real merchant integration is configured.

## Signup, login, and family profiles

The onboarding UI guides a parent through:

1. Parent name and role.
2. Whether the baby has been born.
3. Baby name or expected due date and pregnancy timing.
4. Birth date for a baby who has arrived.
5. Gender selection where applicable.
6. Choosing a learning buddy.
7. A pregnancy- or age-specific assessment, with the option to defer it.

The site also has login, parent-code linking, child-profile editing, and partner-code sharing dialogs. These screens provide the product flow but do not represent production authentication or a cloud profile database yet.

## Learning buddy and AI chat

The floating assistant uses the learning buddy selected for the active child: its image and name appear in the launcher and chat, and it introduces itself by that name. It can respond to questions about the site, general child-development education, and the supplied child context.

The browser sends chat requests to `POST /api/shonai/chat`; the server validates the request and uses DeepSeek. Configure `DEEPSEEK_API_KEY` as a server environment variable (never in client code). The chat is not available until the key is configured. The server receives a limited child context without the child's name or direct identifier. The assistant is not a clinician and must not diagnose or prescribe.

The server also provides `POST /api/ai/development-tip` for a short age-appropriate play/care suggestion.

## Data, privacy, and prototype boundaries

Current implementation boundaries to know before launch:

- Authentication and signup are UI prototypes; they do not create or verify real accounts. Passwords are not stored.
- Child profiles, growth inputs, forum interactions, clinic inquiries, and some other workflows are in-memory or browser-local demo state rather than a production cloud database.
- Routine logs, sleep timer state, vaccination progress, subscription UI state, and some preferences use `localStorage` where implemented. Browser storage is device- and browser-specific; it is not cross-device sync or a backup.
- Product catalog entries and many dashboard/analysis entries include sample data.
- Ponno payment is disabled until bKash merchant integration is implemented.
- The subscription and promo-code screens are prototype UI and should not be treated as proof of a real payment or entitlement.
- Clinic and vaccine details should be confirmed with the provider, official EPI card, or qualified health worker. The site does not replace professional medical advice.

## Localization and accessibility

- Bangla is the default language; the header/footer language control switches between Bangla and English.
- Dates and numbers use locale-aware formatting in supported parts of the site.
- Dialogs and forms use labels, focus handling, keyboard dismissal, and visible focus styles where implemented.
- Motion is used for selected illustrations and transitions; reduced-motion support is present for the learning-buddy animation.

## Key implementation files

| Area | Main files |
|---|---|
| Application shell, state, page selection, dialogs | `src/App.tsx` |
| Header and public navigation | `src/components/Navbar.tsx` |
| Public landing page | `src/components/HomePage.tsx` |
| Logged-in dashboard and journey sidebar | `src/components/ParentDashboard.tsx`, `src/App.tsx` |
| Growth assessment and charts | `src/components/SpiderChartRadar.tsx`, `src/components/WormGraphView.tsx` |
| Play activities | `src/components/DailyActivityModule.tsx`, `src/data/ecdDataset.ts` |
| Routine tracker and analysis | `src/components/BabyRoutineTracker.tsx` |
| Diary and growth input | `src/components/BabyDiaryInput.tsx` |
| Forum | `src/components/CommunitySection.tsx` |
| Provider directory | `src/components/CareConnectSection.tsx` |
| Product catalog | `src/components/PonnoPage.tsx` |
| Signup and profile onboarding | `src/components/OnboardingFlowModal.tsx`, `src/components/ChildProfileModal.tsx` |
| Buddy chat | `src/components/SonaiAssistant.tsx`, `server/shonaiChat.ts` |
| Localization and shared types | `src/i18n/translations.ts`, `src/types.ts` |

## Local development

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

The Express/Vite development server defaults to `http://localhost:3000`. To build and serve the production bundle:

```bash
npm run build
npm start
```

Useful checks:

```bash
npm run lint
npm run build
```

For AI chat locally, set `DEEPSEEK_API_KEY` in an untracked `.env` file or the process environment. Never commit secrets.
