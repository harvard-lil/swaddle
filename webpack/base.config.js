const BomPlugin = require('webpack-utf8-bom');
const path = require('path');

module.exports = {
  entry: {
    index: path.resolve(__dirname, '../src/index.js'),
    sw: path.resolve(__dirname, '../src/sw.js'),
  },
  node: {
    fs: 'empty'
  },
  plugins: [
    new BomPlugin(true)
  ],
};