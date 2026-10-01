const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    color: { type: String, default: "#007AFF" },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: [/^[a-z0-9_]+$/, "Username can only use letters, numbers, and underscores"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    credits: { type: Number, default: 50 },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 200 },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    folders: {
      type: [folderSchema],
      default: [
        { name: "Favorites", color: "#FFD60A" },
        { name: "Projects", color: "#007AFF" },
        { name: "Archive", color: "#8E8E93" },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
