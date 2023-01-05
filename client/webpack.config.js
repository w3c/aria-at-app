const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
        static: {
            directory: path.join(__dirname, 'static'),
            watch: true
        },
        port: process.env.CLIENT_PORT || 3000,
        // Allows access to the dev server over your local network. Note that
        // you will need to use your computer's address, e.g. 192.168.0.20:3000,
        // and that logging in will require you to manually change the URL from
        // localhost:3000 to 192.168.0.20:3000 each time a redirect occurs.
        host: '0.0.0.0',
        devMiddleware: {
            publicPath: '/'
        },
        historyApiFallback: true,
        hot: 'only',
        proxy: [
            {
                context: ['/aria-at', '/api', '/embed'],
                target: 'http://localhost:5000'
            }
        ]
    },
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
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
    ]
};
