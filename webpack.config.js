var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
	context: __dirname,
	devtool: 'eval',
	entry: [
		'webpack-hot-middleware/client',
		'./public/src/index.jsx'
	],
	output: {
		path: path.join(__dirname, 'public/dist'),
		filename: 'index.js',
		publicPath: '/dist/'
	},
	resolve: {
		extensions: ['', '.jsx', '.scss', '.js', '.json']
	},
	resolveLoader: { root: path.join(__dirname, "node_modules") },
	module: {
		loaders: [
			{
				test: /(\.js|\.jsx)$/,
				exclude: /(node_modules)/,
				loader: 'babel',
				query: {
					presets: ['es2015','stage-0', 'react']
				}
			}, {
				test: /(\.scss|\.css)$/,
				loader: ExtractTextPlugin.extract('style', 'css?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass?sourceMap')
			}
		]
	},
	postcss: [autoprefixer],
	plugins: [
		new ExtractTextPlugin('main.css', { allChunks: true }),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
		new webpack.DefinePlugin({
	    	'process.env.NODE_ENV': JSON.stringify('development'),
	    	VERSION: '1.0.0'
	    })
	]
}