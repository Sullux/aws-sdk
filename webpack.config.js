const { join } = require('path')

module.exports = {
  mode: 'production',
  entry: './index.js',
  externals: 'aws-sdk',
  output: {
    path: join(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  target: 'node',
}
