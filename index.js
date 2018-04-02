'use strict'
const ts = require('typescript')
const fs = require('fs')
const findRoot = require('find-root')
const os = require('os')
const path = require('path')
const process = require('process')
const semver = require('semver')
const traverse = require('babel-traverse')
const crypto = require('crypto')
const babylon = require('bablyon')

const TSCONFIG_PATH = process.env.TSCONFIG_PATH

let upstreamTransformer = null

const reactNativeVersionString = require('react-native/package.json').version
const reactNativeMinorVersion = semver(reactNativeVersionString).minor

const typeScriptVersion = require('typescript/package.json').version

if (reactNativeMinorVersion >= 52) {
  upstreamTransformer = require('metro/src/transformer')
} else {
  console.error('***ERROR***')
  console.error('')
  console.error(
    '    react-native-typescript-transformer@^2 requires react-native@>=0.52'
  )
  console.error(
    '    Please upgrade react-native or downgrade react-native-typescript-transformer'
  )
  console.error('')
  process.exit(1)
}

const { SourceMapConsumer } = require('source-map')

function loadJsonFile(jsonFilename) {
  if (!fs.existsSync(jsonFilename)) {
    throw new Error(`Input file not found: ${jsonFilename}`)
  }

  const buffer = fs.readFileSync(jsonFilename)
  try {
    let jju = require('jju')
    return jju.parse(buffer.toString())
  } catch (error) {
    throw new Error(
      `Error reading "${jsonFilename}":${os.EOL}  ${error.message}`
    )
  }
}

// only used with RN >= 52
function sourceMapAstInPlace(tsMap, babelAst) {
  const tsConsumer = new SourceMapConsumer(tsMap)
  traverse.default.cheap(babelAst, node => {
    if (node.loc) {
      const originalStart = tsConsumer.originalPositionFor(node.loc.start)
      if (originalStart.line) {
        node.loc.start.line = originalStart.line
        node.loc.start.column = originalStart.column
      }
      const originalEnd = tsConsumer.originalPositionFor(node.loc.end)
      if (originalEnd.line) {
        node.loc.end.line = originalEnd.line
        node.loc.end.column = originalEnd.column
      }
    }
  })
}

const tsConfig = (() => {
  if (TSCONFIG_PATH) {
    const resolvedTsconfigPath = path.resolve(process.cwd(), TSCONFIG_PATH)
    if (fs.existsSync(resolvedTsconfigPath)) {
      return loadJsonFile(resolvedTsconfigPath)
    }
    console.warn(
      'tsconfig file specified by TSCONFIG_PATH environment variable was not found'
    )
    console.warn(`TSCONFIG_PATH = ${TSCONFIG_PATH}`)
    console.warn(`resolved = ${resolvedTsconfigPath}`)
    console.warn('looking in app root directory')
  }
  const root = findRoot(process.cwd(), dir => {
    const pkg = path.join(dir, 'tsconfig.json')
    return fs.existsSync(pkg)
  })
  const tsConfigPath = path.join(root, 'tsconfig.json')
  return loadJsonFile(tsConfigPath)
})()

if (semver.lt(typeScriptVersion, '2.7.0')) {
  if (tsConfig.compilerOptions.allowSyntheticDefaultExports) {
    console.warn('*** WARNING in tsconfig.json ***')
    console.warn('')
    console.warn(
      '    option allowSyntheticDefaultExports is only compatible with typescript@>=2.7'
    )
    console.warn('')
  }
}

if (
  tsConfig.compilerOptions.allowSyntheticDefaultExports &&
  !tsConfig.compilerOptions.esModuleInterop
) {
  console.warn('*** WARNING in tsconfig.json ***')
  console.warn('')
  console.warn(
    '    option allowSyntheticDefaultExports must be combined with esModuleInterop'
  )
  console.warn('')
}

if (
  tsConfig.compilerOptions.esModuleInterop &&
  tsConfig.compilerOptions.module.toLowerCase() !== 'commonjs'
) {
  console.warn('*** WARNING in tsconfig.json ***')
  console.warn('')
  console.warn(
    '    option esModuleInterop must be used with "module": "commonJS"'
  )
  console.warn('')
}

const compilerOptions = Object.assign(tsConfig.compilerOptions, {
  sourceMap: true,
  inlineSources: true,
})

module.exports.getCacheKey = function() {
  const upstreamCacheKey = upstreamTransformer.getCacheKey
    ? upstreamTransformer.getCacheKey()
    : ''
  var key = crypto.createHash('md5')
  key.update(upstreamCacheKey)
  key.update(fs.readFileSync(__filename))
  key.update(JSON.stringify(tsConfig))
  return key.digest('hex')
}

module.exports.transform = function(src, filename, options) {
  if (typeof src === 'object') {
    // handle RN >= 0.46
    ;({ src, filename, options } = src)
  }

  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
    const tsCompileResult = ts.transpileModule(src, {
      compilerOptions,
      fileName: filename,
      reportDiagnostics: true,
    })

    const errors = tsCompileResult.diagnostics.filter(
      ({ category }) => category === ts.DiagnosticCategory.Error
    )

    if (errors.length) {
      // report first error
      const error = errors[0]
      const message = ts.flattenDiagnosticMessageText(error.messageText, '\n')
      if (error.file) {
        let { line, character } = error.file.getLineAndCharacterOfPosition(
          error.start
        )
        if (error.file.fileName === 'module.ts') {
          console.error({
            error,
            filename,
            options,
          })
        }
        throw new Error(
          `${error.file.fileName} (${line + 1},${character + 1}): ${message}`
        )
      } else {
        throw new Error(message)
      }
    }

    const ast = babylon.parse(tsCompileResult.outputText, {
      sourceFilename: filename,
    })

    sourceMapAstInPlace(tsCompileResult.sourceMapText, ast)

    return { ast }
  } else {
    return upstreamTransformer.transform({
      src,
      filename,
      options,
    })
  }
}
