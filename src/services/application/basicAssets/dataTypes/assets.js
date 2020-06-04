import {
  boolToUint8Array,
  stringToUint8Array,
  uint32ToBigEndianUint8Array, uint64ToBigEndianUint8Array
} from "../../../../util/converter"

import {concatUint8Array} from "../../../../util/concat"
import {Seal} from "../../../common/seal";

function Assets() {
  this.name = ""
  this.symbol = ""
  this.supply = "0"
  this.increasable = false

  this.issuedSeal = null
  this.metaSeal = null

  let getDataForSeal = () => {

    let nameBytes = stringToUint8Array(this.name)
    let nameLenBytes = uint32ToBigEndianUint8Array(nameBytes.length)

    let symbolBytes = stringToUint8Array(this.symbol)
    let symbolLenBytes = uint32ToBigEndianUint8Array(symbolBytes.length)

    let supplyBytes = uint64ToBigEndianUint8Array(this.supply)
    let zeroSupplyBytes = uint64ToBigEndianUint8Array(0)
    let supplyLenBytes = uint32ToBigEndianUint8Array(8)

    let increasableBytes = boolToUint8Array(this.increasable)
    let increasableLenBytes = uint32ToBigEndianUint8Array(1)

    let issuedData = concatUint8Array(
      nameLenBytes,
      nameBytes,

      symbolLenBytes,
      symbolBytes,

      supplyLenBytes,
      supplyBytes,

      increasableLenBytes,
      increasableBytes,
    )

    let metaData = concatUint8Array(
      nameLenBytes,
      nameBytes,

      symbolLenBytes,
      symbolBytes,

      supplyLenBytes,
      zeroSupplyBytes,

      increasableLenBytes,
      increasableBytes,
    )

    return {
      issued: issuedData,
      meta: metaData
    }
  }

  this.getDataForSign = () => {
    let sealData = getDataForSeal()

    return concatUint8Array(
      sealData.issued,
      this.issuedSeal.getDataForSign(),
      this.metaSeal.getDataForSign(),
    )
  }

  this.toPlainObject = () => {
    return {
      Name: this.name,
      Symbol: this.symbol,
      Supply: this.supply,
      Increasable: this.increasable,

      IssuedSeal: this.issuedSeal.getDataInBase64(),
      MetaSeal: this.metaSeal.getDataInBase64(),
    }
  }

  this.toJSON = ()=> {
    return JSON.stringify(this.toPlainObject())
  }

  this.setSeal = (issuedSeal, metaSeal) => {
    if (!(issuedSeal instanceof Seal)) {
      throw new Error("parameter [issued] seal must be Seal Object")
    }

    if (!(metaSeal instanceof Seal)) {
      throw new Error("parameter [meta] seal must be Seal Object")
    }

    this.issuedSeal = issuedSeal
    this.metaSeal = metaSeal
  }

  this.sign = function (cryptoTools) {
    let data = getDataForSeal()
    let issuedHash = cryptoTools.hash.sum256(data.issued)
    let metaHash = cryptoTools.hash.sum256(data.meta)

    let issuedSig = cryptoTools.signer.sign(issuedHash.u8Array)
    let metaSig = cryptoTools.signer.sign(metaHash.u8Array)

    this.issuedSeal = new Seal(issuedHash, issuedSig, cryptoTools.signer.getPublicKey())
    this.metaSeal = new Seal(metaHash, metaSig, cryptoTools.signer.getPublicKey())
    return this
  }
}

function buildAssets(name, symbol, supply, increasable) {
  let assets = new Assets()

  assets.name = name
  assets.symbol = symbol
  assets.supply = supply
  assets.increasable = increasable

  return assets
}

export {
  Assets,
  buildAssets
}
