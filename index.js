'use strict'
const ts = require('typescript')
const upstreamTransformer = require('react-native/packager/transformer')
const fs = require('fs')
const appRootPath = require('app-root-path')
const os = require('os')
const path = require('path')
const process = require('process')
const TSCONFIG_PATH = process.env.TSCONFIG_PATH

const { SourceMapConsumer, SourceMapGenerator } = require('source-map')

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

function composeSourceMaps(tsMap, babelMap, tsFileName, tsContent) {
  const map = new SourceMapGenerator()
  const tsConsumer = new SourceMapConsumer(tsMap)
  const babelConsumer = new SourceMapConsumer(babelMap)

  map.setSourceContent(tsFileName, tsContent)

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
            source: tsFileName,
            name: name,
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
      return loadJsonFile(resolvedTsconfigPath)
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
    return loadJsonFile(tsConfigPath)
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
        throw new Error(
          `${error.file.fileName} (${line + 1},${character + 1}): ${message}`
        )
      } else {
        throw new Error(message)
      }
    }

    const babelCompileResult = upstreamTransformer.transform(
      tsCompileResult.outputText,
      fileName,
      options
    )

    return Object.assign({}, babelCompileResult, {
      map: composeSourceMaps(
        tsCompileResult.sourceMapText,
        babelCompileResult.map,
        fileName,
        sourceCode
      ),
    })
  } else {
    return upstreamTransformer.transform(sourceCode, fileName, options)
  }
}
