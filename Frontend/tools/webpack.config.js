const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Webpack = require("webpack");
const path = require("path");
const fs = require("fs").promises;
const { buildManifestPackage } = require('./build-manifest'); // Import the buildManifestPackage function

console.log('******************** Build: Environment Variables *******************');
console.log('process.env.WORKLOAD_NAME: ' + process.env.WORKLOAD_NAME);
console.log('process.env.DEFAULT_ITEM_NAMEL: ' + process.env.DEFAULT_ITEM_NAME);
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
            "process.env.DEFAULT_ITEM_NAME": JSON.stringify(process.env.DEFAULT_ITEM_NAME),
        }),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
        }),
        // -- uncomment when static are required to be copied during build --
        new CopyWebpackPlugin({
            patterns: [
                {
                    context: './src/assets/',
                    from: '**/*',
                    to: './assets',
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
                        devAADFEAppConfig: {
                            appId: process.env.DEV_AAD_CONFIG_FE_APPID,
                        }
                    };

                    res.end(JSON.stringify({ extension: devParameters }));
                });

                devServer.app.get('/manifests_new', async function (req, res) {
                    try {
                        await buildManifestPackage(); // Wait for the build to complete before accessing the file
                        const filePath = path.resolve(__dirname, '../../config/Manifest/ManifestPackage.1.0.0.nupkg');
                        // Check if the file exists
                        await fs.access(filePath);

                        res.status(200).set({
                            'Content-Type': 'application/octet-stream',
                            'Content-Disposition': `attachment; filename="ManifestPackage.1.0.0.nupkg"`,
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET',
                            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                        });

                        res.sendFile(filePath);
                    } catch (err) {
                        console.error(`❌ Error: ${err.message}`);
                        res.status(500).json({
                            error: "Failed to serve manifest package",
                            details: err.message
                        });
                    }
                });
                return middlewares;
            },
    }
};
