  
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: ['babel-polyfill', './index.js'],
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
        path: path.resolve(__dirname, '../dist/'),
        publicPath: '/dist/',
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
    devServer: {
        host: '0.0.0.0',
        contentBase: path.join(__dirname, 'static'),
        port: process.env.CLIENT_PORT || 3000,
        publicPath: '/',
        historyApiFallback: true,
        hotOnly: true,
        proxy: {
            '/api': 'http://localhost:5000/'
        },
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: 'static'
            }
        ])
    ]
};