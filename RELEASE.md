# Release Guide

## Requirements

- Push access to the repository
- GitHub Actions enabled

## Recommended flow

1. Update `package.json` and `src-tauri/tauri.conf.json` versions.
2. Commit the release changes.
3. Create and push a tag:

```bash
git tag v0.2.0
git push origin v0.2.0
```

4. GitHub Actions `Release` workflow builds the Windows bundle and creates a GitHub Release automatically.

## Manual trigger

You can also open GitHub Actions and run `Release` manually with:

- `release_tag`: for example `v0.2.0`
- `prerelease`: `true` for preview builds

## Outputs

The workflow publishes the Tauri release artifacts to the GitHub Release page for the selected tag.

## Automatic main deployment

The repository also includes `Main Release`.

On every merge to `main` it will:

- run checks
- update the rolling prerelease tag `main-latest`
- upload the Windows Tauri bundles including `.exe` assets to GitHub Releases
- deploy the web build to GitHub Pages
