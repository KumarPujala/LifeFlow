# LifeFlow

LifeFlow is a browser-based personal tracker that combines two tools in one interface:

- Expense tracking for monthly spending, category budgets, and export
- Wellness tracking for workouts, weight logs, goals, and weekly planning

Current release: **v1.1.0**

## What's In v1.1.0

Version `v1.1.0` is focused on static hosting and sharing.

- Launch-ready HTML, CSS, and JavaScript app
- Local browser storage for saved data
- Version footer displayed in the UI
- Ready for deployment to static hosting platforms

## Project Files

- `index.html` — main application structure
- `styles.css` — application styling and responsive layout
- `app.js` — expense tracker and wellness tracker logic
- `ROADMAP.md` — planned releases and upcoming features

## Features

### Expense Tracker

- Dashboard with summary cards
- Add, edit, and delete expenses
- Category-based budgeting
- Search, filter, and sorting
- Excel export support

### Wellness Tracker

- Activity logging
- Weight tracking
- Weekly plan view
- Profile and goal setup
- Progress tracking dashboard

## How To Run Locally

1. Keep these files in the same folder:
   - `index.html`
   - `styles.css`
   - `app.js`
2. Open `index.html` in a browser.
3. Start using the app.

No build step or package installation is required.

## Data Storage

LifeFlow currently stores data in the browser using `localStorage`.

- Data persists after refresh
- Data is browser-specific on the current device
- Clearing browser storage will remove saved app data

## Deployment Options For v1.1.0

This is a static web app, so it can be hosted directly without a backend.

### GitHub Pages

1. Create a GitHub repository
2. Upload the project files
3. Enable Pages from the repository settings
4. Select the main branch and root folder

### Netlify

1. Open Netlify
2. Drag and drop the project folder or connect a repository
3. Publish the site

### Vercel

1. Import the repository into Vercel
2. Deploy as a static site

## Before Launching

Before publishing a new version:

1. Test mode switching and navigation
2. Add and edit expense entries
3. Add wellness entries and weight logs
4. Refresh the page and confirm saved data remains
5. Check for console errors in the browser
6. Verify the footer version is correct

## Updating The Version

When releasing a new version, update these places:

- `index.html` footer text
- `ROADMAP.md` current version line
- `README.md` current release line

Example version progression:

- `v1.1.0` — hosting and sharing release
- `v1.1.1` — small bug-fix release
- `v1.2.0` — next feature release

## Roadmap

See `ROADMAP.md` for planned versions and feature priorities.

## Notes

- This version is best suited for local use or static hosting
- Cross-device sync and authentication are planned for later versions