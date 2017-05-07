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
  it('works', () => {
    const result = transformer.transform(file, 'blah.tsx', {})
    expect(result.code).toMatchSnapshot()
    expect(result.map).toMatchSnapshot()
  })
})
