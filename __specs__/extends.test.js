const transformer = require('../')
const path = require('path')

describe('Config extension', () => {
  describe('Given a tsconfig that extends a relative config file', () => {
    describe('When tsconfig is loaded', () => {
      let config

      beforeAll(() => {
        process.env.TSCONFIG_PATH = path.resolve(
          __dirname,
          './__fixtures__/tsconfigExtendsFile.json'
        )
        config = transformer.loadTSConfig()
      })

      it('Should contain compiler options that are only defined in top level config', () => {
        expect(config.compilerOptions.tsconfigExtendsFile).toBe(true)
      })

      it('Should retain compiler options defined in base config that are not overriden', () => {
        expect(config.compilerOptions.tsconfigNoExtends).toBe(true)
      })

      it('Should override duplicate compiler options with values from highest level config', () => {
        expect(config.compilerOptions.overrideMe).toBe('tsconfigExtendsFile')
      })

      afterAll(() => {
        delete process.env.TSCONFIG_PATH
      })
    })
  })

  describe('Given a tsconfig that extends a multiple config files', () => {
    describe('When tsconfig is loaded', () => {
      let config

      beforeAll(() => {
        process.env.TSCONFIG_PATH = path.resolve(
          __dirname,
          './__fixtures__/tsconfigExtendsFileRecursive.json'
        )
        config = transformer.loadTSConfig()
      })

      it('Should contain compiler options that are only defined in top level config', () => {
        expect(config.compilerOptions.tsconfigExtendsFileRecursive).toBe(true)
      })

      it('Should retain compiler options in middle config that are not overriden', () => {
        expect(config.compilerOptions.tsconfigExtendsFile).toBe(true)
      })

      it('Should retain compiler options defined in base config that are not overriden', () => {
        expect(config.compilerOptions.tsconfigNoExtends).toBe(true)
      })

      it('Should override duplicate compiler options with values from highest level config', () => {
        expect(config.compilerOptions.overrideMe).toBe(
          'tsconfigExtendsFileRecursive'
        )
      })

      afterAll(() => {
        delete process.env.TSCONFIG_PATH
      })
    })
  })

  describe('Given a tsconfig that extends a module config', () => {
    describe('When tsconfig is loaded', () => {
      let config

      beforeAll(() => {
        process.env.TSCONFIG_PATH = path.resolve(
          __dirname,
          './__fixtures__/tsconfigExtendsModule.json'
        )
        config = transformer.loadTSConfig()
      })

      afterAll(() => {
        delete process.env.TSCONFIG_PATH
      })

      it('Should contain compiler options that are only defined in top level config', () => {
        expect(config.compilerOptions.tsconfigExtendsModule).toBe(true)
      })

      it('Should retain compiler options defined in base config that are not overriden', () => {
        expect(config.compilerOptions.strict).toBe(true)
      })

      it('Should override duplicate compiler options with values from highest level config', () => {
        expect(config.compilerOptions.moduleResolution).toBe('ES6')
      })
    })
  })

  describe('Given a tsconfig that extends multiple module configs', () => {
    describe('When tsconfig is loaded', () => {
      let config

      beforeAll(() => {
        process.env.TSCONFIG_PATH = path.resolve(
          __dirname,
          './__fixtures__/tsconfigExtendsModuleRecursive.json'
        )
        config = transformer.loadTSConfig()
      })

      afterAll(() => {
        delete process.env.TSCONFIG_PATH
      })

      it('Should contain compiler options that are only defined in top level config', () => {
        expect(config.compilerOptions.tsconfigExtendsModuleRecursive).toBe(true)
      })

      it('Should retain compiler options in middle config that are not overriden', () => {
        expect(config.compilerOptions.strict).toBe(true)
      })

      it('Should retain compiler options defined in base config that are not overriden', () => {
        expect(config.compilerOptions.jsx).toBe('preserve')
      })

      it('Should override duplicate compiler options with values from highest level config', () => {
        expect(config.compilerOptions.moduleResolution).toBe('ES6')
      })
    })
  })

  describe('Given a tsconfig that does not extend', () => {
    describe('When tsconfig is loaded', () => {
      let config

      beforeAll(() => {
        process.env.TSCONFIG_PATH = path.resolve(
          __dirname,
          './__fixtures__/tsconfigNoExtends.json'
        )
        config = transformer.loadTSConfig()
      })

      afterAll(() => {
        delete process.env.TSCONFIG_PATH
      })

      it('Should contain compiler options that are only defined in top level config', () => {
        expect(config.compilerOptions.tsconfigNoExtends).toBe(true)
      })

      it('Should override duplicate compiler options with values from highest level config', () => {
        expect(config.compilerOptions.overrideMe).toBe('tsconfigNoExtends')
      })
    })
  })
})
