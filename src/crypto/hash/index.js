import sha3 from "js-sha3"
import cryptoJS from "crypto-js"
import {hexToUint8Array, wordArrayToUint8Array} from "../../util/converter"
import {wrapUint8Array} from "../../util/wrapper";

class HashCalculator {
  sum256(){return null}
}

class Sha3 extends HashCalculator{
  sum256(message) {
    let hash = sha3.sha3_256(message)
    return wrapUint8Array(hexToUint8Array(hash))
  }
}

class Keccak extends HashCalculator{
  sum256 (message) {
    let hash = sha3.keccak256(message)
    return wrapUint8Array(hexToUint8Array(hash))
  }

  //todo: other bits
}

let hash = {
  Sha3: new Sha3(),
  Keccak: new Keccak(),
}

export {
  HashCalculator,
  hash,
}
