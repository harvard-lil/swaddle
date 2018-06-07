const baseConfig = require('./base.config.js');
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

module.exports = env => {
  let config = {"ERRORS_TO_CLIENT": false};
  if(env && env.OPENAPI_WAF_CONFIG)
    config = merge(config, JSON.parse(env.OPENAPI_WAF_CONFIG));
  return merge(baseConfig, {
    mode: 'development',
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, '../test_server')
    },
    devtool: 'cheap-module-eval-source-map',
    devServer: {
      contentBase: path.resolve(__dirname, '../test_server')
    },
    plugins: [
      new webpack.DefinePlugin({
        // load global settings from OPENAPI_WAF_CONFIG environment variable, setting defaults for dev
        OPENAPI_WAF_CONFIG: config,
      }),
    ]
  });
};