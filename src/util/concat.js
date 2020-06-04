function concatUint8Array(...arr) {
  let totalLen = 0
  arr.forEach(u8a => {
    totalLen += u8a.length
  })

  let ret = new Uint8Array(totalLen)

  let offset = 0
  arr.forEach(u8a => {
    ret.set(u8a, offset)
    offset += u8a.length
  })

  return ret
}

export {
  concatUint8Array
}
