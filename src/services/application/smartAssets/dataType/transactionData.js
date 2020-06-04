import {
  hexToBase64,
  hexToUint8Array,
  stringToUint8Array,
  uint32ToBigEndianUint8Array
} from "../../../../util/converter";
import {concatUint8Array} from "../../../../util/concat";

function TransactionData() {
  this.type = ""
  this.from = ""
  this.to = ""
  this.value = ""
  this.data = ""
  this.memo = ""
  this.sn = ""

  this.toPlainObject = () => {
    return {
      Type: this.type,
      From: hexToBase64(this.from),
      To: hexToBase64(this.to),
      Value: this.value,
      Data: hexToBase64(this.data),
      Memo: this.memo,
      SerialNumber: this.sn,
    }
  }

  this.getDataForSeal = () => {
    let typeBytes = stringToUint8Array(this.type)
    let typeLen = uint32ToBigEndianUint8Array(typeBytes.length)

    let fromBytes = hexToUint8Array(this.from)
    let fromLen = uint32ToBigEndianUint8Array(fromBytes.length)

    let toBytes = hexToUint8Array(this.to)
    let toLen =uint32ToBigEndianUint8Array(toBytes.length)

    let valBytes = stringToUint8Array(this.value)
    let valLen = uint32ToBigEndianUint8Array(valBytes.length)

    let dataBytes = hexToUint8Array(this.data)
    let dataLen = uint32ToBigEndianUint8Array(dataBytes.length)

    let memoBytes = stringToUint8Array(this.memo)
    let memoLen = uint32ToBigEndianUint8Array(memoBytes.length)

    let snBytes = stringToUint8Array(this.sn)
    let snLen = uint32ToBigEndianUint8Array(snBytes.length)

    return concatUint8Array(
      typeLen,
      typeBytes,

      fromLen,
      fromBytes,

      toLen,
      toBytes,

      valLen,
      valBytes,

      dataLen,
      dataBytes,

      memoLen,
      memoBytes,

      snLen,
      snBytes,
    )
  }
}

export {
  TransactionData
}
