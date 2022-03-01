const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: './index.js',
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [{ loader: 'file-loader' }]
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, './dist/'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    devServer: {
        port: '3000',
        // Allows access to the dev server over your local network. Note that
        // you will need to use your computer's address, e.g. 192.168.0.20:3000,
        // and that logging in will require you to manually change the URL from
        // localhost:3000 to 192.168.0.20:3000 each time a redirect occurs.
        host: '0.0.0.0',
        historyApiFallback: true,
        proxy: [
            {
                context: ['/aria-at', '/api'],
                target: process.env.API_SERVER
            }
        ]
    },
    plugins: [
        new Dotenv({ path: '../config/dev.env' }),
        new CopyWebpackPlugin([{ from: 'static' }])
    ]
};
