import {Assets, blankAssets} from "../../datatypes/assets";
import {CryptoTools} from "../../../../../crypto/tools";
import {newBlockchainRequest} from "../../../../system/blockchain/blockchainRequest";
import {basicAssetsAppName, buildData} from "../common/common";

function newStopSellingRequest(sellingData, tools, txMemo = "") {
  if (!(tools instanceof CryptoTools)) {
    throw new Error("must sppuly a CryptoTools Object")
  }

  let assets = blankAssets(tools)

  let tx = buildData("StopSelling", txMemo, assets, [], [], sellingData)
  tx.sign(tools)

  return newBlockchainRequest(
    basicAssetsAppName,
    tx.txType,
    tx.toRequestData(),
    tools
  )
}

export {
  newStopSellingRequest,
}
