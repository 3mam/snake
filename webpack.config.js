const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {

	// webpack will take the files from ./src/index
	entry: './src/index',

	//devtool: 'inline-source-map',

	// and output it into /dist as bundle.js
	output: {
		path: path.join(__dirname, '/dist'),
		filename: 'bundle.js'
	},

	// adding .ts and .tsx to resolve.extensions will help babel look for .ts and .tsx files to transpile
	resolve: {
		extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
	},

	module: {
		rules: [{
				// Include ts, tsx, js, and jsx files.
				test: /\.(js|jsx|tsx|ts)$/,
				exclude: /node_modules/,
				loader: ['ts-loader'],
			},
			// All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
			// {
			// 	enforce: "pre",
			// 	test: /\.js$/,
			// 	loader: "source-map-loader"
			// },
			// css-loader to bundle all the css files into one file and style-loader to add all the styles  inside the style tag of the document
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.html$/i,
				loader: 'html-loader',
			},
			{
				test: /\.(png|svg|jpg|gif|txt|glb)$/,
				use: [
					'file-loader',
				],
			},
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html'
		})
	]
};