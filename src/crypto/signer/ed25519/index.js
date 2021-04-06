import nacl from "tweetnacl"
import {WrappedUint8Array, wrapUint8Array} from "../../../util/wrapper";
import {hexToUint8Array, wordArrayToUint8Array} from "../../../util/converter";
import {KeyPair, Signer} from "../signer";
import cryptoJS from "crypto-js"

//node compatible
nacl.setPRNG((x, n)=>{
  let rw = cryptoJS.lib.WordArray.random(n)
  let ru8 = wordArrayToUint8Array(rw)

  for (let i=0; i<n; i++) {
    x[i] = ru8[i]
  }
})

function getMessage(message) {
  if(!(message instanceof Uint8Array) && !(message instanceof WrappedUint8Array)) {
    throw new Error("message must be Uint8Array or WrappedUint8Array")
  }

  if(message instanceof WrappedUint8Array) {
    message = message.u8Array
  }

  return message
}

class ED25519 extends Signer {
  constructor(priv = null) {
    super()

    let naclKeyPair = null
    if (null === priv) {
      naclKeyPair = new nacl.sign.keyPair()
    } else {
      if ("string" === typeof priv) {
        priv = hexToUint8Array(priv)
      } else {
        if (!(priv instanceof Uint8Array)) {
          throw new Error("private key must be an hex string or an Uint8Array")
        }
      }

      if(priv.length === nacl.sign.secretKeyLength) {
        naclKeyPair = nacl.sign.keyPair.fromSecretKey(priv)
      } else if(priv.length === nacl.sign.seedLength){
        naclKeyPair = nacl.sign.keyPair.fromSeed(priv)
      } else {
        throw new Error("invalid private key length")
      }
    }

    this.keyPair = new KeyPair(naclKeyPair.publicKey, naclKeyPair.secretKey)
  }

  static fromPublicKey(pub) {
    if ("string" === typeof pub) {
      pub = hexToUint8Array(pub)
    } else {
      if (!(pub instanceof Uint8Array)) {
        throw new Error("private key must be an hex string or an Uint8Array")
      }
    }

    let newSigner = new ED25519()

    newSigner.keyPair = new KeyPair(pub)
    return newSigner
  }

  name() {
    return "ED25519"
  }

  sign(message) {
    message = getMessage(message)
    let sig = nacl.sign.detached(message, this.keyPair.privateKey.u8Array)
    return wrapUint8Array(sig)
  }

  verify(message, sig){
    message = getMessage(message)
    return nacl.sign.detached.verify(message, sig, this.keyPair.publicKey.u8Array)
  }
}

export {
  ED25519
}
