import base64 from "base64-js"
import {wrapUint8Array} from "../../util/wrapper";
import {concatUint8Array} from "../../util/concat";
import {uint32ToBigEndianUint8Array} from "../../util/converter";

class Seal {
  constructor(msgHash, sig, pubKey) {
    this.hash = msgHash
    this.signature = sig
    this.publicKey = pubKey
  }

  static newBlankSeal() {
    return new Seal(
      wrapUint8Array(new Uint8Array(0)),
      wrapUint8Array(new Uint8Array(0)),
      wrapUint8Array(new Uint8Array(0)),
    )
  }

  static fromPlainObject(obj) {
    let msgHash = base64.toByteArray(obj.Hash)
    let sig = base64.toByteArray(obj.Signature)
    let pubKey = base64.toByteArray(obj.SignerPublicKey)

    let newSeal = new Seal()

    newSeal.hash = wrapUint8Array(msgHash)
    newSeal.signature = wrapUint8Array(sig)
    newSeal.publicKey = wrapUint8Array(pubKey)

    return newSeal
  }

  getDataInBase64 (){
    return {
      Hash: this.hash.base64,
      Signature: this.signature.base64,
      SignerPublicKey: this.publicKey.base64,
    }
  }

  getDataForSign() {
    let hashLenBytes = uint32ToBigEndianUint8Array(this.hash.u8Array.length)
    let sigLenBytes = uint32ToBigEndianUint8Array(this.signature.u8Array.length)
    let pubKeyLenBytes = uint32ToBigEndianUint8Array(this.publicKey.u8Array.length)

    return concatUint8Array(
      hashLenBytes,
      this.hash.u8Array,

      sigLenBytes,
      this.signature.u8Array,

      pubKeyLenBytes,
      this.publicKey.u8Array
    )
  }

  matched(message, cryptoTools) {
    let msgHash = cryptoTools.hash.sum(message)
    return cryptoTools.signer.verify(msgHash.u8Array, this.signature.u8Array, this.publicKey.u8Array)
  }
}

export {
  Seal
}
