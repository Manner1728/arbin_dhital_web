# Add New Content Without Editing the Website

Upload the new file directly beside `index.html` in the GitHub repository root,
then commit it. The website updates automatically.

## Fastest method

Use a helpful filename:

- `poem-my-new-poem.txt`
- `article-inner-peace.docx`
- `novel-the-long-journey.docx`
- `music-evening-flute.mp3`
- `video-meditation-session.mp4`

For TXT, Markdown, DOCX, ODT and RTF, the first meaningful line is used as the
title. DOCX document properties are also checked.

Audio and video titles are taken from embedded MP3 title metadata when
available, otherwise from the filename.

## Precise title, type and image

For `.txt` or `.md`, add this optional block at the top:

```text
---
title: मेरो नयाँ कविता
type: poem
author: अर्बिन धिताल
language: ne
image: assets/images/my-poem-image.jpg
featured: true
excerpt: छोटो र आकर्षक परिचय।
---

यहाँबाट पूर्ण रचना सुरु हुन्छ।
```

Allowed `type` values are `poem`, `article`, and `novel`.

If no type is supplied, the system uses the filename, document length and line
shape to decide:

- names beginning with `poem-` or `kavita-` become poems;
- names beginning with `article-`, `essay-` or `blog-` become articles;
- names beginning with `novel-` or `upanyas-` become novels;
- very long documents are treated as novels;
- short line-based writing is treated as poetry;
- remaining writing is treated as an article.

## Supported files

Writing and documents:

`txt`, `md`, `markdown`, `docx`, `odt`, `rtf`, `pdf`, `epub`

Audio:

`mp3`, `wav`, `ogg`, `oga`, `m4a`, `aac`, `flac`, `opus`

Video:

`mp4`, `webm`, `mov`, `m4v`, `ogv`

PDF and EPUB are shown with an **Open file** action. Their text is not extracted
inside the GitHub workflow.

## Update before testing locally

Run:

```bash
python3 scripts/build_content_manifest.py --root .
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
