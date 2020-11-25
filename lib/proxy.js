/* eslint-disable no-restricted-syntax */
const { deepStrictEqual } = require('assert')
const { inspect } = require('util')
const { custom } = inspect

function Null() {
  if (new.target) {
    this[Symbol.toPrimitave] = () => null
    this.toString = () => 'null'
    this.valueOf = () => null
    this[custom] = () => '[Null]'
    return this
  }
  return null
}
Object.defineProperty(
  Null.prototype,
  Symbol.toStringTag,
  { value: 'Null', writable: false }
)

function Undefined() {
  if (new.target) {
    this[Symbol.toPrimitave] = () => undefined
    this.toString = () => 'undefined'
    this.valueOf = () => undefined
    this[custom] = () => '\x1B[38;5;240m[Undefined]\x1B[39m'
    return this
  }
}
Object.defineProperty(
  Undefined.prototype,
  Symbol.toStringTag,
  { value: 'Undefined', writable: false }
)

const undefinedInstance = new Undefined()
const nullInstance = new Null()

const safeObject = object =>
  (object === undefined
    ? undefinedInstance
    : object === null
      ? nullInstance
      : object)

const prototypeChainIterable = function* (prototype) {
  if (!prototype) {
    return
  }
  yield prototype
  yield* prototypeChainIterable(Object.getPrototypeOf(prototype))
}

const prototypeChain = object =>
  [...prototypeChainIterable(Object.getPrototypeOf(safeObject(object)))]

const factoryOf = object =>
  safeObject(object).constructor

const exceptLast = array =>
  array.slice(0, array.length - 1)

const withConstructors = prototypes =>
  prototypes.reduce(
    (result, prototype) => ([...result, prototype, factoryOf(prototype)]),
    [],
  )

const allProperties = object =>
  ([object, ...withConstructors(exceptLast(prototypeChain(object)))])
    .reduce(
      (props, o) => ({ ...props, ...Object.getOwnPropertyDescriptors(o) }),
      {},
    )

const low = input =>
  input && `${input[0].toLowerCase()}${input.substring(1)}`

const isCap = char =>
  char === char.toUpperCase()

const isConstructor = (input, name) =>
  (typeof input === 'function') && isCap(name[0]) && (!name.includes('_'))

const mergeObjects = (o1, o2) =>
  Object.defineProperties(
    {},
    {
      ...Object.getOwnPropertyDescriptors(o1),
      ...Object.getOwnPropertyDescriptors(o2),
    }
  )

const constructorFor = (target, name, config, targetName) => {
  let cached
  const construct = () => {
    const newTarget = target[name]
    const newTargetName = [targetName, name].join('.')
    cached = mergeObjects(
      proxy(new newTarget(config), config, newTargetName),
      proxy(newTarget, config, newTargetName),
    )
    return cached
  }
  return () => cached || construct()
}

const functionFor = (target, name, targetName) =>
  () => {
    const fn = (...args) => {
      const rethrow = (error) => {
        const message = `Error calling ${targetName}.${name}: ${error.message}`
        const better = new Error(message)
        better.code = error.code
        better.arguments = args
        throw better
      }
      try {
        const result = target[name](...args)
        return result.promise
          ? result.promise().catch(rethrow)
          : result
      } catch (err) {
        return rethrow(err)
      }
    }
    fn.raw = (...args) => {
      const rethrow = (error) => {
        const message = `Error calling ${targetName}.${name}: ${error.message}`
        const better = new Error(message)
        better.code = error.code
        better.arguments = args
        throw better
      }
      try {
        const result = target[name](...args)
        return result
      } catch (err) {
        return rethrow(err)
      }
    }
    return fn
  }

const memoizeCache = []
const areDeepStrictEqual = (v1, v2) => {
  try {
    deepStrictEqual(v1, v2)
    return true
  } catch (err) {
    return false
  }
}
const memoize = fn =>
  (...args) => {
    const existing = memoizeCache.find(([key]) => areDeepStrictEqual(key, args))
    if (existing) {
      return existing[1]
    }
    const result = fn(...args)
    memoizeCache.push([args, result])
    return result
  }

const proxy = (target, config, targetName = 'AWS') =>
  Object.defineProperties(
    {},
    Object.entries(allProperties(target))
      .map(([name, { value }]) => ({
        name,
        value,
        type: isConstructor(value, name)
          ? 'constructor'
          : typeof value,
      }))
      .map(({ name, value, type }) => ({
        name,
        type,
        proxyName: type === 'constructor'
          ? low(name)
          : name,
        get: type === 'constructor'
          ? constructorFor(target, name, config, targetName)
          : type === 'function'
            ? functionFor(target, name, targetName)
            : () => value,
      }))
      .reduce(
        (result, { proxyName, get }) =>
          ({ ...result, [proxyName]: { enumerable: true, get } }),
        {},
      ))

module.exports = {
  proxy: memoize(proxy),
}
