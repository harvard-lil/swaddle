const baseConfig = require('./base.config.js');
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

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
    new UglifyJSPlugin({
      sourceMap: true
    }),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, '../dist')
  },
});