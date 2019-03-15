const { strictEqual } = require('assert')
const AWS = require('aws-sdk')

const aws = require('./')

describe('aws-sdk', () => {
  it('should preserve static fields', () =>
    strictEqual(aws().VERSION, AWS.VERSION))
  it('should provide instances of constructors', () =>
    strictEqual(typeof aws().dynamoDB.createTable, 'function'))
  it('should provide instances of nested constructors', () =>
    strictEqual(typeof aws().dynamoDB.documentClient.get, 'function'))
})
