const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");
const Message = require("../models/Message");
const Image = require("../models/Image");

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  avatar: user.avatar || "",
  bio: user.bio || "",
  friendsCount: user.friends?.length || 0,
  createdAt: user.createdAt,
});

const areFriends = (user, otherId) =>
  user.friends?.some((id) => String(id) === String(otherId));

exports.searchUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim().toLowerCase();
    if (!q || q.length < 2) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ],
    })
      .limit(20)
      .select("name username avatar bio friends createdAt");

    res.json({ users: users.map(publicUser) });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const username = String(req.params.username || "").toLowerCase();
    const profile = await User.findOne({ username }).select(
      "name username avatar bio friends createdAt"
    );

    if (!profile) {
      res.status(404);
      throw new Error("User not found");
    }

    const images = await Image.find({
      user: profile._id,
      isPublic: true,
    })
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();

    const me = req.user;
    const isSelf = me && String(me._id) === String(profile._id);
    const friends = me ? areFriends(me, profile._id) : false;

    let requestStatus = null;
    if (me && !isSelf && !friends) {
      const pending = await FriendRequest.findOne({
        status: "pending",
        $or: [
          { from: me._id, to: profile._id },
          { from: profile._id, to: me._id },
        ],
      });
      if (pending) {
        requestStatus =
          String(pending.from) === String(me._id) ? "outgoing" : "incoming";
      }
    }

    res.json({
      profile: publicUser(profile),
      images,
      isSelf,
      isFriend: friends,
      requestStatus,
    });
  } catch (error) {
    next(error);
  }
};

exports.sendFriendRequest = async (req, res, next) => {
  try {
    const username = String(req.body.username || "")
      .trim()
      .toLowerCase();
    if (!username) {
      res.status(400);
      throw new Error("Username is required");
    }

    const target = await User.findOne({ username });
    if (!target) {
      res.status(404);
      throw new Error("No user found with that username");
    }
    if (String(target._id) === String(req.user._id)) {
      res.status(400);
      throw new Error("You cannot friend yourself");
    }
    if (areFriends(req.user, target._id)) {
      res.status(400);
      throw new Error("You are already friends");
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { from: req.user._id, to: target._id },
        { from: target._id, to: req.user._id },
      ],
    });

    if (existing) {
      if (existing.status === "pending") {
        res.status(400);
        throw new Error("A friend request already exists");
      }
      if (existing.status === "accepted") {
        res.status(400);
        throw new Error("You are already friends");
      }
      existing.from = req.user._id;
      existing.to = target._id;
      existing.status = "pending";
      await existing.save();
      return res.status(201).json({ request: existing });
    }

    const request = await FriendRequest.create({
      from: req.user._id,
      to: target._id,
      status: "pending",
    });

    res.status(201).json({ request });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      return next(new Error("A friend request already exists"));
    }
    next(error);
  }
};

exports.listFriendRequests = async (req, res, next) => {
  try {
    const incoming = await FriendRequest.find({
      to: req.user._id,
      status: "pending",
    })
      .populate("from", "name username avatar")
      .sort({ createdAt: -1 });

    const outgoing = await FriendRequest.find({
      from: req.user._id,
      status: "pending",
    })
      .populate("to", "name username avatar")
      .sort({ createdAt: -1 });

    res.json({
      incoming: incoming.map((r) => ({
        id: r._id,
        user: publicUser(r.from),
        createdAt: r.createdAt,
      })),
      outgoing: outgoing.map((r) => ({
        id: r._id,
        user: publicUser(r.to),
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.respondFriendRequest = async (req, res, next) => {
  try {
    const { requestId, accept } = req.body;
    const request = await FriendRequest.findById(requestId);

    if (!request || request.status !== "pending") {
      res.status(404);
      throw new Error("Friend request not found");
    }
    if (String(request.to) !== String(req.user._id)) {
      res.status(403);
      throw new Error("Not allowed to respond to this request");
    }

    if (!accept) {
      request.status = "rejected";
      await request.save();
      return res.json({ success: true, status: "rejected" });
    }

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(request.from, {
      $addToSet: { friends: request.to },
    });
    await User.findByIdAndUpdate(request.to, {
      $addToSet: { friends: request.from },
    });

    res.json({ success: true, status: "accepted" });
  } catch (error) {
    next(error);
  }
};

exports.listFriends = async (req, res, next) => {
  try {
    const me = await User.findById(req.user._id)
      .populate("friends", "name username avatar bio friends createdAt")
      .select("friends");

    res.json({
      friends: (me.friends || []).map(publicUser),
    });
  } catch (error) {
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const friendId = req.params.friendId;
    const me = await User.findById(req.user._id);

    if (!areFriends(me, friendId)) {
      res.status(403);
      throw new Error("You can only chat with friends");
    }

    const messages = await Message.find({
      $or: [
        { sender: me._id, recipient: friendId },
        { sender: friendId, recipient: me._id },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    await Message.updateMany(
      { sender: friendId, recipient: me._id, read: false },
      { $set: { read: true } }
    );

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const friendId = req.params.friendId;
    const text = String(req.body.text || "").trim();

    if (!text) {
      res.status(400);
      throw new Error("Message text is required");
    }

    const me = await User.findById(req.user._id);
    if (!areFriends(me, friendId)) {
      res.status(403);
      throw new Error("You can only chat with friends");
    }

    const message = await Message.create({
      sender: me._id,
      recipient: friendId,
      text: text.slice(0, 2000),
    });

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

exports.listConversations = async (req, res, next) => {
  try {
    const meId = req.user._id;
    const me = await User.findById(meId).populate(
      "friends",
      "name username avatar"
    );

    const conversations = [];
    for (const friend of me.friends || []) {
      const last = await Message.findOne({
        $or: [
          { sender: meId, recipient: friend._id },
          { sender: friend._id, recipient: meId },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();

      const unread = await Message.countDocuments({
        sender: friend._id,
        recipient: meId,
        read: false,
      });

      conversations.push({
        friend: publicUser(friend),
        lastMessage: last || null,
        unread,
      });
    }

    conversations.sort((a, b) => {
      const at = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const bt = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return bt - at;
    });

    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

exports.friendsFeed = async (req, res, next) => {
  try {
    const me = await User.findById(req.user._id);
    const ids = [me._id, ...(me.friends || [])];

    const images = await Image.find({
      user: { $in: ids },
      isPublic: true,
    })
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();

    res.json({ images });
  } catch (error) {
    next(error);
  }
};
