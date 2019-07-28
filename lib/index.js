const AWS = require('aws-sdk')
const { proxy } = require('./proxy')

const https = require('https')
const sslAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  rejectUnauthorized: true,
})
sslAgent.setMaxListeners(0)

AWS.config.update({
  httpOptions: {
    agent: sslAgent,
  },
})

const aws = (config) =>
  proxy(AWS, config)

module.exports = aws
