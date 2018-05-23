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
  it('works for production mode', async () => {
    const result = await transformer.transform(file, 'blah.tsx', {
      generateSourceMaps: true,
    })
    expect(result.code).toMatchSnapshot()
    expect(result.map).toMatchSnapshot()
  })

  it('works for dev mode', async () => {
    const result = await transformer.transform(file, 'blah.tsx')
    expect(result.code).toMatchSnapshot()
    expect(result.map).toMatchSnapshot()
  })

  it('throws errors for bad syntax', async () => {
    try {
      await transformer.transform(badSyntaxFile, 'badSyntax.tsx', {})
    } catch (e) {
      expect(e.message).toMatchSnapshot()
    }
  })

  it('does not throw errors for bad types', async () => {
    const result = await transformer.transform(badTypeFile, 'badType.tsx', {})
    expect(result.code).toMatchSnapshot()
  })
})

const badSyntaxFile = `
const x == 7;
`

const badTypeFile = `
const x: boolean = 5;
`
