import {blockchain} from "./system/blockchain";
import {basicAssets} from "./application/basicAssets";
import {memoService} from "./application/memoService";
import {Seal} from "./common/seal";

let services = {
  blockchain,
  basicAssets,
  memoService,

  common: {
    Seal: Seal
  }
}

export {
  services
}