// const paypal = require("paypal-rest-sdk");

// paypal.configure({
//   mode: "",
//   client_id: "",
//   client_secret: "",
// });
const ZarinpalPayment = require("zarinpal-pay");
const zarinpal = new ZarinpalPayment("eaa46b01-819e-42ef-8a67-ba2bb7j69a32", {
  isSandbox: true,
  isToman: true,
});

module.exports = zarinpal;
