import {Assets} from "../../datatypes/assets";
import {CryptoTools} from "../../../../../crypto/tools";
import {newBlockchainRequest} from "../../../../system/blockchain/blockchainRequest";
import {basicAssetsAppName, buildData} from "../common/common";

function newStopSellingRequest(assets, inputList, tools, txMemo = "") {
  if (!(assets instanceof Assets)) {
    throw new Error("input must be an Assets Object")
  }

  if (!(tools instanceof CryptoTools)) {
    throw new Error("must sppuly a CryptoTools Object")
  }

  let tx = buildData("StopSelling", txMemo, assets, inputList)
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
