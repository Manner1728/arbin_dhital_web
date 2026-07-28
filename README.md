# Arbin Dhital — GitHub Pages Website

A complete, bilingual, responsive static website for **arbindhital.com.np**. Nepali is the default language. English, light mode and dark mode are built in.

## Included features

- Nepali-first interface with instant English switching
- Persistent light/dark mode
- Cinematic spiritual visual system and responsive animations
- Supplied meditation and contemplation photographs
- Custom Krishna devotional artwork and animated halo treatment
- Complete featured poem in Nepali and an English literary translation
- Focused reading mode and copy-poem function
- Expandable sections for poems, literature, reflections, blogs and vlogs
- GitHub Pages custom `404.html`, `CNAME`, sitemap, robots file and web manifest
- No framework, build command or paid dependency

## Preview locally

### Windows PowerShell

```powershell
cd arbin-dhital-website
python -m http.server 8080
```

Open `http://localhost:8080`.

## Upload manually to GitHub

1. Create a new empty GitHub repository.
2. Extract this ZIP.
3. Upload **the contents inside the extracted folder** to the repository root.
4. Open **Settings → Pages** in GitHub.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Select branch **main** and folder **/(root)**, then save.
7. Do not configure Cloudflare until the temporary GitHub Pages URL works correctly.

No GitHub account was connected or modified while creating this package.

## Cloudflare later

The included `CNAME` already contains:

```text
arbindhital.com.np
```

After GitHub Pages is working, configure the DNS records in Cloudflare and then set the custom domain in GitHub Pages. Keep SSL/TLS on **Full** or **Full (strict)** after GitHub provisions the certificate.

## Replace the placeholder email

Search for this text in `index.html` and `assets/js/app.js`:

```text
contact@arbindhital.com.np
```

Replace it with the real address.

## Add a new poem, blog, essay or vlog

In `index.html`, find:

```html
<div class="content-grid" id="contentGrid">
```

Copy one complete `<article class="content-card" ...>` block and change:

- `data-category`: `poetry`, `essay`, `reflection` or `vlog`
- Nepali text in `data-ne`
- English text in `data-en`
- The link or coming-soon label

For a full article archive, add separate HTML pages inside folders such as:

```text
poems/
blogs/
essays/
vlogs/
```

Use relative links, for example `href="poems/new-poem.html"`.

## Main editable files

- `index.html` — all visible content and sections
- `assets/css/styles.css` — design, colors, layout and animation
- `assets/js/app.js` — language, theme, filters, reading mode and particles
- `assets/images/` — photographs, Krishna artwork and logo

## Important image note

The supplied meditation photograph is preserved in the About section. The hero uses an artistic composite created from the supplied portrait with its original natural background replaced by a cinematic devotional setting.
