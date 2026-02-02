# Releasing Chess Move Notes

This repo uses GitHub Actions to build and attach a release zip containing:
- manifest.json
- main.js
- styles.css (if generated)

## How to release

1. Update versions
   - manifest.json: bump "version"
   - package.json: bump "version"
   - versions.json: add the new mapping "pluginVersion": "minAppVersion"

2. Commit and push those changes to main.

3. Create and push a tag
   - Tag format supported:
     - 0.3.0
     - v0.3.0

   Example:
   - git tag 0.3.0
   - git push origin 0.3.0

4. GitHub Actions will:
   - run npm ci
   - run npm run build (creates out/main.js and out/styles.css)
   - copy manifest.json, README.md, LICENSE.TXT into out/
   - zip the out/ folder
   - create a GitHub Release for the tag and attach the zip

## Notes

- The release zip is what users install in:
  <vault>/.obsidian/plugins/chess-move-notes/
- If you change minAppVersion in manifest.json, remember to update versions.json accordingly.

