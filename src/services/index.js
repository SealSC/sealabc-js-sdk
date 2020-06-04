import {blockchain} from "./system/blockchain";
import {basicAssets} from "./application/basicAssets";
import {memoService} from "./application/memoService";
import {smartAssets} from "./application/smartAssets";
import {Seal} from "./common/seal";

let services = {
  blockchain,
  basicAssets,
  memoService,
  smartAssets,

  common: {
    Seal: Seal
  }
}

export {
  services
}