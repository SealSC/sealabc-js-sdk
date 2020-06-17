import {Transaction} from "./dataType/transaction";
import {TransactionData} from "./dataType/transactionData";
import {newTransferRequest} from "./requests/transaction/transfer";
import {newContractCallRequest} from "./requests/transaction/contractCall";
import {newContractCreationRequest} from "./requests/transaction/contractCreation";
import {newContractOffChainCall} from "./requests/transaction/contractOffChainCall";

import {queries} from "./requests/query";

let dataTypes = {
  Transaction,
  TransactionData
}

let requests = {
  newTransferRequest,
  newContractCallRequest,
  newContractCreationRequest,
  newContractOffChainCall,
}
requests = Object.assign(requests, queries)

let smartAssets = {
  dataTypes,
  requests,
}

export {
  smartAssets
}
