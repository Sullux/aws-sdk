const { join } = require('path')

module.exports = {
  mode: 'development',
  entry: './index.js',
  externals: 'aws-sdk',
  devtool: 'source-map',
  output: {
    path: join(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  target: 'node',
}
