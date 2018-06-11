const baseConfig = require('./base.config.js');
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');



module.exports = env => {
  let config = {"ERRORS_TO_CLIENT": false};
  if(env && env.OPENAPI_WAF_CONFIG)
    config = merge(config, JSON.parse(env.OPENAPI_WAF_CONFIG));
  return merge(baseConfig, {
    mode: 'production',
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, '../dist')
    },
    devtool: 'source-map',
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        generateStatsFile: true,
      }),
      new UglifyJSPlugin({
        sourceMap: true
      }),
      new webpack.DefinePlugin({
        // make sure packages know they're in production
        'process.env.NODE_ENV': JSON.stringify('production'),
        // load global settings from OPENAPI_WAF_CONFIG environment variable, setting defaults for prod
        OPENAPI_WAF_CONFIG: config,
      }),
    ],
    devServer: {
      contentBase: path.resolve(__dirname, '../dist')
    },
  });
};