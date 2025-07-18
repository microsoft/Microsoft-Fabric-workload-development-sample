const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Webpack = require("webpack");
const path = require("path");
const fs = require("fs").promises;
const express = require("express");
const { registerDevServerApis } = require('.'); // Import our manifest API

console.log('******************** Build: Environment Variables *******************');
console.log('process.env.WORKLOAD_NAME: ' + process.env.WORKLOAD_NAME);
console.log('process.env.DEFAULT_ITEM_NAMEL: ' + process.env.DEFAULT_ITEM_NAME);
console.log('*********************************************************************');

module.exports = {
    mode: "development",
    entry: "./app/index.ts",
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
            "process.env.DEV_WORKSPACE_ID": JSON.stringify(process.env.DEV_WORKSPACE_ID),
            "NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
        }),
        new HtmlWebpackPlugin({
            template: "./app/index.html",
        }),
        // -- uncomment when static are required to be copied during build --
        new CopyWebpackPlugin({
            patterns: [
                {
                    context: './app/assets/',
                    from: '**/*',
                    to: './assets',
                },
                {
                    from: './app/web.config',
                    to: './web.config',
                },
            ]
        }),
    ],
    resolve: {
        modules: [__dirname, "node_modules"],
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
        host: '127.0.0.1',
        open: {
            target: '/WorkloadL2'
        },
        historyApiFallback: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
            "Access-Control-Allow-Headers": "*"
        },
        setupMiddlewares: function (middlewares, devServer) {
                console.log('*********************************************************************');
                console.log('****               Server is listening on port 60006             ****');
                console.log('****   You can now override the Fabric manifest with your own.   ****');
                console.log('*********************************************************************');

                // Add JSON body parsing middleware for our APIs
                devServer.app.use(express.json());
                
                // Add global CORS middleware
                devServer.app.use((req, res, next) => {
                    res.header('Access-Control-Allow-Origin', '*');
                    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
                    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                    
                    // Handle preflight requests
                    if (req.method === 'OPTIONS') {
                        res.sendStatus(204);
                    } else {
                        next();
                    }
                });
                
                // Register the manifest API from our extracted implementation
                registerDevServerApis(devServer.app);

                return middlewares;
            },
    }
};
