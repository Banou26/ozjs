export const UUID = a => a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, UUID)

export const isObject = item => item && typeof item === 'object' && !Array.isArray(item)

// todo add more of the built-in objects, some of them are in https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
export const builtInObjects = new Map([
  [URL, url => new URL(url.href)],
  [URLSearchParams, urlSearchparams => new URLSearchParams(urlSearchparams.toString())],
  [RegExp, regexp => new RegExp(regexp.source, regexp.flags)],
  [Map, map => new Map(cloneObject([...map]))],
  [WeakMap, weakMap => new WeakMap()],
  [Set, set => new Set(cloneObject([...set]))],
  [WeakSet, weakSet => new WeakSet()]
])

export const isBuiltIn = obj => {
  for (const pair of builtInObjects) {
    if (obj instanceof pair[0]) return pair
  }
}

export function cloneObject (original, refs = new Map()) {
  if (refs.has(original)) return refs.get(original)
  if (!original || typeof original !== 'object') throw new TypeError(`Oz cloneObject: first argument has to be typeof 'object' & non null, typeof was '${typeof original}'`)
  const builtInPair = isBuiltIn(original)
  if (builtInPair) return builtInPair[1](original)
  let object = Array.isArray(original) ? [...original] : Object.create(Object.getPrototypeOf(original))
  refs.set(original, object)
  for (const [prop, desc] of Object.entries(Object.getOwnPropertyDescriptors(original))) {
    let {value, ...rest} = desc
    Object.defineProperty(object, prop, {...rest, ...value !== undefined && {value: value && typeof value === 'object' ? cloneObject(value, refs) : value}})
  }
  return object
}
window.cloneObject = cloneObject

export const getPropertyDescriptorPair = (prototype, property) => {
  let descriptor = Object.getOwnPropertyDescriptor(prototype, property)
  while (!descriptor) {
    prototype = Object.getPrototypeOf(prototype)
    if (!prototype) return
    descriptor = Object.getOwnPropertyDescriptor(prototype, property)
  }
  return {prototype, descriptor}
}

export const getPropertyDescriptor = (object, property) => {
  const result = getPropertyDescriptorPair(object, property)
  return result ? result.descriptor : null
}
export const getPropertyDescriptorPrototype = (object, property) => {
  const result = getPropertyDescriptorPair(object, property)
  return result ? result.prototype : null
}
