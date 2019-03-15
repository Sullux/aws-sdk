const { join } = require('path')

module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
    path: join(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  target: 'node',
}
