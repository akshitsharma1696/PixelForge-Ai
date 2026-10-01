const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    prompt: { type: String, required: true },
    enhancedPrompt: { type: String, default: "" },
    photoUrl: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    cloudinaryId: { type: String, default: "" },
    mode: {
      type: String,
      enum: ["text-to-image", "image-to-image", "variation", "upscale", "bg-remove"],
      default: "text-to-image",
    },
    style: { type: String, default: "Realistic" },
    aspectRatio: { type: String, default: "1:1" },
    tags: [{ type: String }],
    folder: { type: String, default: "all" },
    isPublic: { type: Boolean, default: true },
    authorName: { type: String, default: "" },
    authorUsername: { type: String, default: "" },
    sourceImageUrl: { type: String, default: "" },
    metadata: {
      provider: { type: String, default: "" },
      width: Number,
      height: Number,
    },
  },
  { timestamps: true }
);

imageSchema.index({ prompt: "text", tags: "text", authorName: "text" });

imageSchema.pre("save", function syncUrl(next) {
  if (this.photoUrl && !this.imageUrl) this.imageUrl = this.photoUrl;
  if (this.imageUrl && !this.photoUrl) this.photoUrl = this.imageUrl;
  next();
});

imageSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.imageUrl = ret.imageUrl || ret.photoUrl;
    ret.photoUrl = ret.photoUrl || ret.imageUrl;
    return ret;
  },
});

module.exports = mongoose.model("Image", imageSchema);
