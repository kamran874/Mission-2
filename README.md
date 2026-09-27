# Ledger — Daily Expense Tracker

A installable web app (PWA) for tracking daily expenses, labeling what each one was
for, and reviewing weekly / bi-weekly / monthly spending reports. Built with React,
TypeScript, Tailwind CSS, and Vite. All data is stored locally on-device
(`localStorage`) — nothing is sent to a server.

## Why a PWA instead of a native App Store app

Building a native iOS app requires Xcode, a Mac, and an Apple Developer account,
none of which are available in this environment. A Progressive Web App gives you
the same result for personal use: an icon on your Home Screen, a full-screen
standalone window (no Safari chrome), and offline support — installed directly
from Safari, no App Store review needed.

## Features

- **Onboarding** — pick the date you want to start tracking from, your currency,
  and a nightly reminder time (defaults to 11:00 PM).
- **Today** — quick-add an expense with an amount, a category label, and an
  optional note (e.g. "Lunch with the team").
- **History** — browse every day since your start date, grouped by date, with
  inline add/edit/delete.
- **Reports** — weekly, bi-weekly, and monthly views with a daily spending chart,
  period-over-period change, and a "where it went" category breakdown so you can
  see exactly where your money is going.
- **Settings** — manage categories, currency, export your data as JSON/CSV (share
  it anywhere via the iOS share sheet), and reminder preferences.

## Running locally

```bash
npm install
npm run dev       # starts a dev server
npm run build     # production build in dist/
npm run preview   # preview the production build
```

## Installing on your iPhone

1. Deploy `dist/` somewhere reachable over HTTPS (see below), or run it on your
   Mac/PC and open the URL in Safari on your iPhone over the same network.
2. Open the app's URL in **Safari** on your iPhone.
3. Tap the **Share** icon → **Add to Home Screen** → **Add**.
4. Launch it from the Home Screen icon — it opens full-screen, like a regular app.

### Deploying with GitHub Pages

This repo includes `.github/workflows/deploy-pages.yml`, which builds and deploys
the app automatically on every push to `main`. To turn it on:

1. In the repo, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
2. Merge this branch into `main` (or push to `main`) — the workflow builds and
   publishes the app.
3. Your Pages URL will be shown in the workflow run and under
   **Settings → Pages**. Open that URL in Safari on your iPhone and add it to
   your Home Screen.

## About the nightly reminder

iOS suspends background JavaScript timers once a web app is closed or
backgrounded, so a purely client-side reminder can only fire reliably **while the
app is open**. For a guaranteed 11 PM nudge, pair it with an iPhone **Shortcuts**
automation:

**Shortcuts → Automation → + → Time of Day → set your time → Open App → Ledger**,
and turn off "Ask Before Running".

That opens the app for you at the time you choose, and the in-app reminder banner
takes it from there.
