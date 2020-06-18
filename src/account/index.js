import cryptoJS from "crypto-js";
import {
  base64ToPlainObject, uint8ArrayToString,
  uint8ArrayToWordArray,
} from "../util/converter";
import b64 from "base64-js";
import {ED25519} from "../crypto/signer/ed25519";
import {AccountBase} from "./base";
import {BasicAssetsOperations} from "./basicAssetsOperations";
import {ApiClient} from "../network/apiClient";
import {MemoOperations} from "./memoOperations";
import {SmartAssetsOperations} from "./smartAssetsOperations";

let allMode = {
  "CBC": cryptoJS.mode.CBC,
  "CFB": cryptoJS.mode.CFB,
  "CTR": cryptoJS.mode.CTR,
  "OFB": cryptoJS.mode.OFB,
}

class Account extends AccountBase {
  constructor(signer = null, apiClient = null) {
    super(signer, apiClient)
    this.basicAssets = new BasicAssetsOperations(this.signer, apiClient)
    this.memo = new MemoOperations(this.signer, apiClient)
    this.smartAssets = new SmartAssetsOperations(this.signer, apiClient)
  }

  setApiClient(apiClient) {
    if(!(apiClient instanceof ApiClient)) {
      throw new Error("invalid parameter, we need ApiClient to send query request.")
    }

    this.apiClient = apiClient
    this.basicAssets.setApiClient(apiClient)
    this.memo.setApiClient(apiClient)
    this.smartAssets.setApiClient(apiClient)
  }

  static onlyForVerify(publicKey) {
    let verifySigner = ED25519.fromPublicKey(publicKey)
    let newAccount = new Account(verifySigner)

    newAccount.fullFunctional = false
    return newAccount
  }

  static fromEncrypted(json, pwd) {
    let accountJSON = JSON.parse(json)
    let config = accountJSON.Config

    let keySalt = b64.toByteArray(config.KDFSalt)
    keySalt = uint8ArrayToWordArray(keySalt)

    let keyLen = config.KeyLength
    let kdfParam = base64ToPlainObject(config.KDFParam)

    let key = cryptoJS.PBKDF2(pwd, keySalt, {
      keySize: (keyLen * 8) / 32,
      iterations: kdfParam.Iter,
      hasher: cryptoJS.algo.SHA3
    })

    let mode = uint8ArrayToString(b64.toByteArray(config.CipherParam))
    let padding = cryptoJS.pad.NoPadding
    let decryptMode = allMode[mode]
    if (!decryptMode) {
      throw new Error("invalid mode")
    }

    if("CBC" === mode) {
      padding = cryptoJS.pad.Pkcs7
    }

    let iv = cryptoJS.enc.Base64.parse(accountJSON.Data.ExternalData)
    let plaintext = cryptoJS.AES.decrypt(
      accountJSON.Data.CipherText,
      key,
      {iv: iv, mode: decryptMode, padding: padding}
    )

    let account = JSON.parse(plaintext.toString(cryptoJS.enc.Utf8))
    let keyPair = base64ToPlainObject(account.KeyData)
    let priv = b64.toByteArray(keyPair.PrivateKey)

    return new Account(priv)
  }
}

export {
  Account
}
