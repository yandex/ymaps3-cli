# Yandex JS CLI utils

[![Build Status](https://github.com/ymaps/ymaps3-cli/workflows/Run%20tests/badge.svg)](https://github.com/ymaps3-world/ymaps3-cli/actions/workflows/tests.yml)
[![npm version](https://badge.fury.io/js/@yandex%2Fymaps3-cli.svg)](https://badge.fury.io/js/@yandex%2Fymaps3-cli)
[![npm](https://img.shields.io/npm/dm/@yandex/ymaps3-cli.svg)](https://www.npmjs.com/package/@yandex/ymaps3-cli)

The project is used for inheritance in packages https://yandex.ru/dev/maps/jsapi/doc/3.0/ref/packages/index.html

> Requires a key to work https://yandex.ru/dev/maps/jsapi/doc/3.0/quickstart.html#get-api-key

In your project, you can include this package in order to simplify
the development of packages for ymaps3 JS API.
It won't completely get rid of the boilerplate,
but it will at least allow you to inherit all the main configs.

## Create ymaps3 package by template

```sh
npx @yandex/ymaps3-cli --name="ymaps3-my-super-pkg"
```

You can see the full list of options here:

```sh
npx @yandex/ymaps3-cli help
```

Or you can set up all elements of the package yourself, such as autotests, linting and building.

## Manual

Install package `@yandex/ymaps3-cli`

```sh
npm i -D @yandex/ymaps3-cli#main
```

For development, you may also need types for the libraries you use:

```sh
npm i -D @types/got @types/jest @types/jsdom @types/react @yandex/ymaps3-types
```

### Linting

Install `eslint`

```sh
npm i eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-prettier -D
```

Create `.eslintrc.js` file:

```js
module.exports = {
  extends: ['./node_modules/@yandex/ymaps3-cli/.eslintrc.js']
};
```

Create `.prettierrc.js` file:


```js
const config = require("@yandex/ymaps3-cli/.prettierrc.json");

module.exports = {
  ...config
}
```

### Build

Install `webpack` and `typescript`

```sh
npm i webpack webpack-cli webpack-dev-server css-loader style-loader terser-webpack-plugin ts-loader typescript -D
```

Create files `webpack.config.js`:

```js
module.exports = (args, env, dir = process.cwd()) => {
  return require('@yandex/ymaps3-cli/webpack.config')(args, env, dir);
}
```

and `tsconfig.json`

```json
{
  "extends": ["@yandex/ymaps3-cli"],
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./node_modules/@yandex"]
  }
}
```

### Test

We use `jest` + `jsdom`:

```sh
npm i -D jest jsdom ts-jest got@11.8.6 dotenv cross-fetch identity-obj-proxy
```

And create `jest.config.json` file:

```js
module.exports = {
  ...require('@yandex/ymaps3-cli/jest.config.js')
};
```
