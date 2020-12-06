import {TSServiceRequest, TSData} from "./dataTypes";
import {newTSQuery, newTSStore, newTSStoreFromSingedTSData, newTSModify, newTSModifyFromSingedTSData} from "./requests";


let dataTypes = {
  TSData,
  TSServiceRequest,
}

let requests = {
  newTSQuery,
  newTSStore,
  newTSStoreFromSingedTSData,

  newTSModify,
  newTSModifyFromSingedTSData,
}

let tsService = {
  serviceName: "Traceable Storage",
  dataTypes,
  requests,
}

export {
  tsService
}