import {CryptoTools, randomHex} from "../../../../crypto/tools";
import {TransactionData} from "../dataType/transactionData";
import {Transaction} from "../dataType/transaction";
import {newBlockchainRequest} from "../../../system/blockchain/blockchainRequest";

const smartAssetsAppName = "Smart Assets"


function randomSN() {
  return randomHex()
}

function newTx(tools, type, from, to, value, data = "", memo = "", sn = "") {
  let txData = new TransactionData()

  txData.type = type
  txData.from = from
  txData.to = to
  txData.value = value
  txData.data = data
  txData.memo = memo
  txData.sn = sn || randomSN()

  let tx = new Transaction(txData)

if (tools instanceof CryptoTools) {
    tx.sign(tools)
  }

  return tx
}

function newRequest(tx, tools) {
  return newBlockchainRequest(
    smartAssetsAppName,
    tx.data.type,
    tx.toRequestData(),
    tools
  )
}


function newQuery(queryType, param) {
  return {
    QueryType: queryType,
    Parameter: param
  }
}


export {
  smartAssetsAppName,
  newTx,
  newRequest,
  newQuery,
}
