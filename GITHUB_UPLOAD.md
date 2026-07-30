# Correct GitHub Upload Method

Do not commit `Arbin-Dhital-Website-GitHub-Upload.zip` itself.

1. Extract the ZIP on the computer.
2. Open the extracted `arbin-dhital-website-github-upload` folder.
3. Select everything inside that folder, including:
   - `.github`
   - `.nojekyll`
   - `assets`
   - `scripts`
   - `index.html`
   - the remaining website files
4. Upload those extracted items to the repository root.
5. Commit the extracted files.
6. Open **Settings → Pages** and select **GitHub Actions** as the source.

If the browser still refuses the batch, use GitHub Desktop:

1. Clone the repository in GitHub Desktop.
2. Copy all extracted website files into the cloned repository folder.
3. Return to GitHub Desktop.
4. Enter a summary such as `Update complete cosmic website`.
5. Select **Commit to main**, then **Push origin**.

Every website file in this upload edition is below 10 MB.
