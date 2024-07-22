const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: ['babel-polyfill', './index.js'],
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        options: {
          babelrcRoots: ['.', '../..']
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '..'),
      '@client': __dirname,
      '@components': path.resolve(__dirname, 'components'),
      '@server': path.resolve(__dirname, '../server')
    },
    extensions: ['*', '.js', '.jsx']
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'static'
        }
      ]
    }),
    new webpack.DefinePlugin({
      'process.env.API_SERVER': JSON.stringify(process.env.API_SERVER),
      'process.env.ENVIRONMENT': JSON.stringify(process.env.ENVIRONMENT)
    })
  ],
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};
