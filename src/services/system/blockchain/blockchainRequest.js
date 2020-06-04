import {
  stringToUint8Array,
  uint32ToBigEndianUint8Array
} from "../../../util/converter"

import {concatUint8Array} from "../../../util/concat"
import {Seal} from "../../common/seal";
import {wrapUint8Array} from "../../../util/wrapper";

function BlockchainRequest() {
  this.requestApplication = ""
  this.requestAction = ""
  this.sequenceNumber = 0
  this.data = wrapUint8Array(new Uint8Array(0))

  this.seal = null

  let getDataForSeal = () => {
    let reqSrvBytes = stringToUint8Array(this.requestApplication)
    let reqSrvLenBytes = uint32ToBigEndianUint8Array(reqSrvBytes.length)

    let reqActBytes = stringToUint8Array(this.requestAction)
    let reqActLenBytes = uint32ToBigEndianUint8Array(reqActBytes.length)

    let seqNumLenBytes = uint32ToBigEndianUint8Array(4)
    let seqNumBytes = uint32ToBigEndianUint8Array(this.sequenceNumber)

    let dataLenBytes = uint32ToBigEndianUint8Array(this.data.u8Array.length)
    let dataBytes = this.data.u8Array

    return concatUint8Array(
      reqSrvLenBytes,
      reqSrvBytes,

      reqActLenBytes,
      reqActBytes,

      seqNumLenBytes,
      seqNumBytes,

      dataLenBytes,
      dataBytes
    )
  }

  this.toJSON = ()=> {
    return JSON.stringify({
      RequestApplication: this.requestApplication,
      RequestAction: this.requestAction,
      SequenceNumber: this.sequenceNumber,
      Data: this.data.base64,
      Seal: this.seal.getDataInBase64(),
    })
  }

  this.sign = function (cryptoTools) {
    let blkData = getDataForSeal()
    let blkHash = cryptoTools.hash.sum256(blkData)
    let sig = cryptoTools.signer.sign(blkHash.u8Array)

    this.seal = new Seal(blkHash, sig, cryptoTools.signer.getPublicKey())
    return this
  }
}

function newBlockchainRequest(appName, action, data, tools) {
  let newReq = new BlockchainRequest()

  newReq.requestApplication = appName
  newReq.requestAction = action

  newReq.data = data

  newReq.sign(tools)
  return newReq
}

export {
  BlockchainRequest,
  newBlockchainRequest,
}
