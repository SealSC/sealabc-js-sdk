import {OperationBase} from "./operationBase";
import {tsService} from "../services/application/traceableStorage";

class TraceableStorageOperations extends OperationBase {
  constructor(signer = null, apiClient = null, crypto) {
    super(signer)
    this.apiClient = apiClient
  }

  createTSData(namespace, externalID, rawData) {
    if("string" !== typeof namespace || 
      "string" !== typeof externalID || 
      "string" !== typeof rawData) {
      throw new Error("invalid param")
    }

    let newTSData = new tsService.dataTypes.TSData(namespace, this.cryptoTools())
    newTSData.externalID = externalID
    newTSData.rawData = rawData

    newTSData.sign(this.cryptoTools())

    return newTSData
  }

  createTSModify(namespace, externalID, rawData, prevID) {
    if("string" !== typeof namespace ||
      "string" !== typeof externalID ||
      "string" !== typeof rawData ||
      "string" !== typeof prevID) {
      throw new Error("invalid param")
    }

    let newTSData = new tsService.dataTypes.TSData(namespace, this.cryptoTools())
    newTSData.externalID = externalID
    newTSData.rawData = rawData
    newTSData.prevOnChainID = prevID

    newTSData.sign(this.cryptoTools())
    newTSData.signModifyData(this.cryptoTools())

    return newTSData
  }

  async storeData(namespace, externalID, rawData) {
    if("string" !== typeof namespace || "string" !== typeof externalID || "string" !== typeof rawData) {
      throw new Error("invalid param")
    }

    let tsReq = tsService.requests.newTSStore(namespace, externalID, rawData, this.cryptoTools())

    return await this.apiClient.callApplication(tsReq.toJSON())
  }

  async storeDataSigned(tsData) {
    let tsReq = tsService.requests.newTSStoreFromSingedTSData(tsData, this.cryptoTools())
    return await this.apiClient.callApplication(tsReq.toJSON())
  }

  async modifyData(namespace, externalID, rawData, prevID) {
    if("string" !== typeof namespace || "string" !== typeof externalID || "string" !== typeof rawData) {
      throw new Error("invalid param")
    }

    let tsReq = tsService.requests.newTSModify(namespace, externalID, rawData, prevID, this.cryptoTools())

    return await this.apiClient.callApplication(tsReq.toJSON())
  }

  async modifyDataSigned(tsData) {
    let tsReq = tsService.requests.newTSModifyFromSingedTSData(tsData, this.cryptoTools())
    return await this.apiClient.callApplication(tsReq.toJSON())
  }

  async queryData(onChainID) {
    return await this.apiClient.queryApplication(tsService.serviceName, onChainID)
  }
}

export {
  TraceableStorageOperations
}
