const baseConfig = require('./base.config.js');
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');



module.exports = env => {
  return merge(baseConfig, {
    mode: 'production',
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, '../dist')
    },
    devtool: 'source-map',
    plugins: [
      new UglifyJSPlugin({
        sourceMap: true
      }),
      new webpack.DefinePlugin({
        // make sure packages know they're in production
        'process.env.NODE_ENV': JSON.stringify('production'),
        // load global settings from OPENAPI_WAF_CONFIG environment variable, setting defaults for prod
        OPENAPI_WAF_CONFIG: merge({"ERRORS_TO_CLIENT": false}, JSON.parse(env.OPENAPI_WAF_CONFIG || "{}")),
      }),
    ],
    devServer: {
      contentBase: path.resolve(__dirname, '../dist')
    },
  });
};