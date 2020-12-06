import {
  stringToUint8Array,
  uint32ToBigEndianUint8Array
} from "../../../util/converter"

import {concatUint8Array} from "../../../util/concat"
import {Seal} from "../../common/seal";
import {wrapUint8Array} from "../../../util/wrapper";
import {randomHex} from "../../../crypto/tools";

function TSData(namespace, cryptoTools) {
  this.namespace = namespace
  this.externalID = ""
  this.rawData = ""
  this.completeKey = randomHex()

  this.onChainID = ""
  this.prevOnChainID = ""
  this.nextOnChainID = ""

  this.seal = null
  this.prevSeal = null
  this.completeSeal = null

  this.cryptoTools = cryptoTools

  let getDataForSeal = () => {
    let namespaceBytes = stringToUint8Array(this.namespace)
    let externalIDBytes = stringToUint8Array(this.externalID)
    let rawDataBytes = stringToUint8Array(this.rawData)
    let completeKeyBytes = stringToUint8Array(this.completeKey)

    return concatUint8Array(
      namespaceBytes,
      externalIDBytes,
      rawDataBytes,
      completeKeyBytes,
    )
  }

  let getDataForModifySeal = () => {
    let sealBytes = getDataForSeal()
    let sigBytes = this.seal.getDataForSign()
    return concatUint8Array(
      sealBytes,
      sigBytes
    )
  }

  let calcOnChainID = ()=>{
    let sealBytes = getDataForSeal()
    return this.cryptoTools.hash.sum256(sealBytes).hex
  }

  this.toJSON = ()=> {
    return JSON.stringify(this.toPlainObject())
  }

  this.toPlainObject = ()=> {
    this.onChainID = calcOnChainID()

    return {
      Namespace: this.namespace,
      ExternalID: this.externalID,
      RawData: this.rawData,
      CompleteKey: this.completeKey,
      OnChainID: this.onChainID,
      PrevOnChainID: this.prevOnChainID,
      Seal: this.seal.getDataInBase64(),
      PrevSeal: this.prevSeal ? this.prevSeal.getDataInBase64() : null,
    }
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

  this.signModifyData = (tools) => {
    let data = getDataForModifySeal()
    let hash = tools.hash.sum256(data)
    let sig = tools.signer.sign(hash.u8Array)

    this.prevSeal = new Seal(hash, sig, tools.signer.getPublicKey())
    return this.prevSeal
  }
}

function TSServiceRequest() {
  this.reqType = ""
  this.data = null

  this.toJSON = ()=> {
    return JSON.stringify({
      ReqType: this.reqType,
      Data: this.data.toPlainObject(),
    })
  }

  this.toRequestData = () => {
    let jsonString = this.toJSON()
    let strU8 = stringToUint8Array(jsonString)
    return wrapUint8Array(strU8)
  }
}

export {
  TSData,
  TSServiceRequest,
}
