const baseConfig = require('./base.config.js');
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const ClosureCompilerPlugin = require('webpack-closure-compiler');
const ShakePlugin = require('webpack-common-shake').Plugin;
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');


module.exports = merge(baseConfig, {
  mode: 'production',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist')
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    // new ShakePlugin(),
    // new UglifyJSPlugin({
    //   sourceMap: true
    // }),
    new ClosureCompilerPlugin({
      compiler: {
        // jar: 'path/to/your/custom/compiler.jar', //optional
        // language_in: 'ECMASCRIPT6',
        // language_out: 'ECMASCRIPT5',
        compilation_level: 'ADVANCED',
        debug: true,
      },
      // jsCompiler: true,
      concurrency: 3,
    }),
  ]
});