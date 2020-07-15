import {
  base64ToString,
  boolToUint8Array, stringToBase64,
  stringToUint8Array,
  uint32ToBigEndianUint8Array, uint64ToBigEndianUint8Array
} from "../../../../util/converter"

import {concatUint8Array} from "../../../../util/concat"
import {Seal} from "../../../common/seal";
import {wrapUint8Array} from "../../../../util/wrapper";

const GeneralAssets = "0"
const CopyrightAssets = "1"

function Assets() {
  this.name = ""
  this.symbol = ""
  this.supply = "0"
  this.increasable = false
  this.type = ""
  this.extraData = ""

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

    let typeBytes = uint32ToBigEndianUint8Array(this.type)
    let typeLen = uint32ToBigEndianUint8Array(typeBytes.length)

    let increasableBytes = boolToUint8Array(this.increasable)
    let increasableLenBytes = uint32ToBigEndianUint8Array(1)

    let extraData = stringToUint8Array(this.extraData)
    let extraDataLen = uint32ToBigEndianUint8Array(extraData.length)

    let issuedData = concatUint8Array(
      nameLenBytes,
      nameBytes,

      symbolLenBytes,
      symbolBytes,

      supplyLenBytes,
      supplyBytes,

      typeLen,
      typeBytes,

      increasableLenBytes,
      increasableBytes,

      extraDataLen,
      extraData,
    )

    let metaData = concatUint8Array(
      nameLenBytes,
      nameBytes,

      symbolLenBytes,
      symbolBytes,

      supplyLenBytes,
      zeroSupplyBytes,

      typeLen,
      typeBytes,

      increasableLenBytes,
      increasableBytes,

      extraDataLen,
      extraData,
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
    let extraData = stringToUint8Array(this.extraData)
    return {
      Name: this.name,
      Symbol: this.symbol,
      Supply: this.supply,
      Type: this.type,
      Increasable: this.increasable,
      ExtraInfo: wrapUint8Array(extraData).base64,
      IssuedSeal: this.issuedSeal.getDataInBase64(),
      MetaSeal: this.metaSeal.getDataInBase64(),
    }
  }

  this.fromPlainObject = (obj) => {
    this.name = obj.Name
    this.symbol = obj.Symbol
    this.increasable = obj.IncomingMessage
    this.supply = obj.Supply
    this.extraData = base64ToString(obj.ExtraInfo)
    this.issuedSeal = Seal.fromPlainObject(obj.IssuedSeal)
    this.metaSeal = Seal.fromPlainObject(obj.MetaSeal)
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

function buildAssets(name, symbol, supply, increasable, extraData = "") {
  let assets = new Assets()

  assets.name = name
  assets.symbol = symbol
  assets.supply = supply
  assets.type = GeneralAssets
  assets.increasable = increasable
  assets.extraData = extraData

  return assets
}

function buildCopyright(name, symbol, extraData) {
  let assets = new Assets()

  assets.name = name
  assets.symbol = symbol
  assets.supply = "1"
  assets.type = CopyrightAssets
  assets.increasable = false
  assets.extraData = extraData

  return assets
}

function blankAssets(cryptoTools) {
  let assets = new Assets()

  assets.name = ""
  assets.symbol = ""
  assets.supply = "0"
  assets.type = GeneralAssets
  assets.increasable = false
  assets.extraData = ""

  assets.sign(cryptoTools)

  return assets
}

export {
  Assets,
  buildAssets,
  blankAssets,
  buildCopyright,
}
