const { strictEqual, notStrictEqual } = require('assert')
const AWS = require('aws-sdk')

const aws = require('./')

describe('aws-sdk', () => {
  it('should preserve static fields', () =>
    strictEqual(aws().VERSION, AWS.VERSION))
  it('should provide instances of constructors', () =>
    strictEqual(typeof aws().dynamoDB.createTable, 'function'))
  it('should provide instances of nested constructors', () =>
    strictEqual(typeof aws().dynamoDB.documentClient.get, 'function'))
  it('should provide the s3.upload function', () =>
    strictEqual(typeof aws().s3.upload, 'function'))
  it('should create separate sdk instances', () => {
    const firstSdk = aws({ region: 'us-east-1' })
    const secondSdk = aws({ region: 'us-east-2' })
    notStrictEqual(firstSdk, secondSdk)
  }).timeout(10000)
  it('should memoize the sdk', () => {
    const firstSdk = aws({ region: 'us-west-2' })
    const secondSdk = aws({ region: 'us-west-2' })
    strictEqual(firstSdk, secondSdk)
  }).timeout(10000)
  it('should give access to the raw function result', () =>
    strictEqual(typeof aws().dynamoDB.createTable.raw, 'function'))
})
