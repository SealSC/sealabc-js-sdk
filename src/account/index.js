import {Signer} from "../crypto/signer/signer";
import cryptoJS from "crypto-js";
import bcrypt from "bcryptjs";
import {
  base64ToHex,
  base64ToPlainObject, hexToUint8Array, stringToBase64, stringToUint8Array, uint8ArrayToHex, uint8ArrayToString,
  uint8ArrayToWordArray,
  wordArrayToUint8Array,
  autoConvertToBase64,
} from "../util/converter";
import b64 from "base64-js";
import {ED25519} from "../crypto/signer/ed25519";
import {HashCalculator} from "../crypto/hash";
import {Seal} from "../services/common/seal";
import {basicAssets} from "../services/application/basicAssets";
import {memoService} from "../services/application/memoService";
import {basicAssetsAppName} from "../services/application/basicAssets/requests/common/common";
import {ApiClient} from "../network/apiClient";
import BN from "bn.js"
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

let allMode = {
  "CBC": cryptoJS.mode.CBC,
  "CFB": cryptoJS.mode.CFB,
  "CTR": cryptoJS.mode.CTR,
  "OFB": cryptoJS.mode.OFB,
}

class Account {
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

  setApiClient(apiClient) {
    if(!(apiClient instanceof ApiClient)) {
      throw new Error("invavlid parameter, we need ApiClient to send query request.")
    }

    this.apiClient = apiClient
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

  cryptoTools() {
    return new crypto.Tools(crypto.algorithm.hash.Sha3, this.signer)
  }

  sign(data){
    return this.signer.sign(data)
  }

  seal(data, hashCalc = null) {
    if (null === hashCalc) {
      hashCalc = hash.Sha3
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

  static onlyForVerify(publicKey) {
    let newAccount = new Account()

    newAccount.signer = ED25519.fromPublicKey(publicKey)
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

  setBasicAssetsList(assetsList) {
    this.basicAssets = assetsList
  }

  async loadBasicAssets() {
    let queryData = basicAssets.requests.newQueryUnspent(this.signer.keyPair.publicKey)

    let result = await this.apiClient.queryApplication(basicAssetsAppName, queryData)
    if(result.success) {
      this.basicAssets = result.data.List
    }

    return result
  }

  async issueAssets(name, symbol, supply, increasable = false, memo = "") {
    supply = new BN(supply)
    let assets = basicAssets.dataTypes.buildAssets(
      name,
      symbol,
      supply.toString(10),
      increasable,
    )

    let tools = this.cryptoTools()
    assets.sign(tools)
    let issueReq = basicAssets.requests.newIssueAssetsRequest(assets, tools, memo)
    return await this.apiClient.callApplication(issueReq.toJSON())

  }

  async transferTo(receiver, assetsHash, amount, memo = "") {
    if("string" !== typeof amount) {
      throw new Error("amount must be a string")
    }

    receiver = autoConvertToBase64(receiver)

    let assetsB64 = autoConvertToBase64(assetsHash)
    let assets = this.basicAssets[assetsB64]
    if(!assets) {
      throw new Error("you did not have that assets: " + assets)
    }

    let utxoList = assets.UnspentList

    let input = []
    let output = []
    let change = null
    let amountAcc = new BN(0)
    let amountBN = new BN(amount)

    for(let i=0; i<utxoList.length; i++) {
      let utxo = utxoList[i]
      let uv = new BN(utxo.Value)

      let nextAcc = amountAcc.add(uv)
      let stillNeed = amountBN.sub(amountAcc)

      if(nextAcc.gte(amountBN)) {
        let newOut = new basicAssets.dataTypes.UTXOOutput(receiver, stillNeed.toString(10))
        output.push(newOut)

        if(nextAcc.gt(amountBN)) {
          let changeVal = nextAcc.sub(amountBN)

          let newInput = new basicAssets.dataTypes.UTXOInput(utxo.Transaction, utxo.OutputIndex)
          input.push(newInput)

          change = new basicAssets.dataTypes.UTXOOutput(this.address(), changeVal.toString(10))
          output.push(change)

          amountAcc = nextAcc
        }

        break
      } else {
        let newInput = new basicAssets.dataTypes.UTXOInput(utxo.Transaction, utxo.OutputIndex)
        input.push(newInput)

        let newOutput = new basicAssets.dataTypes.UTXOOutput(receiver, stillNeed.toString(10))
        output.push(newOutput)

        amountAcc = nextAcc
      }
    }

    let assetsObj = new basicAssets.dataTypes.Assets()
    assetsObj.setSeal(Seal.fromPlainObject(assets.Assets.IssuedSeal), Seal.fromPlainObject(assets.Assets.MetaSeal))
    let transferReq = basicAssets.requests.newTransferRequest(assetsObj, input, output, this.cryptoTools(), memo)
    return await this.apiClient.callApplication(transferReq.toJSON())
  }

  async recordMemo(memoType, memoString) {
    if("string" !== typeof memoType || "string" !== typeof memoType) {
      throw new Error("invalid param")
    }

    let newMemo = new memoService.dataTypes.Memo(memoType, memoString)
    let memoReq = memoService.requests.newMemoRecord(newMemo, this.cryptoTools())

    return await this.apiClient.callApplication(memoReq.toJSON())
  }
}

export {
  Account
}
