const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const timestamp = new Date();

module.exports = {
  transpileDependencies: [
    'vuetify',
  ],
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __BUILD_TIMESTAMP__: '"' + timestamp.getTime() + '"',
        __BUILD_DATE__: '"' + timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString() + '"',
      }),
      new HtmlWebpackPlugin({  // Also generate a test.html
        filename: 'version.html',
        template: 'public/version.html',
        inject: false,
      }),
    ],
  },
};
