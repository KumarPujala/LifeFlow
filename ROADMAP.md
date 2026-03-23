# LifeFlow — Improvement Roadmap

> Current Version: **v1.2.1** | Last Updated: March 23, 2026
> Live Site: [kumarpujala.github.io/LifeFlow](https://kumarpujala.github.io/LifeFlow/)

---

## Release Planning Principle

- **Low effort / high feasibility first**: local use, sharing, static hosting, small UX improvements
- **Medium effort next**: richer interactions, installability, engagement features
- **Higher effort later**: cloud sync, auth, cross-device data, mobile packaging

---

## v1.0.1 — Local Use & Basic Distribution ✅

- [x] **Local Run Guide** — App works by opening `index.html` directly in any browser
- [x] **Folder Share Readiness** — Full folder can be copied and opened on another PC (no build step)
- [x] **Data Persistence Check** — localStorage verified for expenses, wellness logs, budgets, settings, and currency
- [x] **Smoke Test Checklist** — Core flows manually tested across Chrome and Safari

---

## v1.1.0 — Static Hosting & Sharing ✅

- [x] **GitHub Pages Deployment** — Live at https://kumarpujala.github.io/LifeFlow/
- [ ] **Netlify Deployment** — Provide drag-and-drop deployment as an alternative hosting option
- [ ] **Vercel Deployment** — Add another static-hosting option for quick publishing
- [x] **Hosting Documentation** — README includes live site URL and project description
- [ ] **Version Footer Improvements** — Make the footer version and build text easier to update for each release

---

## v1.2.0 — UI/UX Polish ✅

- [x] **Dark Mode Toggle** — Sun/moon icon in topbar; persisted preference in localStorage
- [x] **Onboarding Tour** — First-time tooltip walkthrough (4 steps) for Expense and Wellness modes
- [x] **Mobile Bottom Navigation** — Fixed bottom tab bar on screens < 768px (4 tabs expense, 5 wellness)
- [x] **Animated View Transitions** — Smooth slide/fade when switching between views
- [x] **Better Empty States** — SVG illustrations + call-to-action buttons instead of plain text
- [x] **Skeleton Loading** — Brief placeholder shimmer when switching views or loading charts
- [x] **Trend Indicators on Cards** — Up/down arrows on dashboard cards comparing vs. last month/week

---

## v1.2.1 — Quick Add & Budget Refinements ✅

- [x] **Quick Add Templates** — 8 pre-filled templates (Lunch, Coffee, Gas, Movie, Groceries, Uber, Gym, Netflix)
- [x] **Currency-Aware Amounts** — Quick add amounts adjust per currency (USD, GBP, INR, EUR, JPY, AUD, CAD)
- [x] **Total Budget Input** — Set and edit an overall monthly budget with visual progress
- [x] **Per-Category Budgets** — Individual category budget limits with save/display and color-coded progress bars
- [x] **Budget Page UI Overhaul** — Consistent card layout, button sizing, and input styling

---

## v1.3.0 — Interaction & Productivity 🔜

> **Suggested order**: Start with the easiest / highest-impact items first.

### Batch A — Quick Wins (1–2 hours each)

- [ ] **Auto-Suggest Titles** — Suggest from previously used expense titles via `<datalist>`; no extra UI needed
- [ ] **Undo on Delete** — Replace confirm modal with a 5-second undo toast for faster workflow
- [ ] **Keyboard Shortcuts** — `N` = new expense, `D` = dashboard, `B` = budgets, `Esc` = close modal; show a `?` help overlay

### Batch B — Medium Effort

- [ ] **Recurring Expenses** — Mark expenses as recurring (daily/weekly/monthly); auto-add on app load if due date passed
- [ ] **Export Wellness Data** — Add Excel export for workout history and weight progress (reuse existing SheetJS setup)
- [ ] **Date Range Filter** — Filter expenses and activities by custom date range, not just current month

### Batch C — Larger Scope

- [ ] **Split View on Desktop** — Dashboard + quick-add side by side on wide screens (>1400px)
- [ ] **Monthly Comparison View** — Side-by-side bar chart comparing spending/activity across two months

---

## v1.4.0 — Packaging & Installability

- [ ] **PWA Basics** — Add `manifest.json` and service worker for install-to-homescreen and offline caching
- [ ] **Install Prompt UX** — Show an in-app banner when the browser supports A2HS
- [ ] **App Icons & Metadata** — 192px/512px icons, theme color, Apple touch icon, Open Graph tags
- [ ] **Favicon** — Add a proper favicon (currently missing)
- [ ] **Private Self-Hosting Notes** — Document hosting on a private machine or internal server

---

## v1.5.0 — Gamification & Engagement

- [ ] **Workout Streaks** — Show consecutive workout day streaks on wellness dashboard
- [ ] **Achievement Badges** — Milestones: "10 Workouts", "First 5K", "30-Day Streak", "Budget Master", "Week Under Budget"
- [ ] **Weekly Summary Notification** — Browser notification with weekly spending/workout summary
- [ ] **Goal Celebrations** — Confetti animation when budget is under limit or weight goal is reached
- [ ] **Savings Tracker** — Track how much you saved vs. budget each month; show cumulative savings graph

---

## v1.6.0 — Data & Insights (NEW)

- [ ] **Calendar Heat-Map** — Color-coded calendar view for expenses and workouts (like GitHub contributions)
- [ ] **Monthly Summary Card** — Auto-generated end-of-month summary: total spent, top category, budget status, workouts completed
- [ ] **CSV Import** — Import expenses from bank CSV/OFX files with column mapping
- [ ] **Data Backup/Restore** — Export all app data as JSON file; import to restore on another device
- [ ] **Custom Categories** — Let users add their own expense categories with emoji picker

---

## v2.0.0 — Cloud Database & Authentication

- [ ] **Firebase Firestore Integration** — Replace localStorage with cloud database
  - Free tier: 1GB storage, 50K reads/day, 20K writes/day
  - Real-time sync across devices
  - Offline support built in
- [ ] **Google Sign-In** — One-click authentication via Firebase Auth
- [ ] **Data Migration** — Auto-sync existing localStorage data to Firestore on first sign-in
- [ ] **Fallback Mode** — Keep localStorage as offline fallback when not signed in
- [ ] **Cross-Device Sync** — Keep expenses, workouts, and profile data synchronized across desktop and mobile browsers
- [ ] **Hosted Production Config** — Add environment-specific config for deployed cloud builds

---

## v2.1.0 — Multi-Platform Expansion

- [ ] **Mobile App Wrapper** — Package web app for Android/iOS using Capacitor
- [ ] **Push Notifications** — Expand reminders and weekly summaries beyond browser-only notifications
- [ ] **Account-Based Personalization** — Sync preferences, themes, and goals to the signed-in user profile

### Alternative Database Options Considered

| Service | Free Tier | Notes |
|---|---|---|
| Firebase Firestore | 1GB, 50K reads/day | **Chosen** — easiest, real-time sync, offline support |
| Supabase | 500MB, 50K MAU | PostgreSQL, good dashboard, row-level security |
| PocketBase | Unlimited (self-hosted) | Single binary, SQLite, requires own server |
| IndexedDB (local) | Unlimited (browser) | No sync, but much more robust than localStorage |

---

## Backlog (Future Versions)

- [ ] Multi-language support (i18n)
- [ ] Shared budgets (couples/roommates)
- [ ] Photo receipt scanning (OCR)
- [ ] AI-powered spending insights & workout recommendations
- [ ] Weight unit toggle (kg/lbs)
- [ ] BMI calculator in wellness profile
- [ ] Drag-and-drop expense reordering
- [ ] Pinned/favorite expenses for quick re-entry
- [ ] Wellness reminders (drink water, stretch, etc.)

---

*Pick items from above for each release. Check off as completed.*
