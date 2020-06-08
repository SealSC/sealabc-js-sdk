import {newRequest, newTx, smartAssetsAppName} from "../common";
import {newBlockchainRequest} from "../../../../system/blockchain/blockchainRequest";

function newContractCallRequest(tools, caller, contract, value, data, memo = "", sn = "") {
  let tx = newTx(tools, "ContractCall", caller, contract, value, data, memo, sn)
  return newRequest(tx, tools)
}

export {
  newContractCallRequest
}
