## 1.2.13

- Add support for "extends" tsconfig option. Contribution by @alechill

## 1.2.12

- Add support for RN >= 59

## 1.2.11

- David Sheldrick update lockfile
- David Sheldrick update readme for babel 7
- Koen Punt remove resolver.sourceExts
- Koen Punt update readme for latest metro bundler
- aleclarson fix: add missing dependency
- Andrew Goodale Simplify lib to just `es2017`
- Andrew Goodale Do not recommend "dom" TS library

## 1.2.10

Add support for RN >= 56

Contribution by timwangdev

## 1.2.9

Revert to old (sync, non-wasm) version of source-map. Not worth the trouble right now?

## 1.2.8

Remove engingeStrict field in package.json, since some people claim that the version range
`>=8.0.0` is being mishandled by npm (???)

## 1.2.7

Add enginges field in package.json, since WebAssembly is only available in node 8+

## 1.2.6

Update source-map, which now uses WASM and is apparently a lot faster.

## 1.2.5

Improve error message when failure to find tsconfig.json file

Contribution by @vyshkant in #58

## 1.2.4

Fix tsconfig.json resolution for Monorepos.

Contribution by @ali-hk in #54

## 1.2.3

Fix react native version sniffing.

Contribution by @wsxyeah

## 1.2.2

Remove `crypto` dependency. It's bundled with node.

## 1.2.1

Fix minor bug with ast source map transformation

## 1.2.0

Add implementation for getCacheKey

## 1.1.7

Add source map support for RN >= 0.52

## 1.1.6

Add basic support for RN >= 0.52

Contribution by @olofd

## 1.1.5

Borked publish, do not use.

## 1.1.4

Improve README.md

## 1.1.3

Add support for RN => 0.47

## 1.1.2

Make typescript a peer dependency of react-native-typescript-transformer

## 1.1.1

Amend support for react-native >= 0.46 in light of metro-bundler changes
before the final 0.46.0 was released.

Contribution by @petejkim

## 1.1.0

Add tentative support for react-native >= 0.46, which uses the external
`metro-bundler` package instead of an internal bundler

Contribution by @Igor1201

## 1.0.13

Fix readme

## 1.0.12

Add support for raw mappings

Contribution by @stackia

## <= 1.0.11

Consult git log. Sorry.

Contributions by @cliffkoh (json5) and @orta (typo fix)
