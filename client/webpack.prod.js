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
        new CopyWebpackPlugin([
            {
                from: 'static'
            }
        ]),
        new webpack.DefinePlugin({
            'process.env.API_SERVER': JSON.stringify(process.env.API_SERVER)
        })
    ],
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
};
