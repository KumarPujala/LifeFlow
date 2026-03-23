# LifeFlow — Improvement Roadmap

> Current Version: **v1.2.0** | Last Updated: March 23, 2026

---

## Release Planning Principle

- **Low effort / high feasibility first**: local use, sharing, static hosting, small UX improvements
- **Medium effort next**: richer interactions, installability, engagement features
- **Higher effort later**: cloud sync, auth, cross-device data, mobile packaging

---

## v1.0.1 — Local Use & Basic Distribution

- [ ] **Local Run Guide** — Add simple usage notes for opening `index.html` locally and using the app offline
- [ ] **Folder Share Readiness** — Ensure the app works when the full folder is copied and opened on another PC
- [ ] **Data Persistence Check** — Validate localStorage behavior for expenses, wellness logs, and settings after refresh
- [ ] **Smoke Test Checklist** — Document the core manual checks before each release

---

## v1.1.0 — Static Hosting & Sharing

- [ ] **GitHub Pages Deployment** — Publish the static site with a public URL
- [ ] **Netlify Deployment** — Provide drag-and-drop deployment as an alternative hosting option
- [ ] **Vercel Deployment** — Add another static-hosting option for quick publishing
- [ ] **Hosting Documentation** — Add brief steps for how to deploy and re-publish updated files
- [ ] **Version Footer Improvements** — Make the footer version and build text easier to update for each release

---

## v1.2.0 — UI/UX Polish

- [x] **Dark Mode Toggle** — Sun/moon icon in topbar; persisted preference in localStorage
- [x] **Onboarding Tour** — First-time tooltip walkthrough (3-4 steps) for each tracker mode
- [x] **Mobile Bottom Navigation** — Fixed bottom tab bar replacing sidebar hamburger on screens < 768px
- [x] **Animated View Transitions** — Smooth slide/fade when switching between views
- [x] **Better Empty States** — SVG illustrations + call-to-action buttons instead of plain text
- [x] **Skeleton Loading** — Brief placeholder shimmer when switching views or loading charts
- [x] **Trend Indicators on Cards** — Up/down arrows on dashboard cards comparing vs. last month/week

---

## v1.3.0 — Interaction & Productivity

- [ ] **Recurring Expenses** — Mark expenses as recurring (weekly/monthly); auto-add on schedule
- [ ] **Undo on Delete** — Replace confirm modal with a 5-second undo toast for faster workflow
- [ ] **Auto-Suggest Titles** — Suggest from previously used expense titles via datalist
- [ ] **Keyboard Shortcuts** — `N` = new expense, `D` = dashboard, `Esc` = close modal, etc.
- [ ] **Split View on Desktop** — Dashboard + quick-add side by side on wide screens (>1400px)
- [ ] **Export Wellness Data** — PDF/Excel export for workout history and weight progress

---

## v1.4.0 — Packaging & Installability

- [ ] **PWA Basics** — Add manifest and service worker so the app can be installed and used more reliably offline
- [ ] **Install Prompt UX** — Show an in-app prompt when the browser supports installation
- [ ] **App Icons & Metadata** — Add icons, theme colors, and share metadata for hosted builds
- [ ] **Private Self-Hosting Notes** — Document how to host the app on a private machine or internal server

---

## v1.5.0 — Gamification & Engagement

- [ ] **Workout Streaks** — Show consecutive workout day streaks on wellness dashboard
- [ ] **Achievement Badges** — Milestones like "10 Workouts", "First 5K", "30-Day Streak", "Budget Master"
- [ ] **Weekly Summary Notification** — Browser notification with weekly spending/workout summary
- [ ] **Goal Celebrations** — Confetti animation when budget is under limit or weight goal is reached

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

- [ ] **Mobile App Wrapper** — Evaluate packaging the web app for Android/iOS using Capacitor or a similar wrapper
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
- [ ] Data import from bank CSV/OFX files
- [ ] Calendar heat-map view for expenses and workouts
- [ ] Custom categories (user-defined)
- [ ] Weight unit toggle (kg/lbs)
- [ ] BMI calculator in wellness profile

---

*Pick items from above for each release. Check off as completed.*
