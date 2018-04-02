# react-native-typescript-transformer

Seamlessly use TypeScript with react-native >= 0.45

## Usage

### Step 1: Install

    yarn add --dev react-native-typescript-transformer typescript

### Step 2: Configure TypeScript

Make sure your tsconfig.json has these compiler options:

```json
{
  "compilerOptions": {
    "target": "es2015",
    "jsx": "react",
    "noEmit": true,
    "moduleResolution": "node",
  },
  "exclude": [
    "node_modules",
  ],
}
```

See [tsconfig.json Notes](#tsconfigjson-notes) for more advanced configuration details.

### Step 3: Configure the react native packager

Add this to your rn-cli.config.js (make one if you don't have one already):

```js
module.exports = {
  getTransformModulePath() {
    return require.resolve('react-native-typescript-transformer');
  },
  getSourceExts() {
    return ['ts', 'tsx'];
  }
}
```

If you need to run the packager directly from the command line, run the following

    react-native start --config /absolute/path/to/rn-cli.config.js


### Step 4: Write TypeScript code!

Note that the platform-specific index files (index.ios.js, index.android.js, etc)
still need to be .js files, but everything else can be TypeScript.

You probably want typings for react and react-native

    yarn add --dev @types/react @types/react-native

Note that if you run `yarn tsc` it will act as a type checker rather than a compiler. Run it with `--watch` to catch dev-time errors in all files, not just the one you're editing.

### Use tslib (Optional)

    yarn add tslib

in tsconfig.json

```patch
 {
   "compilerOptions": {
+    "importHelpers": true,
   }
 }
```

Doing this should reduce your bundle size. See [this blog post](https://blog.mariusschulz.com/2016/12/16/typescript-2-1-external-helpers-library) for more details.

### Use absolute paths (Optional)

Absolute paths needs to have support from both the TypeScript compiler and the react-native packager.

This section will show you how to work with project structures like this:

```
<rootDir>
├── src
│   ├── package.json
│   ├── App.tsx
│   ├── components
│   │   ├── Banana.tsx
│   ├── index.tsx
├── index.ios.js
├── package.json
├── tsconfig.json
```

Where you want to be able to `import Banana from 'src/components/Banana'` from any .ts(x) file, regardless of its place in the directory tree.

#### TypeScript

In `tsconfig.json`:

```patch
 {
   "compilerOptions": {
+    "baseUrl": "."
   }
 }
```

#### react-native

For react-native you need to add one or more `package.json` files. These only need to contain the `"name"` field, and should be placed into any folders in the root of your project that you want to reference with an absolute path. The `"name"` field's value should be the name of the folder.  So for me, I just added one file at `src/package.json` with the contents `{"name": "src"}`.

#### Jest (Optional)

If you use Jest as a test runner, add the following in your root package.json:

```patch
 {
   "jest" {
+     "modulePaths": ["<rootDir>"]
   }
 }
```

## tsconfig.json Notes

- If you enable synthetic default imports with the `"allowSyntheticDefaultImports"` flag, be sure to set `"module"` to something like "es2015" to allow the es6 import/export syntax to pass through the TypeScript compiler untouched. Then Babel can compile those statements while emitting the necessary extra code to make synthetic default imports work properly.

  This is neccessary until TypeScript implements suport for synthetic default imports in emitted code as well as in the type checker. See [Microsoft/TypeScript#9562](https://github.com/Microsoft/TypeScript/issues/9562).

- `"target"` can be anything supported by your project's Babel configuration.

- `"jsx"` can also be `"react-native"` or `"preserve"`, which are functionally identical in the context of a react-native-typescript-transformer project. In this case, the JSX syntax is compiled by Babel instead of TypeScript

- The source map options are not useful

- You probably want to specify some base typings with the `"lib"` option. I've had success with the following:

  ```patch
   {
     "compilerOptions": {
  +    "lib": [ "dom", "es2015", "es2016" ],
     }
   }
  ```

## Jest notes

Follow the react-native setup guide for [ts-jest](https://github.com/kulshekhar/ts-jest).

Alternatively, if you want to use exactly the same transformation code for both Jest and react-native check out [this comment](https://github.com/ds300/react-native-typescript-transformer/issues/21#issuecomment-330148700).

Note that there have been no reports of problems arising from differences between code compiled by the `ts-jest` transformer and code compiled by `react-native-typescript-transformer`. Additionally, `ts-jest` takes care of a lot of edge cases and is more configurable.

## Avoid cyclical dependencies

If you're transitioning an app from `tsc` to `react-native-typescript-transformer`, you might see runtime errors which involve imported modules being `undefined`. You almost certainly have cyclical inter-module dependencies which manifest during your app's initialization. e.g. if ModuleA is `undefined` in ModuleB it means that ModolueA (in)directly imports ModuleB.

`tsc` seems to be able to mitigate some instances of these cyclical dependencies when used as a whole-app compiler. Unfortunately the module-at-a-time compilation approach that react-native's bundler supports does not permit the same optimizations.

Be especially careful of "umbrella export" files which can easily introduce these cycles.

## License

MIT

[![Empowered by Futurice's open source sponsorship program](https://img.shields.io/badge/sponsor-futurice-ff69b4.svg)](http://futurice.com/blog/sponsoring-free-time-open-source-activities?utm_source=github&utm_medium=spice&utm_campaign=react-native-typescript-transformer)
