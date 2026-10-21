# Contributing

Use Node.js 24 and install dependencies from the lockfile:

```sh
nvm use
npm ci
```

For the examples and JS API integration tests, set `APIKEY` in an untracked `.env`
file. Obtain a key at https://developer.tech.yandex.ru/ and allow the referrer you
use locally (for example, `http://yandex.localhost/`). Set `REFERRER` accordingly.

```sh
npm run lint
npm run build
node ./dist --help
REFERRER=http://yandex.localhost/ npm test
npm pack --dry-run
```

Building the CLI makes no JS API requests and requires no API key. The npm package
also ships webpack/Jest helpers and project templates; keep these in the tarball.

The shared webpack config allows library builds without `APIKEY`. It checks the
key only when starting the dev server for examples. Existing projects can keep
passing a real key or a placeholder to their build scripts. The Jest helper still
requires a real key for integration tests.

## GitHub Actions

- `.github/workflows/tests.yml` installs, lints, builds and inspects the package on
  pushes to main and pull requests targeting main. The job produces the `build` status
  check; select it when configuring branch protection. Integration tests always run and require a real `APIKEY`; missing
  credentials fail CI. Fork pull requests do not receive these secrets.
- `.github/workflows/release.yml` releases version tags without a `v` prefix, such
  as `0.0.26`. A manual run must also select a tag matching `package.json`.
  The tagged commit must be in the history of `main`.
  A release always requires passing integration tests with a real `APIKEY`.

Configure the GitHub Actions secrets `APIKEY` and `REFERRER`. The referrer must
be allowed for your API key (for example, `http://yandex.localhost/`). No npm
publish token is required.

## Enable npm publishing

Keep the migration PR unmerged until npm trusted publishing and the integration
test secrets are configured. Merging to main runs CI but does not publish;
publishing requires a version tag or a manual run against a matching tag.

An npm maintainer must configure the existing `@yandex/ymaps3-cli` package:

- Provider: GitHub Actions
- Organization: `yandex`
- Repository: `ymaps3-cli`
- Workflow filename: `release.yml` (not the full path)
- Environment: leave empty; this workflow does not declare an environment
- Allow direct `npm publish`

Use npm >=11.5.1; Node 24 includes a compatible npm version. Configure trust when
ready to release: its first successful publish must happen within two days.
See https://docs.npmjs.com/trusted-publishers for the current requirements.

After configuring trust and test secrets, merge the migration PR. Disable the
old repository's publisher before pushing the first new release tag. Publish a
new version; existing npm versions cannot be replaced. Verify the published
package and provenance before archiving the old repository or removing its
remaining publishing credentials.

## Release a version

Work from a clean `main` branch, with `origin` pointing to
`git@github.com:yandex/ymaps3-cli.git`, then run:

```sh
npm run bump
```

This increments the patch version, commits only the manifests, creates the
matching version tag and atomically pushes main with only that new tag. It
refuses a dirty checkout or a different branch. Do not use `git push --tags`
when importing historical tags.

This workflow publishes stable versions to npm `latest`. Prereleases require a
separate publishing configuration; it does not automatically select `next`.
Git tags identify source commits; npm dist-tags identify installation channels.
