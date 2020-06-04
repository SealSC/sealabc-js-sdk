import {Assets, buildAssets} from "./datatypes/assets";
import {Transaction} from "./datatypes/transaction";
import {UTXOInput} from "./datatypes/utxoInput";
import {UTXOOutput} from "./datatypes/utxoOutput";

import {newIssueAssetsRequest} from "./requests/transaction/issueAssetsRequest";
import {newTransferRequest} from "./requests/transaction/transferRequest";
import {newQueryUnspent} from "./requests/query/queryRequest";

let dataTypes = {
  Assets,
  buildAssets,

  Transaction,
  UTXOInput,
  UTXOOutput,
}

let requests = {
  newQueryUnspent,

  newIssueAssetsRequest,
  newTransferRequest,
}

let basicAssets = {
  dataTypes,
  requests,
}

export {
  basicAssets
}