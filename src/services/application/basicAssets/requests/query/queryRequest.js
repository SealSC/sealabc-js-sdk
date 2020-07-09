import {hexToBase64} from "../../../../../util/converter";
import {WrappedUint8Array} from "../../../../../util/wrapper";
import isBase64 from "is-base64";
import b64 from "base64-js";

function paramConvert(param) {
  let ret = ""
  if (null === param) {
    ret = param
  } else if ("string" === typeof param) {
    if((/^[0-9a-fA-F]+$/).test(param)) {
      ret = hexToBase64(param)
    } else if(isBase64(param)) {
      ret = param
    } else {
      throw new Error("invalid param")
    }
  } else if (param instanceof WrappedUint8Array) {
    ret = param.base64
  } else if (param instanceof Uint8Array) {
    ret =  b64.fromByteArray(param)
  } else {
    throw new Error("invalid param")
  }

  return ret
}

function newQueryUnspent(address, assets = null) {
  address = paramConvert(address)
  assets = paramConvert(assets)

  return {
    DBType: "KV",
    QueryType: "UnspentList",
    Parameter: [JSON.stringify({
      Address: address,
      Assets: assets,
    })],
  }
}

function newQuerySellingList() {
  return {
    DBType: "KV",
    QueryType: "SellingList",
    Parameter: [],
  }
}

export {
  newQueryUnspent,
  newQuerySellingList,
}
