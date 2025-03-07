const axios = require("axios");

// Replace with your reCAPTCHA secret key
const RECAPTCHA_SECRET_KEY = "6LenHecqAAAAAKfNmmz_8c7sEedcMUKfB5Wfqi5a";

async function verifyRecaptcha(token) {
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`
    );

    return response.data.success;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}

module.exports = { verifyRecaptcha };
