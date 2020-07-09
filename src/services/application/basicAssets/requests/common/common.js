import {Transaction} from "../../datatypes/transaction";

const basicAssetsAppName = "Basic Assets"

function buildData(txType, memo, assets, inputList = [], outputList = [], extraData = "") {
  let tx = new Transaction()

  tx.txType = txType
  tx.data = memo
  tx.assets = assets
  tx.extraData = extraData

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
