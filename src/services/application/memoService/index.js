import {Memo} from "./dataTypes";
import {newMemoQuery, newMemoRecord} from "./requests";


let dataTypes = {
  Memo,
}

let requests = {
  newMemoQuery,
  newMemoRecord,
}

let memoService = {
  dataTypes,
  requests,
}

export {
  memoService
}