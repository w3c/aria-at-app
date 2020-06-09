const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: ['babel-polyfill', './index.js'],
    mode: 'development',
    devtool: 'inline-source-map',
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
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader'
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
    devServer: {
        contentBase: path.join(__dirname, 'static'),
        port: process.env.CLIENT_PORT || 3000,
        publicPath: '/',
        historyApiFallback: true,
        hotOnly: true,
        proxy: [
            {
                context: ['/aria-at', '/api'],
                target: 'http://localhost:5000'
            }
        ],
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    },
    plugins: [
        new Dotenv({ path: '../config/dev.env' }),
        new CopyWebpackPlugin([
            {
                from: 'static'
            }
        ]),
        new webpack.DefinePlugin({
            'process.env.API_SERVER': JSON.stringify(process.env.API_SERVER),
            'process.env.ENVIRONMENT': JSON.stringify(process.env.ENVIRONMENT),
            'process.env.GITHUB_REPO_OWNER': JSON.stringify(
                process.env.GITHUB_REPO_OWNER
            ),
            'process.env.GITHUB_REPO_NAME': JSON.stringify(
                process.env.GITHUB_REPO_NAME
            )
        })
    ]
};
