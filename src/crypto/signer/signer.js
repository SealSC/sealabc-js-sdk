import {wrapUint8Array} from "../../util/wrapper";

class KeyPair {
  constructor(pub = new Uint8Array(0), priv = new Uint8Array(0)) {
    this.privateKey = wrapUint8Array(priv)
    this.publicKey = wrapUint8Array(pub)
  }
}

class Signer {
  constructor() {
    this.keyPair = new KeyPair()
  }

  getKeyPair() {
    return this.keyPair
  }

  getPublicKey() {
    return this.keyPair.publicKey
  }

  getPrivateKey() {
    return this.keyPair.privateKey
  }

  name() {
    return "unknown"
  }

  sign(message) {
    return null
  }

  verify(message, sig) {
    return null
  }
}

export {
  KeyPair,
  Signer,
}
