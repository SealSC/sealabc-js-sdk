import BN from "bn.js"
import b64 from "base64-js";
import {WrappedUint8Array} from "./wrapper";
import isBase64 from "is-base64";

require("fast-text-encoding")

let textEncoder = new TextEncoder()
let textDecoder = new TextDecoder()

function stringToUint8Array(str) {
  // let arr = [];
  // for (let i = 0, j = str.length; i < j; ++i) {
  //   arr.push(str.charCodeAt(i));
  // }

  let arr = textEncoder.encode(str)
  return new Uint8Array(arr);
}

function stringToUint8ArrayWithLength(str) {
  let strArr = stringToUint8Array(str)
  let strLen = arr.length
  let lenArr = uint32ToBigEndianUint8Array(strLen)

  let ret = new Uint8Array(lenArr.length + arr.length)
  ret.set(lenArr)
  ret.set(strArr, lenArr.length)

  return ret
}

function stringToBase64(str) {
  let u8 = stringToUint8Array(str)
  return b64.fromByteArray(u8)
}

function uint8ArrayToString(u8Array) {
  // let str = ""
  // for (let i = 0; i < u8Array.length; i++) {
  //   str += String.fromCharCode(u8Array[i])
  // }

  let str = textDecoder.decode(u8Array)

  return str
}

function boolToUint8Array(b) {
  let u8Array = new Uint8Array(1)
  u8Array[0] = b ? 1:0
  return u8Array
}

function uint8ArrayToBool(u8Array) {
  return  u8Array[0] !== 0
}

function uint32ToBigEndianUint8Array(i) {
  let u8Array = new Uint8Array(4)
  u8Array[0] = (i >> 24) & 0xff
  u8Array[1] = (i >> 16) & 0xff;
  u8Array[2] = (i >> 8) & 0xff;
  u8Array[3] = i & 0xff;

  return u8Array
}

function bigEndianUint8ArrayToUint32(u8Array) {
  return  (u8Array[0] << 24) |
          (u8Array[1] << 16) |
          (u8Array[2] << 8)  |
          (u8Array[3])
}

function uint64ToBigEndianUint8Array(i) {
  let bi = new BN(i)
  let arr = bi.toArray("be", 8)
  return new Uint8Array(arr)
}

function bigEndianUint8ArrayToUint64(u8Array) {
  let bi = new BN(u8Array, 10, "be")

  return  bi.toString(10)
}

function hexToUint8Array(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

function uint8ArrayToHex(u8Array) {
  return u8Array.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

function uint8ArrayToWordArray(u8Array) {
  let words = []
  let i = 0
  let len = u8Array.length;

  while (i < len) {
    words.push(
      (u8Array[i++] << 24) |
      (u8Array[i++] << 16) |
      (u8Array[i++] << 8)  |
      (u8Array[i++])
    );
  }

  return {
    sigBytes: words.length * 4,
    words: words
  };
}

function wordArrayToUint8Array(wordArray) {
  let len = wordArray.words.length
  let u8Array = new Uint8Array(len << 2)
  let offset = 0

  for (let i=0; i<len; i++) {
    let word = wordArray.words[i];
    u8Array[offset++] = word >> 24;
    u8Array[offset++] = (word >> 16) & 0xff;
    u8Array[offset++] = (word >> 8) & 0xff;
    u8Array[offset++] = word & 0xff;
  }
  return u8Array;
}


function base64ToPlainObject(b64Str) {
  let u8Array = b64.toByteArray(b64Str)
  let jsonStr = uint8ArrayToString(u8Array)
  return JSON.parse(jsonStr)
}

function hexToBase64(hex) {
  let u8Array = hexToUint8Array(hex)
  return b64.fromByteArray(u8Array)
}

function base64ToHex(b64Str) {
  let u8Array = b64.toByteArray(b64Str)
  return uint8ArrayToHex(u8Array)
}

function autoConvertToBase64(param) {
  let ret = ""
  if (null === param) {
    ret = param
  } else if ("string" === typeof param) {
    if((/^[0-9a-fA-F]+$/).test(param)) {
      ret = hexToBase64(param)
    } else if(isBase64(param)) {
      ret = param
    } else {
      throw new Error("invalid param")
    }
  } else if (param instanceof WrappedUint8Array) {
    ret = param.base64
  } else if (param instanceof Uint8Array) {
    ret =  b64.fromByteArray(param)
  } else {
    throw new Error("invalid param")
  }

  return ret
}

export {
  stringToUint8Array,
  stringToUint8ArrayWithLength,
  uint8ArrayToString,
  stringToBase64,

  boolToUint8Array,
  uint8ArrayToBool,

  uint32ToBigEndianUint8Array,
  bigEndianUint8ArrayToUint32,

  uint64ToBigEndianUint8Array,
  bigEndianUint8ArrayToUint64,

  hexToUint8Array,
  uint8ArrayToHex,

  uint8ArrayToWordArray,
  wordArrayToUint8Array,

  base64ToPlainObject,
  hexToBase64,
  base64ToHex,
  autoConvertToBase64,
}
