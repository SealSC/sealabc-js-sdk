import {CryptoTools} from "../../../crypto/tools";
import {newBlockchainRequest} from "../../system/blockchain/blockchainRequest";
import {stringToUint8Array} from "../../../util/converter";
import {wrapUint8Array} from "../../../util/wrapper";
import {Memo} from "./dataTypes";

function newRequest(act, data, tools) {
  if (!(tools instanceof CryptoTools)) {
    throw new Error("must supply a CryptoTools Object")
  }

  return newBlockchainRequest(
    "Memo",
    act,
    data,
    tools
  )
}

function newMemoQuery(key, tools) {
  let paramU8 = stringToUint8Array(key)
  let reqData = wrapUint8Array(paramU8)

  return newRequest("Query", reqData, tools)
}

function newMemoRecord(memo, tools) {
  if(!(memo instanceof Memo)) {
    throw new Error("record must be Memo instance")
  }

  memo.sign(tools)
  let param = memo.toRequestData()
  return newRequest("Record", param, tools)
}


export {
  newMemoQuery,
  newMemoRecord,
}
