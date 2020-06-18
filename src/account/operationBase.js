import {crypto} from "../crypto";
import {ApiClient} from "../network/apiClient";

class OperationBase {
  constructor(signer) {
    this.signer = signer
  }

  address() {
    return this.signer.keyPair.publicKey.base64
  }

  hexAddress() {
    return this.signer.keyPair.publicKey.hex
  }

  setApiClient(apiClient) {
    if(!(apiClient instanceof ApiClient)) {
      throw new Error("invalid parameter, we need ApiClient to send query request.")
    }

    this.apiClient = apiClient
  }

  cryptoTools() {
    return new crypto.Tools(crypto.algorithm.hash.Sha3, this.signer)
  }
}

export {
  OperationBase
}
