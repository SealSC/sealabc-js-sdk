import {Transaction} from "./dataType/transaction";
import {TransactionData} from "./dataType/transactionData";
import {newTransferRequest} from "./requests/transaction/transfer";
import {newContractCallRequest} from "./requests/transaction/contractCall";
import {newContractCreationRequest} from "./requests/transaction/contractCreation";

let dataTypes = {
  Transaction,
  TransactionData
}

let requests = {
  newTransferRequest,
  newContractCallRequest,
  newContractCreationRequest,
}

let smartAssets = {
  dataTypes,
  requests,
}

export {
  smartAssets
}