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
        exclude: /\.module\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                exportLocalsConvention: 'camelCase',
                localIdentName: '[local]'
              }
            }
          }
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
    filename: 'bundle.[contenthash:8].js',
    chunkFilename: 'chunk.[name].[contenthash:8].js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '..'),
      '@client': __dirname,
      '@components': path.resolve(__dirname, 'components'),
      '@server': path.resolve(__dirname, '../server'),
      '@shared': path.resolve(__dirname, '../shared')
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
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true
        },
        apollo: {
          test: /[\\/]node_modules[\\/]@apollo[\\/]/,
          name: 'apollo',
          priority: 20,
          reuseExistingChunk: true
        },
        reactBootstrap: {
          test: /[\\/]node_modules[\\/](react-bootstrap|bootstrap)[\\/]/,
          name: 'react-bootstrap',
          priority: 20,
          reuseExistingChunk: true
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          name: 'common'
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};
