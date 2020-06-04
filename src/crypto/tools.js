import {HashCalculator, hash} from "./hash";
import {Signer} from "./signer/signer";
import {ED25519} from "./signer/ed25519";

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
}
