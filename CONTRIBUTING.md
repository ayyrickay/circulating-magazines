# Contributing

## Branch and deploy workflow
1. Use `develop` as the main development branch.
2. Open pull requests into `develop`.
3. Keep `gh-pages` as the deploy/output branch.
4. Current deploy automation uses GitHub Actions from `develop` to GitHub Pages (`gh-pages`) (see `.github/workflows/node.js.yml`).
5. Legacy deploy config is also present in `.travis.yml` from the earlier Travis-based setup.

## Local setup
1. Use Node.js 24 (for `nvm` users):
   `nvm use`
2. Install dependencies:
   `npm install`
3. Run tests:
   `npm test`
4. Run a local HTTP server from the repository root (do not open `index.html` directly via `file://`):
   `npx serve .`
5. Open the app:
   `http://localhost:3000/`
6. Verify chart behavior and interactions in the browser.

## Data update workflow
1. Add raw CSV files under `assets/data/rawData`:
   `<CODE>-Circulation.csv` and/or `<CODE>-geodata.csv`
2. Generate clean circulation JSON:
   `npm run circulation-cleaner`
3. Generate clean geodata JSON:
   `npm run geodata-cleaner`
4. Rebuild the title list used by the UI:
   `npm run title-generator`

## Pull request checklist
1. Confirm tests pass locally with `npm test`.
2. Verify line chart and map interactions in the browser.
3. Update `README.md` when user-visible behavior or workflows change.
4. Merge into `develop` (do not commit generated deploy artifacts to `gh-pages` manually unless doing a one-off recovery).

## Changesets
1. Add a changeset for any user-visible change:
   `npx changeset`
2. Use `patch` for bugfixes and small improvements, `minor` for new backward-compatible features, and `major` for breaking changes.
3. Reference relevant issue numbers in the changeset body when applicable (for example: `Resolves #49`).
4. Before preparing a release PR, generate version updates:
   `npx changeset version`
5. To inspect pending changesets at any time:
   `npx changeset status`

## Notes
- The project uses `dc.js`/`d3` plus local data-cleaning scripts.
- If GitHub Pages deployment automation changes again, keep `gh-pages` as the deploy target branch and document the new CI workflow here.
