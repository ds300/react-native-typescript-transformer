'use strict'
const ts = require('typescript')
const upstreamTransformer = require('react-native/packager/transformer')
const fs = require('fs')
const appRootPath = require('app-root-path')
const path = require('path')
const process = require('process')
const TSCONFIG_PATH = process.env.TSCONFIG_PATH

const { SourceMapConsumer, SourceMapGenerator } = require('source-map')

function composeSourceMaps (tsMap, babelMap) {
  const map = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(babelMap))
  map.applySourceMap(new SourceMapConsumer(tsMap))
  return map.toJSON()
}

const tsConfig = (() => {
  if (TSCONFIG_PATH) {
    const resolvedTsconfigPath = path.resolve(process.cwd(), TSCONFIG_PATH)
    if (fs.existsSync(resolvedTsconfigPath)) {
      return require(resolvedTsconfigPath)
    }
    console.warn(
      'tsconfig file specified by TSCONFIG_PATH environment variable was not found'
    )
    console.warn(`TSCONFIG_PATH = ${TSCONFIG_PATH}`)
    console.warn(`resolved = ${resolvedTsconfigPath}`)
    console.warn('looking in app root directory')
  }
  const tsConfigPath = appRootPath.resolve('tsconfig.json')
  if (fs.existsSync(tsConfigPath)) {
    return require(tsConfigPath)
  }
  throw new Error(`Unable to find tsconfig.json at ${tsConfigPath}`)
})()

const compilerOptions = Object.assign(tsConfig.compilerOptions, {
  sourceMap: true
})

module.exports.transform = function (sourceCode, filename, options) {
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
    const tsCompileResult = ts.transpileModule(sourceCode, { compilerOptions })
    const babelCompileResult = upstreamTransformer.transform(
      tsCompileResult.outputText,
      filename,
      Object.assign({}, options, { generateSourceMaps: true })
    )
    return Object.assign({}, babelCompileResult, {
      map: composeSourceMaps(
        tsCompileResult.sourceMapText,
        babelCompileResult.map
      )
    })
  } else {
    return upstreamTransformer.transform(sourceCode, filename, options)
  }
}
