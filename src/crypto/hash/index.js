import JSSha from "jssha"
import cryptoJS from "crypto-js"
import {wordArrayToUint8Array} from "../../util/converter"
import {wrapUint8Array} from "../../util/wrapper";

class HashCalculator {
  sum256(){return null}
}

class Sha3 extends HashCalculator{
  sum256(message, type = "ARRAYBUFFER") {
    let sha = new JSSha("SHA3-256", type)
    sha.update(message)
    return wrapUint8Array(new Uint8Array(sha.getHash("ARRAYBUFFER")))
  }
}

class Keccak extends HashCalculator{
  sum256 (message) {
    let hashWords = cryptoJS.SHA3(message, { outputLength: 256 })
    let hashBytes = wordArrayToUint8Array(hashWords)

    return wrapUint8Array(hashBytes)
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
