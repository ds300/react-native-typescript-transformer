const file = `
type Cheese = {
  readonly cheese: string
}

export default function Cheese(): Cheese {
  return {cheese: 'stilton'};
}
`

const transformer = require('../')

describe('the transformer', () => {
  it('works for production mode', () => {
    const result = transformer.transform(file, 'blah.tsx', {
      generateSourceMaps: true,
    })
    expect(result.code).toMatchSnapshot()
    expect(result.map).toMatchSnapshot()
  })

  it('works for dev mode', () => {
    const result = transformer.transform(file, 'blah.tsx')
    expect(result.code).toMatchSnapshot()
    expect(result.map).toMatchSnapshot()
  })

  it('throws errors for bad syntax', () => {
    expect(() => {
      transformer.transform(badSyntaxFile, 'badSyntax.tsx', {})
    }).toThrowErrorMatchingSnapshot()
  })

  it('does not throw errors for bad types', () => {
    const result = transformer.transform(badTypeFile, 'badType.tsx', {})
    expect(result.code).toMatchSnapshot()
  })
})

const badSyntaxFile = `
const x == 7;
`

const badTypeFile = `
const x: boolean = 5;
`
