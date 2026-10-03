# Personal Website · Fabio.cool

**Live site → [fabio.cool](https://fabio.cool/)**

My personal website as a Product Manager: six years at AB InBev, the last as Product Manager
for BEES, serving 300,000 shopkeepers in Peru, now an MIT Sloan MBA ’28.

It's designed as a product launch page: the key numbers, a headline case study with an
interactive before/after demo, a product decision, reviews from managers and a direct report,
a versioned changelog of my career, side projects, and interests.

## How it was built

| Tool | What it did |
|---|---|
| **Me** | Set the goal, chose every story, number and photo, and directed the design through several rounds of feedback, including recruiter reviews. |
| **Claude Code** | Interviewed me, drafted the copy, and wrote the HTML and CSS; checked every version on phone and desktop before shipping. |
| **GitHub** | Hosts the code. A GitHub Actions workflow (`.github/workflows/deploy.yml`) publishes it to GitHub Pages on every push to `main`. |

No framework and no build step: one hand-written `index.html` (HTML, CSS and a few lines of
JavaScript for the theme toggle). Fonts are self-hosted (Geist, Geist Mono, Instrument
Serif), so the page makes no third-party requests.

## Files

```
index.html                  the whole site
assets/                     photos, CV, social preview image, favicon
assets/fonts.css, fonts/    self-hosted web fonts
.github/workflows/deploy.yml  check links → publish to GitHub Pages
```

## Updating

Edit `index.html` (or replace a file in `assets/`), commit and push to `main`. The site is
live about a minute later. To update the CV, replace `assets/Fabio-Macedo-CV.pdf`.

One-time setup (do this once): **Settings → Pages → Build and deployment → Source:
GitHub Actions.**

Custom domain: **fabio.cool**, set in Settings → Pages → Custom domain, with DNS at the
registrar (A/AAAA records for the apex pointing to GitHub Pages, `www` CNAME to
`fabiomn97.github.io`). The old `fabiomn97.github.io/Who-I-Am` address redirects to it.

## Notes

- Light and dark themes: follows the OS, with a toggle that remembers the choice.
- English / Spanish toggle (`assets/i18n-es.js`, keyed by the English text; anything without a
  translation stays in English, and recommendation quotes are never translated).
- Command menu (⌘K / Ctrl+K) to jump to sections, copy the email or download the CV.
- Live version: the nav and footer read the latest commit from the GitHub API.
- Responsive from 320 px; the case-study demo works without JavaScript (it's pure CSS).
- Prints cleanly; respects reduced-motion settings.
