import {Assets, buildAssets, buildCopyright} from "./datatypes/assets";
import {SellingData, buildSellingData} from "./dataTypes/sellingData";
import {Transaction} from "./datatypes/transaction";
import {UTXOInput} from "./datatypes/utxoInput";
import {UTXOOutput} from "./datatypes/utxoOutput";

import {newIssueAssetsRequest} from "./requests/transaction/issueAssetsRequest";
import {newTransferRequest} from "./requests/transaction/transferRequest";
import {newStartSellingRequest} from "./requests/transaction/startSelling";
import {newStopSellingRequest} from "./requests/transaction/stopSelling";
import {newBuyAssetsRequest} from "./requests/transaction/buyAssets";

import {newQueryUnspent, newQuerySellingList, newQueryAllAssets, newQueryCopyrightList} from "./requests/query/queryRequest";

let dataTypes = {
  Assets,
  buildAssets,
  buildCopyright,

  SellingData,
  buildSellingData,

  Transaction,
  UTXOInput,
  UTXOOutput,
}

let requests = {
  newQueryUnspent,
  newQuerySellingList,
  newQueryAllAssets,
  newQueryCopyrightList,

  newIssueAssetsRequest,
  newTransferRequest,

  newStartSellingRequest,
  newStopSellingRequest,
  newBuyAssetsRequest,
}

let basicAssets = {
  dataTypes,
  requests,
}

export {
  basicAssets
}