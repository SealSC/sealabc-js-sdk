import {signer} from "./signer";
import {hash} from "./hash";
import {CryptoTools as Tools} from "./tools";

const crypto = {
  algorithm : {
    signer: signer,
    hash: hash,

  },

  Tools
}

export {
  crypto
}