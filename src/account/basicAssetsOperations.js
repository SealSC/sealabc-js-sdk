import {
  autoConvertToBase64, base64ToHex, hexToBase64, stringToBase64,
} from "../util/converter";

import {Seal} from "../services/common/seal";
import {basicAssets} from "../services/application/basicAssets";
import {basicAssetsAppName} from "../services/application/basicAssets/requests/common/common";
import BN from "bn.js"
import {OperationBase} from "./operationBase";

function buildTransferInOut(receiver, amount, utxoList) {
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
      let newInput = new basicAssets.dataTypes.UTXOInput(utxo.Transaction, utxo.OutputIndex)
      input.push(newInput)

      if(nextAcc.gt(amountBN)) {
        let changeVal = nextAcc.sub(amountBN)

        change = new basicAssets.dataTypes.UTXOOutput(this.address(), changeVal.toString(10))
        output.push(change)

        amountAcc = nextAcc
      }

      break
    } else {
      let newInput = new basicAssets.dataTypes.UTXOInput(utxo.Transaction, utxo.OutputIndex)
      input.push(newInput)

      let newOutput = new basicAssets.dataTypes.UTXOOutput(receiver, uv.toString(10))
      output.push(newOutput)

      amountAcc = nextAcc
    }
  }

  return {
    in: input,
    out: output,
  }
}

async function doAssetIssue(assets, memo) {
  let tools = this.cryptoTools()
  assets.sign(tools)
  let issueReq = basicAssets.requests.newIssueAssetsRequest(assets, tools, memo)
  return this.apiClient.callApplication(issueReq.toJSON())
}

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

  async getAllAssets() {
    if(!this.apiClient) {
      return
    }

    let queryData = basicAssets.requests.newQueryAllAssets()

    let result = await this.apiClient.queryApplication(basicAssetsAppName, queryData)
    if(result.success) {
      return result.data.List
    } else {
      return []
    }
  }

  async getSellingList() {
    if(!this.apiClient) {
      return
    }

    let queryData = basicAssets.requests.newQuerySellingList()

    let result = await this.apiClient.queryApplication(basicAssetsAppName, queryData)
    if(result.success) {
      return result.data || []
    } else {
      return []
    }
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

    return await doAssetIssue.call(this, assets, memo)
  }

  async confirmCopyright(name, symbol, extraData = "", memo = "") {
    if(!this.apiClient) {
      return
    }

    let assets = basicAssets.dataTypes.buildCopyright(
      name,
      symbol,
      extraData,
    )

    return await doAssetIssue.call(this, assets, memo)
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

    let inout = buildTransferInOut.call(this, receiver, amount, assets.UnspentList)

    let assetsObj = new basicAssets.dataTypes.Assets()
    assetsObj.setSeal(Seal.fromPlainObject(assets.Assets.IssuedSeal), Seal.fromPlainObject(assets.Assets.MetaSeal))
    let transferReq = basicAssets.requests.newTransferRequest(assetsObj, inout.in, inout.out, this.cryptoTools(), memo)
    return await this.apiClient.callApplication(transferReq.toJSON())
  }

  async startSelling(sellingAssets, paymentAssets, price, memo = "", amount = "1") {
    if(!this.apiClient) {
      return
    }

    if("string" !== typeof price) {
      throw new Error("price must be a number string")
    }

    if("string" !== typeof amount) {
      throw new Error("amount must be a number string")
    }

    let assetsB64 = autoConvertToBase64(sellingAssets)
    let assets = this.assetsList[assetsB64]
    if(!assets) {
      throw new Error("you did not have that assets: " + assets)
    }

    let utxoList = assets.UnspentList
    if(utxoList.length !== 1) {
      throw new Error("only support single assets")
    }

    let input = new basicAssets.dataTypes.UTXOInput(
      utxoList[0].Transaction, "0",
    )

    let sellingData = basicAssets.dataTypes.buildSellingData(
      price,
      this.hexAddress(),
      sellingAssets,
      paymentAssets,
    )

    let assetsForSelling = new basicAssets.dataTypes.Assets()
    assetsForSelling.fromPlainObject(assets.Assets)
    let req = basicAssets.requests.newStartSellingRequest(
      assetsForSelling,
      [input],
      this.cryptoTools(),
      sellingData,
      memo)
    return await this.apiClient.callApplication(req.toJSON())
  }

  async getSellingDataByTx(sellingTx) {
    let sellingList = await this.getSellingList()

    if(sellingList.length === 0) {
      throw new Error("no selling assets in market")
    }

    let sellingTxB64 = hexToBase64(sellingTx)
    let sellingData = null
    for(let i=0; i<sellingList.length; i++) {
      if(sellingList[i].Transaction === sellingTxB64) {
        sellingData = sellingList[i]
        break
      }
    }

    if(sellingData === null) {
      throw new Error("no such selling")
    }

    return sellingData
  }

  async stopSelling(sellingTx, memo = "") {
    if(!this.apiClient) {
      return
    }

    let sellingData = await this.getSellingDataByTx(sellingTx)
    let req = basicAssets.requests.newStopSellingRequest(JSON.stringify(sellingData), this.cryptoTools(), memo)

    return await this.apiClient.callApplication(req.toJSON())
  }

  async buyAssets(sellingTx, memo = "") {
    if(!this.apiClient) {
      return
    }

    let sellingData = await this.getSellingDataByTx(sellingTx)

    let assets = this.assetsList[sellingData.PaymentAssets]
    if(!assets) {
      throw new Error("you did not have assets: " + assets + " to pay")
    }

    let inout = buildTransferInOut.call(this, sellingData.Seller, sellingData.Price + "", assets.UnspentList)

    inout.in.push(
      new basicAssets.dataTypes.UTXOInput(
       sellingData.Transaction,
        "0"
      )
    )


    let buyAssets = new basicAssets.dataTypes.Assets()
    buyAssets.fromPlainObject(assets.Assets)
    let req = basicAssets.requests.newBuyAssetsRequest(buyAssets, inout.in, inout.out, this.cryptoTools(), memo)

    return await this.apiClient.callApplication(req.toJSON())
  }
}

export {
  BasicAssetsOperations
}
