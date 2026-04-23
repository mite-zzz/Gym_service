const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function createBaseConfig({ name, port, htmlTemplate }) {
  return {
    mode: 'development',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    output: {
      publicPath: `http://localhost:${port}/`,
      clean: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: htmlTemplate || './public/index.html',
        title: `Gym App — ${name}`,
      }),
    ],
    devServer: {
      port,
      historyApiFallback: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
    },
  };
};
