const express = require("express");
const {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} = require("../../controllers/message/message-controller.js");
const { authMiddleware } = require("../../controllers/auth/auth-controller.js");
const router = express.Router();

router.get("/users", getUsersForSidebar);
router.get("/:id", getMessages);
router.post("/send/:id", sendMessage);

module.exports = router;
