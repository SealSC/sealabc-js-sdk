import {
  stringToUint8Array,
  uint32ToBigEndianUint8Array
} from "../../../util/converter"

import {concatUint8Array} from "../../../util/concat"
import {Seal} from "../../common/seal";
import {wrapUint8Array} from "../../../util/wrapper";

function Memo(memoType, memoString) {
  this.type = memoType
  this.data = memoString

  this.seal = null

  let getDataForSeal = () => {

    let typeBytes = stringToUint8Array(this.type)
    let typeLenBytes = uint32ToBigEndianUint8Array(typeBytes.length)

    let memoBytes = stringToUint8Array(this.data)
    let memoLenBytes = uint32ToBigEndianUint8Array(memoBytes.length)

    return concatUint8Array(
      typeLenBytes,
      typeBytes,

      memoLenBytes,
      memoBytes,
    )
  }

  this.toJSON = ()=> {
    return JSON.stringify({
      Type: this.type,
      Data: this.data,
      Seal: this.seal.getDataInBase64(),
    })
  }

  this.toRequestData = () => {
    let jsonString = this.toJSON()
    let strU8 = stringToUint8Array(jsonString)
    return wrapUint8Array(strU8)
  }

  this.sign = function (cryptoTools) {
    let data = getDataForSeal()
    let hash = cryptoTools.hash.sum256(data)
    let sig = cryptoTools.signer.sign(hash.u8Array)

    this.seal = new Seal(hash, sig, cryptoTools.signer.getPublicKey())
    return this.seal
  }
}

export {
  Memo
}
