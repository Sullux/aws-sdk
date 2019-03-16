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
  const betterError = error =>
    Promise.reject(new Error(`${name}: ${error.message}`))
  return typeof value === 'function'
    ? (...args) => {
      const result = source[name](...args)
      return result && result.promise && (typeof result.promise === 'function')
        ? result.promise().catch(betterError)
        : result
    }
    : value
}

const createObjectFrom = (config, source) => {

  const createGetter = (name) => {
    /* eslint-disable no-restricted-syntax */
    let instance
    // todo: fix this so that it doesn't iterate to create the instance
    const createInstance = () => {
      let constructed = {}
      try {
        constructed = new source[name](config) 
      } catch (err) {}
      return (instance = Object.freeze({
        ...createObjectFrom(config, source[name]),
        ...createObjectFrom(config, constructed),
      }))
    }
    /* eslint-enable no-restricted-syntax */
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
