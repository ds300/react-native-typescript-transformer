'use strict'
const ts = require('typescript')
const upstreamTransformer = require('react-native/packager/transformer')
const fs = require('fs')
const appRootPath = require('app-root-path')
const path = require('path')
const process = require('process')
const TSCONFIG_PATH = process.env.TSCONFIG_PATH

const { SourceMapConsumer, SourceMapGenerator } = require('source-map')

function composeSourceMaps(tsMap, babelMap, fileName) {
  // applySourceMap wasn't working for me, so doing it manually
  const map = new SourceMapGenerator()
  const tsConsumer = new SourceMapConsumer(tsMap)
  const babelConsumer = new SourceMapConsumer(babelMap)

  babelConsumer.eachMapping(
    ({
      source,
      generatedLine,
      generatedColumn,
      originalLine,
      originalColumn,
      name,
    }) => {
      if (originalLine) {
        const original = tsConsumer.originalPositionFor({
          line: originalLine,
          column: originalColumn,
        })
        if (original.line) {
          map.addMapping({
            generated: { line: generatedLine, column: generatedColumn },
            original: { line: original.line, column: original.column },
            source: fileName,
            name: null,
          })
        }
      }
    }
  )

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
  sourceMap: true,
  inlineSources: true,
})

module.exports.transform = function(sourceCode, fileName, options) {
  options = Object.assign({}, options, { generateSourceMaps: true })

  if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) {
    const tsCompileResult = ts.transpileModule(sourceCode, {
      compilerOptions,
      fileName,
    })

    const babelCompileResult = upstreamTransformer.transform(
      tsCompileResult.outputText,
      fileName,
      options
    )

    return Object.assign({}, babelCompileResult, {
      map: composeSourceMaps(
        tsCompileResult.sourceMapText,
        babelCompileResult.map,
        fileName
      ),
    })
  } else {
    return upstreamTransformer.transform(sourceCode, fileName, options)
  }
}
