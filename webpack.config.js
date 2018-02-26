'use strict';
// const webpack = require('webpack');
const path = require('path');

const config = {
  module: {
    rules: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ },
    ],
  },
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.js',
  },
  // plugins: [
  //   new webpack.optimize.UglifyJsPlugin({
  //     compressor: {
  //       pure_getters: true,
  //       unsafe: true,
  //       unsafe_comps: true,
  //       warnings: false,
  //     },
  //   }),
  // ],
};

module.exports = config;
