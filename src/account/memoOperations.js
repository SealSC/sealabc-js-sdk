import {ApiClient} from "../network/apiClient";
import {OperationBase} from "./operationBase";
import {memoService} from "../services/application/memoService";

class MemoOperations extends OperationBase {
  constructor(signer = null, apiClient = null) {
    super(signer)
    this.apiClient = apiClient
  }

  setApiClient(apiClient) {
    if(!(apiClient instanceof ApiClient)) {
      throw new Error("invalid parameter, we need ApiClient to send query request.")
    }

    this.apiClient = apiClient
  }

  async recordMemo(memoType, memoString) {
    if("string" !== typeof memoType || "string" !== typeof memoString) {
      throw new Error("invalid param")
    }

    let newMemo = new memoService.dataTypes.Memo(memoType, memoString)
    let memoReq = memoService.requests.newMemoRecord(newMemo, this.cryptoTools())

    return await this.apiClient.callApplication(memoReq.toJSON())
  }
}

export {
  MemoOperations
}
