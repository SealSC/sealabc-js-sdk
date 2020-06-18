import {crypto} from "../crypto";

class OperationBase {
  constructor(signer) {
    this.signer = signer
  }

  address() {
    return this.signer.keyPair.publicKey.base64
  }

  cryptoTools() {
    return new crypto.Tools(crypto.algorithm.hash.Sha3, this.signer)
  }
}

export {
  OperationBase
}
