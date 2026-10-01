const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const sanitizeUsername = (raw) =>
  String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  credits: user.credits,
  avatar: user.avatar,
  bio: user.bio || "",
  folders: user.folders,
  friendsCount: user.friends?.length || 0,
  createdAt: user.createdAt,
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
      res.status(400);
      throw new Error("Name, username, email, and password are required");
    }

    const cleanUsername = sanitizeUsername(username);
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      res.status(400);
      throw new Error("Username must be 3–20 characters (letters, numbers, _)");
    }

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      res.status(400);
      throw new Error("User already exists with this email");
    }

    const usernameExists = await User.findOne({ username: cleanUsername });
    if (usernameExists) {
      res.status(400);
      throw new Error("Username is already taken");
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username: cleanUsername,
      email: email.toLowerCase(),
      password: hashed,
      credits: 50,
    });

    res.status(201).json({
      token: signToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      return next(new Error("Email or username already in use"));
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    // Backfill username for accounts created before social IDs
    if (!user.username) {
      let base =
        String(user.email.split("@")[0] || "user")
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "")
          .slice(0, 12) || "user";
      let candidate = base;
      let n = 0;
      while (await User.findOne({ username: candidate, _id: { $ne: user._id } })) {
        n += 1;
        candidate = `${base}${n}`.slice(0, 20);
      }
      user.username = candidate;
      await user.save();
    }

    res.json({
      token: signToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({ user: sanitizeUser(req.user) });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, bio, username } = req.body;
    if (name) req.user.name = name;
    if (avatar !== undefined) req.user.avatar = avatar;
    if (bio !== undefined) req.user.bio = String(bio).slice(0, 200);

    if (username) {
      const cleanUsername = sanitizeUsername(username);
      if (cleanUsername.length < 3 || cleanUsername.length > 20) {
        res.status(400);
        throw new Error("Username must be 3–20 characters (letters, numbers, _)");
      }
      if (cleanUsername !== req.user.username) {
        const taken = await User.findOne({ username: cleanUsername });
        if (taken) {
          res.status(400);
          throw new Error("Username is already taken");
        }
        req.user.username = cleanUsername;
      }
    }

    await req.user.save();
    res.json({ user: sanitizeUser(req.user) });
  } catch (error) {
    next(error);
  }
};
