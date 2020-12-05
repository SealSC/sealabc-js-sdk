import {Signer} from "../crypto/signer/signer";
import cryptoJS from "crypto-js";
import bcrypt from "bcryptjs";
import {
  base64ToPlainObject, stringToBase64, stringToUint8Array, uint8ArrayToString,
  uint8ArrayToWordArray,
  wordArrayToUint8Array,
  autoConvertToBase64,
} from "../util/converter";
import b64 from "base64-js";
import {ED25519} from "../crypto/signer/ed25519";
import {HashCalculator} from "../crypto/hash";
import {Seal} from "../services/common/seal";
import {ApiClient} from "../network/apiClient";
import {crypto} from "../crypto";

bcrypt.setRandomFallback((n)=>{
  let rw = cryptoJS.lib.WordArray.random(n)
  let ru8 = wordArrayToUint8Array(rw)

  let out = new Uint8Array(n)
  for (let i=0; i<n; i++) {
    out[i] = ru8[i]
  }
  return out
})

class AccountBase {
  constructor(signer = null, apiClient = null) {
    this.signerType = "ED25519"

    if(signer instanceof Signer) {
      this.signer = signer
    } else {
      this.signer = new ED25519(signer)
    }

    this.fullFunctional = true
    this.basicAssets = {}
    this.apiClient = null

    if(apiClient instanceof ApiClient) {
      this.apiClient = apiClient
    }
  }

  toEncrypted(pwd) {
    let keySaltStr = bcrypt.hashSync(pwd)

    let keySalt = stringToUint8Array(keySaltStr)
    keySalt = uint8ArrayToWordArray(keySalt)

    const pbkdf2Iter = 1000

    let key = cryptoJS.PBKDF2(pwd, keySalt, {
      keySize: 8,
      iterations: pbkdf2Iter,
      hasher: cryptoJS.algo.SHA3
    })

    let keyData = JSON.stringify({
      PrivateKey: this.signer.keyPair.privateKey.base64,
      PublicKey: this.signer.keyPair.publicKey.base64,
    })

    let iv = cryptoJS.PBKDF2(keySaltStr, keySalt, {
      keySize: 4,
      iterations: pbkdf2Iter / 10,
      hasher: cryptoJS.algo.SHA3
    })

    let dataForEnc = JSON.stringify({
      SignerType: "ED25519",
      KeyData: stringToBase64(keyData)
    })

    let encrypted = cryptoJS.AES.encrypt(dataForEnc, key, {iv: iv ,mode: cryptoJS.mode.CFB, padding: cryptoJS.pad.NoPadding})

    let cipherTextb64 = encrypted.ciphertext.toString(cryptoJS.enc.Base64)
    let ivB64 = encrypted.iv.toString(cryptoJS.enc.Base64)
    let modeB64 = stringToBase64("CFB")
    let kdfSaltB64 = b64.fromByteArray(wordArrayToUint8Array(keySalt))

    let kdf2ParamB64 = stringToBase64(JSON.stringify({
      Iter: pbkdf2Iter,
      KeyHashAlgorithm: "keccak_512",
      PasswordHashCost: 10,
    }))

    return {
      Address: this.signer.keyPair.publicKey.hex,
      Data: {
        CipherText: cipherTextb64,
        ExternalData: ivB64,
      },

      Config: {
        CipherType: "AES",
        CipherParam: modeB64,
        KDFType: "PBKDF2",
        KDFSalt: kdfSaltB64,
        KDFParam: kdf2ParamB64,
        KeyLength: 32,
      }
    }
  }

  address() {
    return this.signer.keyPair.publicKey.base64
  }

  addressHex() {
    return this.signer.keyPair.publicKey.base64
  }

  cryptoTools() {
    return new crypto.Tools(crypto.algorithm.hash.Sha3, this.signer)
  }

  sign(data){
    return this.signer.sign(data)
  }

  seal(data, hashCalc = null) {
    if (null === hashCalc) {
      hashCalc = crypto.algorithm.hash.Sha3
    } else if (!(hashCalc instanceof HashCalculator)) {
      throw new Error("invalid hash calculator")
    }

    let dataHash = hashCalc.sum256(data)
    let sig = this.signer.sign(dataHash)
    return new Seal(dataHash, sig, this.signer.getPublicKey())
  }

  verifySignature(data, sig){
    return this.signer.verify(data, sig)
  }
}

export {
  AccountBase
}
