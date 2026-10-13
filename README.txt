DAILY GRIND LIVE - free auto-refreshing news (no server, no cost)

1. Make a free account at github.com and create a new PUBLIC repository (e.g. daily-grind).
2. Upload everything in this folder (keep the .github/workflows folder). Easiest: "Add file > Upload files".
3. Repo Settings > Pages > Source: "Deploy from a branch", branch main, folder / (root). Save.
4. Repo Actions tab > "Refresh news" > Run workflow once. After that it refreshes every 30 minutes by itself.
5. Your site is at https://YOUR-NAME.github.io/daily-grind/

Add or fix sources by editing feeds.json (RSS links; YouTube channel IDs).
If a feed shows an error in the Actions log, that URL needs correcting.
