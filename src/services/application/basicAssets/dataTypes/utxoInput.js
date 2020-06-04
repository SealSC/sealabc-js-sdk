import {
  stringToUint8Array,
  uint32ToBigEndianUint8Array
} from "../../../../util/converter"

import {concatUint8Array} from "../../../../util/concat"

function UTXOInput(tx, idx) {
  this.transaction = tx
  this.outputIndex = idx

  this.getDataForSeal = ()=> {
    let txBytes = stringToUint8Array(this.transaction)
    let txLenBytes = uint32ToBigEndianUint8Array(txBytes.length)

    let outputIdxBytes = stringToUint8Array(this.outputIndex)
    let outputIdxLenBytes = uint32ToBigEndianUint8Array(outputIdxBytes.length)

    return concatUint8Array(
      txLenBytes,
      txBytes,

      outputIdxLenBytes,
      outputIdxBytes,
    )
  }

  this.getPlainObject = ()=>{
    return {
      Transaction: this.transaction,
      OutputIndex: this.outputIndex,
    }
  }
}

export {
  UTXOInput
}
