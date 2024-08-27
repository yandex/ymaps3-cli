# %PACKAGE_NAME% package

---

Yandex JS API package

[![npm version](https://badge.fury.io/js/%PACKAGE_NAME_ENCODED%.svg)](https://badge.fury.io/js/%PACKAGE_NAME_ENCODED%)
[![npm](https://img.shields.io/npm/dm/%PACKAGE_NAME%.svg)](https://www.npmjs.com/package/%PACKAGE_NAME%)

## How use

The package is located in the `dist` folder:

- `dist/types` TypeScript types
- `dist/esm` es6 modules for direct connection in your project
- `dist/index.js` Yandex JS Module

Recommended use `YMapButtonExample` as usual npm package:

```sh
npm i %PACKAGE_NAME%
```

and dynamic import

```js
await ymaps3.ready;

// ...

const {YMapButtonExample} = await import('%PACKAGE_NAME%');

// ...

map.addChild(new YMapButtonExample(props));
```

### Usage without npm

You can use CDN with module loading handler in JS API on your page.

Just use `ymaps3.import`:

```js
const pkg = await ymaps3.import('%PACKAGE_NAME%');
```

By default `ymaps3.import` can load self modules.
If you want also load your package, should register cdn:

```js
ymaps3.import.registerCdn('https://cdn.jsdelivr.net/npm/{package}', '%PACKAGE_NAME%@latest');
```
