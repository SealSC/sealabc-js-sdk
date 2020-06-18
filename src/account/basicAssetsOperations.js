import {
  autoConvertToBase64,
} from "../util/converter";

import {Seal} from "../services/common/seal";
import {basicAssets} from "../services/application/basicAssets";
import {basicAssetsAppName} from "../services/application/basicAssets/requests/common/common";
import BN from "bn.js"
import {OperationBase} from "./operationBase";

class BasicAssetsOperations extends OperationBase {
  constructor(signer = null, apiClient = null) {
    super(signer)
    this.apiClient = apiClient
    this.assetsList = null
  }

  async loadBasicAssets() {
    if(!this.apiClient) {
      return
    }

    let queryData = basicAssets.requests.newQueryUnspent(this.signer.keyPair.publicKey)

    let result = await this.apiClient.queryApplication(basicAssetsAppName, queryData)
    if(result.success) {
      this.assetsList = result.data.List
    }

    return result
  }

  setBasicAssetsList(assetsList) {
    this.assetsList = assetsList
  }

  async issueAssets(name, symbol, supply, increasable = false, memo = "") {
    if(!this.apiClient) {
      return
    }

    supply = new BN(supply)
    let assets = basicAssets.dataTypes.buildAssets(
      name,
      symbol,
      supply.toString(10),
      increasable,
    )

    let tools = this.cryptoTools()
    assets.sign(tools)
    let issueReq = basicAssets.requests.newIssueAssetsRequest(assets, tools, memo)
    return await this.apiClient.callApplication(issueReq.toJSON())

  }

  async transferTo(receiver, assetsHash, amount, memo = "") {
    if(!this.apiClient) {
      return
    }

    if("string" !== typeof amount) {
      throw new Error("amount must be a string")
    }

    receiver = autoConvertToBase64(receiver)

    let assetsB64 = autoConvertToBase64(assetsHash)
    let assets = this.assetsList[assetsB64]
    if(!assets) {
      throw new Error("you did not have that assets: " + assets)
    }

    let utxoList = assets.UnspentList

    let input = []
    let output = []
    let change = null
    let amountAcc = new BN(0)
    let amountBN = new BN(amount)

    for(let i=0; i<utxoList.length; i++) {
      let utxo = utxoList[i]
      let uv = new BN(utxo.Value)

      let nextAcc = amountAcc.add(uv)
      let stillNeed = amountBN.sub(amountAcc)

      if(nextAcc.gte(amountBN)) {
        let newOut = new basicAssets.dataTypes.UTXOOutput(receiver, stillNeed.toString(10))
        output.push(newOut)

        if(nextAcc.gt(amountBN)) {
          let changeVal = nextAcc.sub(amountBN)

          let newInput = new basicAssets.dataTypes.UTXOInput(utxo.Transaction, utxo.OutputIndex)
          input.push(newInput)

          change = new basicAssets.dataTypes.UTXOOutput(this.address(), changeVal.toString(10))
          output.push(change)

          amountAcc = nextAcc
        }

        break
      } else {
        let newInput = new basicAssets.dataTypes.UTXOInput(utxo.Transaction, utxo.OutputIndex)
        input.push(newInput)

        let newOutput = new basicAssets.dataTypes.UTXOOutput(receiver, stillNeed.toString(10))
        output.push(newOutput)

        amountAcc = nextAcc
      }
    }

    let assetsObj = new basicAssets.dataTypes.Assets()
    assetsObj.setSeal(Seal.fromPlainObject(assets.Assets.IssuedSeal), Seal.fromPlainObject(assets.Assets.MetaSeal))
    let transferReq = basicAssets.requests.newTransferRequest(assetsObj, input, output, this.cryptoTools(), memo)
    return await this.apiClient.callApplication(transferReq.toJSON())
  }
}

export {
  BasicAssetsOperations
}
