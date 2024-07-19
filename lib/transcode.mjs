const map = {}
let place = 0
export function encode(value) {
  if (typeof value == 'string' ) {
    return value
  }
  else if (typeof value == 'number' ) {
    return value
  }
  else if (Array.isArray(value) && value.every(i => typeof i === "string") ) {
    return value.join('')
  }
  else {
    const id = `__b_${place++}`
    map[id] = value
    return id
  }
}

export function decode(value) {
  return value.startsWith('__b_')
    ? map[value]
    : value
}
