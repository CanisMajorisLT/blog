import webpack = require('webpack');
import WebpackMd5Hash = require('webpack-md5-hash');
import ExtractTextPlugin = require('extract-text-webpack-plugin');
import autoprefixer = require('autoprefixer');
import path = require('path');
import { dist, stylesEntryFile, jsEntryFile, stylesPaths } from '../constants';


export function buildJS(): Promise<CompiledFileNames> {
    const compiler = webpack({
        entry: [
            stylesEntryFile,
            jsEntryFile
        ],
        devtool: 'source-map',

        resolve: {
            extensions: ['.js', '.ts', '.scss']
        },
        output: {
            filename: '[name].[chunkhash].js',
            path: dist,
            publicPath: '/'
        },
        target: 'web',
        module: {
            rules: [
                { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
                { test: /(\.css|\.scss|\.sass)$/, loader: ExtractTextPlugin.extract('css-loader?sourceMap!postcss-loader!sass-loader?sourceMap') }
            ]
        },
        plugins: [
            new WebpackMd5Hash(),
            new ExtractTextPlugin('[name].[contenthash].css'),
            new webpack.optimize.UglifyJsPlugin({ sourceMap: true }),
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false,
                noInfo: true, // set to false to see a list of every file being bundled.
                options: {
                    sassLoader: {
                        includePaths: [stylesPaths]
                    },
                    // context: '/',
                    postcss: () => [autoprefixer],
                }
            })
        ]
    });

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) reject(err);

            const statsJson = stats.toJson();

            if (stats.hasErrors() || stats.hasWarnings()) {
                console.error(statsJson.errors);
                console.warn(statsJson.warnings);
            }
            
            resolve(getJsAndCssFileNames(statsJson.assets));
        });
    });


}

interface Asset {
    name: string
}

interface CompiledFileNames {
    css: string[],
    js: string[]
}

function getJsAndCssFileNames(assets: Asset[]): CompiledFileNames {
    return assets.reduce((result, asset) => {
        if (asset.name.endsWith('.js')) {
            result.js.push(asset.name);
        }

        if (asset.name.endsWith('.css')) {
            result.css.push(asset.name);
        }

        return result;

    }, { js: [], css: [] });
}
