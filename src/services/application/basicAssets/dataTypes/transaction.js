import {
  stringToBase64,
  stringToUint8Array,
  uint32ToBigEndianUint8Array, uint8ArrayToString
} from "../../../../util/converter"

import {concatUint8Array} from "../../../../util/concat"
import {Seal} from "../../../common/seal";
import {Assets} from "./assets";
import {UTXOInput} from "./utxoInput";
import {UTXOOutput} from "./utxoOutput";
import {wrapUint8Array} from "../../../../util/wrapper";

function Transaction() {
  this.txType = ""
  this.assets = new Assets()
  this.data = ""
  this.extraData = ""

  this.seal = null

  let inputList = []
  let outputLit = []

  function getUTXODataForSeal(dataList) {
    let dataBytesList =[]

    dataList.forEach(d=>{
      let dataBytes = d.getDataForSeal()
      let dataLenBytes = uint32ToBigEndianUint8Array(dataBytes.length)
      dataBytesList.push(
        concatUint8Array(dataLenBytes, dataBytes)
      )
    })

    let allBytes = concatUint8Array(...dataBytesList)
    let allLenBytes = uint32ToBigEndianUint8Array(allBytes.length)

    return concatUint8Array(
      allLenBytes,
      allBytes,
    )
  }

  function getUTXOPlainObject(dataList) {
    let ret = []
    dataList.forEach(d=>{
      ret.push(d.getPlainObject())
    })

    return ret
  }

  let getDataForSeal = () => {
    let txTypeBytes = stringToUint8Array(this.txType)
    let txTypeLenBytes = uint32ToBigEndianUint8Array(txTypeBytes.length)

    let assetsBytes = this.assets.getDataForSign()
    let assetsLenBytes = uint32ToBigEndianUint8Array(assetsBytes.length)

    let memoBytes = stringToUint8Array(this.data)
    let memoLenBytes = uint32ToBigEndianUint8Array(memoBytes.length)

    let inputData = getUTXODataForSeal(inputList)
    let outputData = getUTXODataForSeal(outputLit)

    let extraData = stringToUint8Array(this.extraData)
    let extraDataLen = uint32ToBigEndianUint8Array(extraData.length)

    return concatUint8Array(
      txTypeLenBytes,
      txTypeBytes,

      assetsLenBytes,
      assetsBytes,

      memoLenBytes,
      memoBytes,

      inputData,
      outputData,

      extraDataLen,
      extraData,
    )
  }

  this.addInput = (input) => {
    if (!(input instanceof UTXOInput)) {
      throw new Error("input must be UTXOInput type")
    }

    inputList.push(input)
  }

  this.addOutput = (output) => {
    if (!(output instanceof UTXOOutput)) {
      throw new Error("input must be UTXOOutput type")
    }

    outputLit.push(output)
  }

  this.toJSON = ()=> {
    let extraData = stringToUint8Array(this.extraData)
    return JSON.stringify({
      TxType: this.txType,
      Assets: this.assets.toPlainObject(),
      Memo: this.data,
      Input: getUTXOPlainObject(inputList),
      Output: getUTXOPlainObject(outputLit),
      ExtraData: wrapUint8Array(extraData).base64,
      CreateTime: Math.ceil(Date.now() / 1000),
      Seal: this.seal.getDataInBase64(),
    })
  }

  this.toRequestData = () => {
    let jsonString = this.toJSON()
    let strU8 = stringToUint8Array(jsonString)
    return wrapUint8Array(strU8)
  }

  this.sign = function (cryptoTools) {
    let txData = getDataForSeal()
    let txHash = cryptoTools.hash.sum256(txData)
    let sig = cryptoTools.signer.sign(txHash.u8Array)

    this.seal = new Seal(txHash, sig, cryptoTools.signer.getPublicKey())
    return this.seal
  }
}

export {
  Transaction
}
