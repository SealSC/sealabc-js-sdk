import {newRequest, newTx, smartAssetsAppName} from "../common";
import {newBlockchainRequest} from "../../../../system/blockchain/blockchainRequest";

function newContractCreationRequest(tools, creator, value, data, memo, sn) {
  let tx = newTx(tools, "ContractCreation", creator, "", value, data, memo, sn)
  return newRequest(tx, tools)
}

export {
  newContractCreationRequest
}
