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
npm start
npm run lint
npm run build
REFERRER=http://yandex.localhost/ npm test
npm pack --dry-run
```

Building the package makes no JS API requests and requires no API key, including
in development mode. The dev server (`npm start`) requires `APIKEY` to serve working
map examples. Integration tests also require a real key; in CI, only tests receive
the `APIKEY` and `REFERRER` secrets. Existing build scripts that pass a key or a
placeholder continue to work.

The Jest setup makes `navigator` and `crypto` writable in Jest 29 on Node 24 before
`@yandex/ymaps3-cli` installs its JSDOM globals. This only affects tests.

## GitHub Actions

- `.github/workflows/tests.yml` installs, lints, builds and inspects the package on
  pushes to main and pull requests targeting main. The job produces the `build` status
  check; select it when configuring branch protection. Integration tests always run and require a real `APIKEY`; missing
  credentials fail CI. Fork pull requests do not receive these secrets.
- `.github/workflows/release.yml` releases version tags without a `v` prefix, such
  as `0.0.13`. A manual run must also select a tag matching `package.json`.
  The tagged commit must be in the history of `main`.
  A release always requires passing integration tests with a real `APIKEY`.

Configure the GitHub Actions secrets `APIKEY` and `REFERRER`. The referrer must
be allowed for your API key (for example, `http://yandex.localhost/`). No npm
publish token is required.

## Enable npm publishing

Configure npm trusted publishing and integration test secrets before releasing.
For a new package, first create it on npm with an initial manual publication. Merging to main runs CI but does not publish;
publishing requires a version tag or a manual run against a matching tag.

Before the initial npm publication, set `repository` in `package.json` to your
actual GitHub repository (its owner/name can differ from the npm package name):

```json
"repository": {
  "type": "git",
  "url": "https://github.com/YOUR_OWNER/YOUR_REPOSITORY.git"
}
```

Use that same owner and repository when configuring trusted publishing so npm
can associate the package and its provenance with the workflow source.

An npm maintainer must configure the existing `%PACKAGE_NAME%` package:

- Provider: GitHub Actions
- Organization or user: your actual GitHub repository owner
- Repository: your actual GitHub repository name
- Workflow filename: `release.yml` (not the full path)
- Environment: leave empty; this workflow does not declare an environment
- Allow direct `npm publish`

Use npm >=11.5.1; Node 24 includes a compatible npm version. Configure trust when
ready to release: its first successful publish must happen within two days.
See https://docs.npmjs.com/trusted-publishers for the current requirements.

After configuring trust and test secrets, publish a new version; existing npm
versions cannot be replaced. Verify the published package and provenance.

## Release a version

Work from a clean `main` branch, with `origin` pointing to
your GitHub repository, then run:

```sh
npm run bump
```

This increments the beta prerelease version, commits only the manifests, creates the
matching version tag and atomically pushes main with only that new tag. It
refuses a dirty checkout or a different branch. Do not use `git push --tags`
when importing historical tags.

Stable versions publish to npm `latest`. Explicitly prepared prerelease tags
publish to `next`; a prerelease does not replace `latest`. Git tags identify
source commits; npm dist-tags identify installation channels.

The template pins Vue and the Node/Scheduler type packages to versions compatible
with TypeScript 5.1. Commit the generated `package-lock.json` before running CI.
