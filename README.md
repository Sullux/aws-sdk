# @sullux/aws-sdk

This library is a wrapper for the woefully inadequate aws-sdk library from Amazon. This wrapper does the following:

* Turns all classes into enumerable properties of the top-level instance,
* Eliminates the need for instantiation of classes,
* Turns all functions into enumerable properties that are properly bound,
* Automatically returns promises from all functions without the need to call the `.promise()` function
* Improves error feedback by including a meaningful stack trace and the name of the sdk function that was called, and
* Wraps the official AWS SDK so that new SDK features will be immediately available without waiting for updates to this wrapper library.

## Installation

To install:

```bash
npm i --save @sullux/aws-sdk
# or
yarn add @sullux/aws-sdk
```

NOTE: this library assumes you have the full AWS SDK already installed. If not, you will need to install it separately with `npm i --save aws-sdk`. If you are planning to deploy to Lambda, you can make the official SDK a _dev_ dependency instead of a primary dependency with `npm i --save-dev aws-sdk`. Either way, your app must be able to `require('aws-sdk')` in order for `require('@sullux/aws-sdk')` to work.

## Usage

Here are some quick usage examples.

```javascript
const aws = require('@sullux/aws-sdk')()

const logBuckets = async () => {
  const buckets = await aws.s3.listBuckets()
  console.log('Buckets:', buckets)
}

const logAllRecords = async (tableName) => {
  const scan = aws.dynamoDB.documentClient.scan
  const records = await scan({ TableName: tableName })
  console.log(tableName, 'Records:', records)
}
```

## How It Works

This library uses a combination of prototype iteration, just-in-time instantiation, and function wrapping to create a thin wrapper around the existing AWS SDK. Following is a before and after code example to help illustrate some of the benefits of this library.

```javascript
// The old way
const AWS = require('aws-sdk')

const documentClient = new AWS.DynamoDB.DocumentClient()

const fixedError = error =>
  Promise.reject(new Error(`put: ${error.message}`))

const saveRecords = async (tableName, records) =>
  await Promise.all(
    records
      .map(record => ({ TableName: tableName, Item: record }))
      .map(params => documentClient.put(params).promise().catch(fixedError))
  )

// The new way
const aws = require('@sullux/aws-sdk')()

const saveRecords = async (tableName, records) =>
  await Promise.all(
    records
      .map(record => ({ TableName: tableName, Item: record }))
      .map(aws.dynamoDB.documentClient.put)
  )
```

The next example shows how configuration is passed down through child properties in the wrapper. In both of the following snippets, the instances are initialized to the `us-west-2` region. Note how much cleaner the wrapper implementation is.

```javascript
// The old way
const AWS = require('aws-sdk')
const dynamoDB = new AWS.DynamoDB({ region: 'us-west-2' })
const s3 = new AWS.S3({ region: 'us-west-2' })

// The new way
const aws = require('@sullux/aws-sdk')({ region: 'us-west-2' })
const { dynamoDB, s3 } = aws
```

## Next Version

The next version of the AWS SDK is in [developer preview](https://aws.amazon.com/blogs/developer/new-aws-sdk-for-javascript-developer-preview/). It can be installed with

```bash
npm install --save @aws-sdk/client-dynamodb-v2-node@preview
```

We will evaluate this new library and see if there are any weeknesses we will need to work around.
