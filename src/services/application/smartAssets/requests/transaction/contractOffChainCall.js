import {newRequest, newTx, smartAssetsAppName} from "../common";
import {newBlockchainRequest} from "../../../../system/blockchain/blockchainRequest";

function newContractOffChainCall(caller, contract, data) {
  let tx = newTx(null, "ContractCall", caller, contract, "0", data)

  return {
    QueryType: "OffChainCall",
    Parameter: {
      Data: tx.toJSON()
    }
  }
}

export {
  newContractOffChainCall
}
