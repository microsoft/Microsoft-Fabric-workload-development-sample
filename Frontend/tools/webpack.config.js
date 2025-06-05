const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Webpack = require("webpack");
const path = require("path");
const fs = require("fs").promises;

console.log('******************** Build: Environment Variables *******************');
console.log('process.env.WORKLOAD_NAME: ' + process.env.WORKLOAD_NAME);
console.log('process.env.WORKLOAD_BE_URL: ' + process.env.WORKLOAD_BE_URL);
console.log('process.env.DEV_AAD_CONFIG_BE_AUDIENCE: ' + process.env.DEV_AAD_CONFIG_BE_AUDIENCE);
console.log('process.env.DEV_AAD_CONFIG_BE_APPID: ' + process.env.DEV_AAD_CONFIG_BE_APPID);
console.log('process.env.DEV_AAD_CONFIG_BE_REDIRECT_URI: ' + process.env.DEV_AAD_CONFIG_BE_REDIRECT_URI);
console.log('process.env.DEV_AAD_CONFIG_FE_APPID: ' + process.env.DEV_AAD_CONFIG_FE_APPID);
console.log('*********************************************************************');

module.exports = {
    mode: "development",
    entry: "./src/index.ts",
    output: {
        filename: "bundle.[fullhash].js",
        path: path.resolve(__dirname, "dist"),
        publicPath: '/',
    },
    devtool: "source-map",
    plugins: [
        new CleanWebpackPlugin(),
        new Webpack.DefinePlugin({
            "process.env.WORKLOAD_NAME": JSON.stringify(process.env.WORKLOAD_NAME),
            "process.env.WORKLOAD_BE_URL": JSON.stringify(process.env.WORKLOAD_BE_URL),
        }),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
        }),
        // -- uncomment when static are required to be copied during build --
        new CopyWebpackPlugin({
            patterns: [
                {
                    context: './src/internalAssets/',
                    from: '**/*',
                    to: './internalAssets',
                },
                {
                    from: './tools/web.config',
                    to: './web.config',
                },
            ]
        }),
    ],
    resolve: {
        modules: [__dirname, "src", "node_modules"],
        extensions: ["*", ".js", ".jsx", ".tsx", ".ts"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: "ts-loader",
            },
            {
                test: /\.s[ac]ss$/i, // this is for loading scss
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.(png|jpg|jpeg|svg)$/i, // this is for loading assests
                type: '/asset/resource'
            },
        ],
    },
    devServer: {
        port: 60006,
        open: false,
        historyApiFallback: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
            "Access-Control-Allow-Headers": "*"
        },
        setupMiddlewares
            : function (middlewares, devServer) {
                console.log('*********************************************************************');
                console.log('****               Server is listening on port 60006             ****');
                console.log('****   You can now override the Fabric manifest with your own.   ****');
                console.log('*********************************************************************');

                devServer.app.get('/manifests_new/metadata', function (req, res) {
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                    });

                    const devParameters = {
                        name: process.env.WORKLOAD_NAME,
                        url: "http://127.0.0.1:60006",
                        devAADAppConfig: {
                            audience: process.env.DEV_AAD_CONFIG_BE_AUDIENCE,
                            appId: process.env.DEV_AAD_CONFIG_BE_APPID,
                            redirectUri: process.env.DEV_AAD_CONFIG_BE_REDIRECT_URI
                        },
                        devAADFEAppConfig: {
                            appId: process.env.DEV_AAD_CONFIG_FE_APPID,
                        }
                    };

                    res.end(JSON.stringify({ extension: devParameters }));
                });

                devServer.app.get('/manifests_new', async function (req, res) {
                    const filePath = path.resolve(__dirname, '../validation/ManifestPackageRelease.1.0.0.nupkg');
                    try {
                        // Check if the file exists
                        await fs.access(filePath);

                        res.status(200).set({
                            'Content-Type': 'application/octet-stream',
                            'Content-Disposition': `attachment; filename="ManifestPackageRelease.1.0.0.nupkg"`,
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET',
                            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                        });

                        res.sendFile(filePath);
                    } catch (err) {
                        console.error(`❌ File not found: ${err.message}`);
                        res.status(404).json({ error: "File not found" });
                    }
                });
                return middlewares;
            },
    }
};
