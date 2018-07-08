import { setReactivity, cloning } from '../utils.js'
import proxify from '../proxy.js'

export const type = Array

export default array => {
  const arr = []
  const reactiveArray = proxify(arr)
  setReactivity({target: reactiveArray, original: cloning ? arr : array, object: arr})
  array.forEach((val, i) => (reactiveArray[i] = val))
  return reactiveArray
}
