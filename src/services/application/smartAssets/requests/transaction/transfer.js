import {newRequest, newTx, smartAssetsAppName} from "../common";
import {newBlockchainRequest} from "../../../../system/blockchain/blockchainRequest";

function newTransferRequest(tools, from, to, value, memo, sn) {
  let tx = newTx(tools, "Transfer", from, to, value, "", memo, sn)
  return newRequest(tx, tools)
}

export {
  newTransferRequest
}
