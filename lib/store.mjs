import v8 from 'v8'

export default function Store(initialState={}) {
  const accessors = {
    get: function(obj, prop) {
      const value = obj[prop]
      if (typeof value !== 'function' &&
          typeof value !== 'symbol' &&
          typeof value !== null) {
        return _structuredClone(value)
      }
    },
    set: function() {
      return false
    }
  }

  return new Proxy(initialState, accessors)
}

function _structuredClone(obj) {
   typeof structuredClone !== 'undefined'
    ? structuredClone(obj)
    : v8.deserialize(v8.serialize(obj))
}