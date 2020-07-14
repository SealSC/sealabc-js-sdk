import {hexToBase64} from "../../../../util/converter"

function SellingData() {
  this.price = "0"
  this.amount = "1"
  this.seller = ""
  this.sellingAssets = ""
  this.paymentAssets = ""

  this.toJSON = () => {
    return JSON.stringify(this.toPlainObject())
  }

  this.toPlainObject = () => {
    return {
      Price: this.price,
      Amount: this.amount,
      Seller: hexToBase64(this.seller),
      SellingAssets: hexToBase64(this.sellingAssets),
      PaymentAssets: hexToBase64(this.paymentAssets),
    }
  }
}

function buildSellingData(price, seller, sellingAssets, paymentAssets) {
  let data = new SellingData()

  data.price = price
  data.seller = seller
  data.sellingAssets = sellingAssets
  data.paymentAssets = paymentAssets

  return data.toJSON()
}

export {
  SellingData,
  buildSellingData,
}
