# react-native-typescript-transformer

A transformer to use for loading TypeScript files with react-native >= 0.45

It uses Babel as a secondary compilation step for simplicity's sake, and to
enable synthetic default imports.

## Usage

    yarn add --dev react-native-typescript-transformer typescript

Make sure your tsconfig.json has the following:

```json
{
  "compilerOptions": {
    "target": "es2015",
    "module": "es2015",
    "jsx": "react-native",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  }
}
```

And add this to your rn-cli.config.js (make one if you don't have one already):

```js
module.exports = {
  getTransformModulePath() {
    return require.resolve('react-native-typescript-transformer')
  },
  getProjectRoots() {
    return [__dirname];
  },
  getSourceExts() {
    return ['ts', 'tsx'];
  }
}
```

And you should be you good to go!

## License

MIT
