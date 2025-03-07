const User = require("../../models/User.js");
const Message = require("../../models/Message.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getReceiverSocketId, io } = require("../../helpers/socket.js");
const getUsersForSidebar = async (req, res) => {
  try {
    const { loggedInUserId } = req.body;
    console.log(loggedInUserId);
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({
        success: false,
        message: "Unauthorised user!",
      });

    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");

    req.user = decoded;

    console.log(req.body);
    const { id: userToChatId } = req.params;
    const myId = req.user.id;
    console.log("in getMessage function.....", myId, userToChatId);

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({
        success: false,
        message: "Unauthorised user!",
      });

    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");

    req.user = decoded;
    console.log("heloooooooo");
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;
    console.log(senderId, "sender id ");

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
    });

    await newMessage.save();

    //realtime

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getUsersForSidebar, getMessages, sendMessage };
