# Deployment

Do not upload or commit the ZIP file. Extract it first.

1. Upload every file and folder **inside the extracted website folder** to the
   GitHub repository root. `index.html` must be directly visible at the root.
2. Open **Repository Settings → Pages**.
3. Choose **GitHub Actions** as the Pages source.
4. Open **Actions** and run **Auto-build content and deploy Pages** once.
5. Keep `CNAME` for `arbindhital.com.np`.

After this first setup, every commit to `main` or `master` automatically
rebuilds the content catalogue and republishes the site.

If you add a poem, novel, article, song or video, put the file in the repository
root. No HTML edit is required.
