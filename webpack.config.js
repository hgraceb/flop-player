const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");

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
                // 优化 SVG 文件
                use: 'svgo-loader',
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
    optimization: {
        minimize: true,
        minimizer: [
            // 使用 `...` 语法扩展已有的插件 (如：`terser-webpack-plugin`)
            `...`,
            // 压缩 HTML 文件，比 HtmlWebpackPlugin 自带的压缩效果更好
            new HtmlMinimizerPlugin(),
        ],
    },
};