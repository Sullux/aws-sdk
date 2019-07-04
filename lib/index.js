const AWS = require('aws-sdk')
const { proxy } = require('./proxy')

const aws = (config) =>
  proxy(AWS, config)

module.exports = aws
