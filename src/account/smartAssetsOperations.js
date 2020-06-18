import {OperationBase} from "./operationBase";
import {smartAssets} from "../services/application/smartAssets";
import {smartAssetsAppName} from "../services/application/smartAssets/requests/common";

class SmartAssetsOperations extends OperationBase {
  constructor(signer = null, apiClient = null) {
    super(signer)
    this.apiClient = apiClient
  }

  async transferTo(to, amount, memo = '') {
    let from = this.hexAddress()
    let req =  smartAssets.requests.newTransferRequest(this.cryptoTools(), from, to, amount, memo)

    return await this.apiClient.callApplication(req.toJSON())
  }

  async createContract(data, value = '0', memo = '') {
    let creator = this.hexAddress()
    let req = smartAssets.requests.newContractCreationRequest(this.cryptoTools(), creator, value, data, memo)

    return await this.apiClient.callApplication(req.toJSON())
  }

  async callContract(contract, data, value = '0', memo = '') {
    let caller = this.hexAddress()
    let req = smartAssets.requests.newContractCallRequest(this.cryptoTools(), caller, contract, value, data, memo)

    return await this.apiClient.callApplication(req.toJSON())
  }

  async callContractOffChain(contract, data) {
    let caller = this.hexAddress()
    let req = smartAssets.requests.newContractOffChainCall(caller, contract, data)
   return await this. apiClient.queryApplication(smartAssetsAppName, req)
  }
}

export {
  SmartAssetsOperations
}
