const { createTransformer, getCacheKey } = require('./createTransformer')
module.exports.transform = createTransformer()
module.exports.getCacheKey = getCacheKey
