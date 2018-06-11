const path = require('path');
const fs = require("fs");
const webpack = require('webpack');

// load config vars from scripts/config.js
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../scripts/config.json')));

module.exports = {
  entry: {
    index: path.resolve(__dirname, '../src/index.js'),
    sw: path.resolve(__dirname, '../src/sw.js'),
  },
  node: {
    fs: 'empty'
  },
  /* inject stub modules with precedence over node_modules, so we can override unnecessary modules that increase the
    size of the build too much */
  resolve: {
    modules: [
      path.resolve(__dirname, "../stubs"),
      "node_modules",
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      OPENAPI_WAF_CONFIG: config.jsConfig,
    }),
  ],
};