const util = require('node:util');

exports.obsoleteFunction = util.deprecate(() => {
    --no-deprecation 
    --no-warnings
}, 'obsoleteFunction() is deprecated. Use newShinyFunction() instead.');