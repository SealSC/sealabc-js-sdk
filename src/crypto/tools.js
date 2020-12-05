import {HashCalculator, hash} from "./hash";
import {Signer} from "./signer/signer";
import {ED25519} from "./signer/ed25519";
import cryptoJS from "crypto-js";
import {uint8ArrayToHex, wordArrayToUint8Array} from "../util/converter";

function randomHex() {
  let rw = cryptoJS.lib.WordArray.random(32)
  let ru8 = wordArrayToUint8Array(rw)

  return uint8ArrayToHex(ru8)
}

class CryptoTools {
  constructor(hashCalc, signer) {
    if (!(hashCalc instanceof HashCalculator) || !(signer instanceof Signer)) {
      throw new Error("not valid hash calculator or signer")
    }

    this.hash = hashCalc
    this.signer = signer
  }
}

function getDefaultTools(key) {
  let signer = new ED25519(key)

  return new CryptoTools(hash.Sha3, signer)
}

export {
  CryptoTools,
  getDefaultTools,
  randomHex,
}
