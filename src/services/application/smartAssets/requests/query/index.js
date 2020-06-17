import {newQuery} from "../common";

function newTransactionQuery(tx = '') {
  return newQuery('Transaction', {TxHash: tx})
}

function newTransactionListQuery(account = '') {
  return newQuery('TransactionList', {Account: account})
}

function newTransferListQuery(account = '') {
  return newQuery('TransferList', {Account: account})
}

function newAccountListQuery() {
  return newQuery('AccountList')
}

function newAccountQuery(account) {
  return newQuery('Account', {Account: account})
}

let queries = {
  newTransactionQuery,
  newTransactionListQuery,
  newTransferListQuery,
  newAccountListQuery,
  newAccountQuery,
}

export {
  queries
}
