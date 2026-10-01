const express = require("express");
const { protect } = require("../middleware/auth");
const {
  searchUsers,
  getProfile,
  sendFriendRequest,
  listFriendRequests,
  respondFriendRequest,
  listFriends,
  getMessages,
  sendMessage,
  listConversations,
  friendsFeed,
} = require("../controllers/socialController");

const router = express.Router();

router.get("/profile/:username", protect, getProfile);
router.get("/search", protect, searchUsers);
router.get("/feed", protect, friendsFeed);

router.get("/friends", protect, listFriends);
router.post("/friends/request", protect, sendFriendRequest);
router.get("/friends/requests", protect, listFriendRequests);
router.post("/friends/respond", protect, respondFriendRequest);

router.get("/conversations", protect, listConversations);
router.get("/chat/:friendId", protect, getMessages);
router.post("/chat/:friendId", protect, sendMessage);

module.exports = router;
