import {CryptoTools, randomHex} from "../../../crypto/tools";
import {newBlockchainRequest} from "../../system/blockchain/blockchainRequest";
import {stringToUint8Array} from "../../../util/converter";
import {wrapUint8Array} from "../../../util/wrapper";
import {TSData, TSServiceRequest} from "./dataTypes";

function newRequest(act, data, tools) {
  if (!(tools instanceof CryptoTools)) {
    throw new Error("must supply a CryptoTools Object")
  }

  return newBlockchainRequest(
    "Traceable Storage",
    act,
    data,
    tools
  )
}

function newTSQuery(id) {
  let paramU8 = stringToUint8Array(id)
  let reqData = wrapUint8Array(paramU8)

  return reqData.base64
}

function newTSStore(namespace, externalID, rawData, tools) {
  let tsData = new TSData(namespace, tools)
  tsData.externalID = externalID
  tsData.rawData = rawData

  tsData.sign(tools)

  return newTSStoreFromSingedTSData(tsData, tools)
}

function newTSStoreFromSingedTSData(tsData, tools) {
  let req = new TSServiceRequest()
  req.reqType = "Store"
  req.data = tsData
  let reqData = req.toRequestData()
  return newRequest("", reqData, tools)
}

function newTSModify(namespace, externalID, rawData, prevID, tools) {
  let tsData = new TSData(namespace)
  tsData.externalID = externalID
  tsData.rawData = rawData
  tsData.completeKey = randomHex()
  tsData.prevOnChainID = prevID

  let asPrevSeal = tsData.sign(tools)
  tsData.setPrevSeal(asPrevSeal)
  tsData.signModifyData()

  return newTSModifyFromSingedTSData(tsData, tools)
}

function newTSModifyFromSingedTSData(tsData, tools) {
  let req = new TSServiceRequest()
  req.reqType = "Modify"
  req.data = tsData
  let reqData = req.toRequestData()
  return newRequest("", reqData, tools)
}

export {
  newTSQuery,
  newTSStore,
  newTSStoreFromSingedTSData,

  newTSModify,
  newTSModifyFromSingedTSData,
}
