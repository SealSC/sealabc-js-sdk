import {Transaction} from "../../datatypes/transaction";

const basicAssetsAppName = "Basic Assets"

function buildData(txType, memo, assets, inputList = [], outputList = []) {
  let tx = new Transaction()

  tx.txType = txType
  tx.data = memo
  tx.assets = assets

  inputList.forEach(i=>{
    tx.addInput(i)
  })

  outputList.forEach(o=>{
    tx.addOutput(o)
  })

  return tx
}

export {
  buildData,
  basicAssetsAppName,
}
