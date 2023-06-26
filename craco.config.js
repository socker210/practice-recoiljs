const TsconfigPathsPlugins = require('tsconfig-paths-webpack-plugin')

module.exports = {
	configure: (webpackConfig) => {
		webpackConfig.resolve.plugins.push(new TsconfigPathsPlugins())

		return webpackConfig
	},
}
