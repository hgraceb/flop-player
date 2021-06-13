const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");

module.exports = {
    entry: {},
    output: {
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: "src", to: ""},
            ],
        }),
    ],
    optimization: {
        minimizer: [
            // Use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`)
            `...`,
            new CssMinimizerPlugin(),
            new HtmlMinimizerPlugin(),
        ],
    },
};