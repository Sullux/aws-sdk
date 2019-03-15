const low = input =>
  input && `${input[0].toLowerCase()}${input.substring(1)}`

const isCap = char =>
  char === char.toUpperCase()

const isConstructor = (input, name) =>
  (typeof input === 'function') && isCap(name[0])

const getAllKeys = input => ([
  ...Object.keys(input),
  ...Object.keys(Object.getPrototypeOf(input)),
])

const valueOf = (source, name) => {
  const value = source[name]
  return typeof value === 'function'
    ? (...args) => {
      const result = source[name](...args)
      return result && result.promise && (typeof result.promise === 'function')
        ? result.promise().catch(err => Promise.reject(new Error(err.message)))
        : result
    }
    : value
}

const createObjectFrom = (config, source) => {

  const createGetter = (name) => {
    let instance // eslint-disable-line no-restricted-syntax
    const createInstance = () =>
      (instance = Object.freeze({ // eslint-disable-line no-restricted-syntax
        ...createObjectFrom(config, source[name]),
        ...createObjectFrom(config, new source[name](config)),
      }))
    return isConstructor(source[name], name)
      ? {
          [low(name)]: {
            enumerable: true,
            get: () => instance || createInstance(),
          },
        }
      : {
          [name]: {
            enumerable: true,
            value: valueOf(source, name),
          },
        }
  }

  return Object.freeze(
    Object.defineProperties(
      {},
      getAllKeys(source).reduce(
        (properties, key) => ({ ...properties, ...createGetter(key) }),
        {},
      )
    )
  )
}

const aws = (config = {}) =>
  createObjectFrom(config, require('aws-sdk'))

module.exports = aws
