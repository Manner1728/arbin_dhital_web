# Arbin Dhital — Spiritual & Literary Website

A complete, GitHub-ready static website for **arbindhital.com.np**.

## Important: do not upload the ZIP to the repository

The ZIP is only for downloading and transferring the package. Extract it first,
open the `arbin-dhital-website-github-upload` folder, and upload the files and
folders **inside it** to the repository root. `index.html` must appear directly
in the repository root.

This upload edition retains every supplied track while using web-optimized MP3
encoding. Its largest individual website file is below 10 MB, making it suitable
for upload interfaces with stricter limits than GitHub's standard browser limit.

## What is included

- All original images, videos, audio, domain files and supporting assets
- A completely upgraded responsive visual system with dark/light themes
- A page-wide animated cosmos with layered nebulae, parallax stars, cosmic dust,
  constellation traces, twinkling starbursts and occasional comets
- Collision-safe text and panel layouts with protected spacing at desktop,
  tablet and mobile sizes
- Nepali-first interface with English controls
- Four complete poems, including the three newly supplied works
- Purpose-made theme artwork for each new poem
- Yoga, meditation and inner-peace guidance with a dedicated Vedic-teacher visual
- Interactive 12-minute breathing practice and one-minute silence mode
- Browser-generated **continuous flute** and **continuous meditation** soundscapes
- Eight packaged audio tracks: all seven newly supplied tracks plus the previous flute track
- All three previous devotional/meditation videos
- Automatic publishing for root-level documents, audio and video
- Search, content filters, full-screen reading mode and copy controls
- Accessible keyboard navigation, reduced-motion support and mobile layouts

## Automatic content publishing

Place a supported file directly in the repository root and commit it. The
included GitHub Pages workflow runs `scripts/build_content_manifest.py`,
discovers the file, extracts its title/content where possible, classifies it,
and redeploys the website.

Supported writing/document formats:

`TXT`, `MD`, `Markdown`, `DOCX`, `ODT`, `RTF`, `PDF`, `EPUB`

Supported audio formats:

`MP3`, `WAV`, `OGG`, `OGA`, `M4A`, `AAC`, `FLAC`, `OPUS`

Supported video formats:

`MP4`, `WebM`, `MOV`, `M4V`, `OGV`

See [CONTENT_GUIDE.md](CONTENT_GUIDE.md) for title and category rules.

## Publish on GitHub Pages

1. Upload the **contents of this folder** to the repository root.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Commit any change, or open **Actions → Auto-build content and deploy Pages**
   and choose **Run workflow**.
5. Keep `CNAME` to continue using `arbindhital.com.np`.

Do not select “Deploy from a branch”; automatic DOCX/TXT extraction requires
the included GitHub Actions workflow.

## Local preview

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Opening `index.html` directly as a `file://`
page can prevent the browser from loading `content-manifest.json`.

## Important files

- `index.html` — page structure and visitor content
- `assets/css/styles.css` — complete design system
- `assets/js/app.js` — interactions, content rendering and soundscapes
- `scripts/build_content_manifest.py` — automatic file discovery/extraction
- `.github/workflows/deploy-pages.yml` — automatic Pages deployment
- `content-manifest.json` — generated catalogue used by the browser
- Root `poem-*.txt` files — the included poems

## Media note

The supplied audio files remain separate, unmodified MP3 assets. The site owner
is responsible for retaining any source licences or permissions required for
public distribution.
