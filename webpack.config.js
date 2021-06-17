const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/js/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(svg)$/i,
                type: 'asset',
            },
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: "src/js/parser", to: "js/parser"},
            ],
        }),
        new HtmlWebpackPlugin({
            template: "./src/video.html",
        }),
    ],
};