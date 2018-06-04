const path = require('path');
const BomPlugin = require('webpack-utf8-bom');

module.exports = {
  entry: {
    index: path.resolve(__dirname, '../src/index.js'),
    sw: path.resolve(__dirname, '../src/sw.js'),
  },
  node: {
    fs: 'empty'
  },
  plugins: [
    // For testing, Chrome chokes on utf-8 characters in sw.js unless we add an explicit utf-8 BOM character.
    new BomPlugin(true)
  ],
  /* inject stub modules with precedence over node_modules, so we can override unnecessary modules that increase the
    size of the build too much */
  resolve: {
    modules: [
      path.resolve(__dirname, "../stubs"),
      "node_modules",
    ]
  }
};