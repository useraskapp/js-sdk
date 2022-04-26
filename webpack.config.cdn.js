module.exports = {
    entry: {
        'index': './src/index.ts',
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.s[ac]ss$/i,
                use: ["style-loader", "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: require("sass"),
                        },
                    },
                ],
            },
        ],
    },
    devtool: "source-map",
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: "userask-sdk.js",
        libraryTarget: "var",
        library: "UserAsk"
    },
};
