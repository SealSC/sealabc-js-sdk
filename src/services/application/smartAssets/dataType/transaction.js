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
  this.seal = new Seal()

  this.toJSON = ()=> {
    let obj = Object.assign({
      DataSeal: this.seal.getDataInBase64()
    }, this.data.toPlainObject())
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
