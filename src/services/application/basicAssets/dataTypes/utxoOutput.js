import {
  stringToUint8Array,
  uint32ToBigEndianUint8Array
} from "../../../../util/converter"

import {concatUint8Array} from "../../../../util/concat"

function UTXOOutput(to, val) {
  this.to = to
  this.value = val

  this.getDataForSeal = ()=> {
    let toBytes = stringToUint8Array(this.to)
    let toLenBytes = uint32ToBigEndianUint8Array(toBytes.length)

    let valueBytes = stringToUint8Array(this.value)
    let valueLenBytes = uint32ToBigEndianUint8Array(valueBytes.length)

    return concatUint8Array(
      toLenBytes,
      toBytes,

      valueLenBytes,
      valueBytes,
    )
  }

  this.getPlainObject = ()=>{
    return {
      To: this.to,
      Value: this.value,
    }
  }
}

export {
  UTXOOutput
}
