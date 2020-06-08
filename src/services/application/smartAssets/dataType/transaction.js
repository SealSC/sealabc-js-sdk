//
// type Transaction struct {
//   TransactionData
//   TransactionResult
//
//   DataSeal   seal.Entity
// }

import {TransactionData} from "./transactionData";
import {Seal} from "../../../common/seal";
import {stringToUint8Array} from "../../../../util/converter";
import {wrapUint8Array} from "../../../../util/wrapper";

function Transaction(txData) {
  this.data = txData
  this.seal = null

  this.toJSON = ()=> {
    let obj = {}
    if(this.seal !== null) {
      obj = {
        DataSeal: this.seal.getDataInBase64()
      }
    }
    obj = Object.assign(obj, this.data.toPlainObject())
    return JSON.stringify(obj)
  }

  this.toRequestData = () => {
    let jsonString = this.toJSON()
    let strU8 = stringToUint8Array(jsonString)
    return wrapUint8Array(strU8)
  }

  this.sign = function (cryptoTools) {
    let txData = this.data.getDataForSeal()
    let txHash = cryptoTools.hash.sum256(txData)
    let sig = cryptoTools.signer.sign(txHash.u8Array)

    this.seal = new Seal(txHash, sig, cryptoTools.signer.getPublicKey())
    return this.seal
  }
}

export {
  Transaction
}
