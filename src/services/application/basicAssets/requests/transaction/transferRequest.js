import {Assets} from "../../datatypes/assets";
import {CryptoTools} from "../../../../../crypto/tools";
import {newBlockchainRequest} from "../../../../system/blockchain/blockchainRequest";
import {basicAssetsAppName, buildData} from "../common/common";

function newTransferRequest(assets, inputList, outputList, tools, txMemo = "") {
  if (!(assets instanceof Assets)) {
    throw new Error("input must be an Assets Object")
  }

  if (!(tools instanceof CryptoTools)) {
    throw new Error("must sppuly a CryptoTools Object")
  }

  let tx = buildData("Transfer", txMemo, assets, inputList, outputList)
  tx.sign(tools)

  return newBlockchainRequest(
    basicAssetsAppName,
    tx.txType,
    tx.toRequestData(),
    tools
  )
}

export {
  newTransferRequest,
}
