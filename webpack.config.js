const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {},
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: "src", to: ""},
            ],
        }),
    ],
};