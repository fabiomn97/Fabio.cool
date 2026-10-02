# Who I Am · Fabio Macedo

**Live site → [fabiomn97.github.io/Who-I-Am](https://fabiomn97.github.io/Who-I-Am/)**

My personal website as a Product Manager: six years at AB InBev, the last as Product Manager
for BEES, serving 300,000 shopkeepers in Peru, now an MIT Sloan MBA ’28.

It's designed as a product launch page: the key numbers, a headline case study with an
interactive before/after demo, a product decision, reviews from managers and a direct report,
a versioned changelog of my career, side projects, and interests.

## How it was built

| Tool | What it did |
|---|---|
| **Claude Code** | Interviewed me over several rounds (positioning, target roles, the stories behind the numbers), drew on my CV and recommendations, then wrote and designed the site. I approved the structure and every number. |
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

## Notes

- Light and dark themes: follows the OS, with a toggle that remembers the choice.
- Responsive from 320 px; the case-study demo works without JavaScript (it's pure CSS).
- Prints cleanly; respects reduced-motion settings.
