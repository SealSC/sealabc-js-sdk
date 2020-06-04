import {uint8ArrayToHex} from "./converter";
import base64 from "base64-js"

class WrappedUint8Array {
  constructor(u8Array) {
    this.base64 = base64.fromByteArray(u8Array)
    this.hex = uint8ArrayToHex(u8Array)
    this.u8Array = u8Array
  }

  update(u8Array) {
    this.base64 = base64.fromByteArray(u8Array)
    this.hex = uint8ArrayToHex(u8Array)
    this.u8Array = u8Array
  }
}

function wrapUint8Array(u8Array) {
  if (!(u8Array instanceof Uint8Array)) {
    throw new Error("input must be Uint8Array")
  }

  return new WrappedUint8Array(u8Array)
}

export {
  wrapUint8Array,

  WrappedUint8Array,
}
