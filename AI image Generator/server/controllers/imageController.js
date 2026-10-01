const Image = require("../models/Image");
const User = require("../models/User");

exports.getCommunity = async (req, res, next) => {
  try {
    const { tag, q } = req.query;
    const filter = { isPublic: true };

    if (tag && tag !== "All") {
      filter.tags = { $regex: new RegExp(`^${tag}$`, "i") };
    }

    if (q?.trim()) {
      filter.$or = [
        { prompt: { $regex: q, $options: "i" } },
        { authorName: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    const images = await Image.find(filter)
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();

    res.json({ images });
  } catch (error) {
    next(error);
  }
};

exports.getLibrary = async (req, res, next) => {
  try {
    const { folder } = req.query;
    const filter = { user: req.user._id };
    if (folder && folder !== "all") {
      filter.folder = folder;
    }

    const images = await Image.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ images, folders: req.user.folders });
  } catch (error) {
    next(error);
  }
};

exports.updateImage = async (req, res, next) => {
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!image) {
      res.status(404);
      throw new Error("Image not found");
    }

    const { folder, isPublic, tags } = req.body;
    if (folder !== undefined) image.folder = folder;
    if (isPublic !== undefined) image.isPublic = isPublic;
    if (tags !== undefined) image.tags = tags;

    await image.save();
    res.json({ image });
  } catch (error) {
    next(error);
  }
};

exports.deleteImages = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400);
      throw new Error("Provide an array of image ids");
    }

    await Image.deleteMany({ _id: { $in: ids }, user: req.user._id });
    res.json({ message: "Deleted", count: ids.length });
  } catch (error) {
    next(error);
  }
};

exports.moveImages = async (req, res, next) => {
  try {
    const { ids, folder } = req.body;
    if (!Array.isArray(ids) || !folder) {
      res.status(400);
      throw new Error("ids and folder are required");
    }

    await Image.updateMany(
      { _id: { $in: ids }, user: req.user._id },
      { $set: { folder } }
    );

    res.json({ message: "Moved", folder });
  } catch (error) {
    next(error);
  }
};

exports.createFolder = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    if (!name?.trim()) {
      res.status(400);
      throw new Error("Folder name is required");
    }

    const user = await User.findById(req.user._id);
    user.folders.push({ name: name.trim(), color: color || "#007AFF" });
    await user.save();
    res.status(201).json({ folders: user.folders });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalImages = await Image.countDocuments({ user: req.user._id });
    const publicImages = await Image.countDocuments({
      user: req.user._id,
      isPublic: true,
    });
    const recent = await Image.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    res.json({
      credits: req.user.credits,
      totalImages,
      publicImages,
      folders: req.user.folders?.length || 0,
      recent,
    });
  } catch (error) {
    next(error);
  }
};
