const fetch = require("node-fetch");
const Image = require("../models/Image");
const User = require("../models/User");
const { uploadImageBuffer } = require("../config/cloudinary");
const {
  GENERATION_COST,
  PROCESS_COST,
  VARIATION_COST,
  requireCredits,
  deductCredits,
} = require("../utils/credits");
const { enhancePrompt, autoTagsFromPrompt } = require("../utils/promptEnhancer");
const {
  generateTextToImage,
  imageToImageStability,
  generateVariations,
  upscaleWithStability,
  removeBackgroundClipdrop,
} = require("../utils/aiProviders");

const persistImage = async ({
  user,
  prompt,
  enhancedPrompt,
  buffer,
  mode,
  style,
  aspectRatio,
  sourceImageUrl,
  provider,
  isPublic = true,
}) => {
  const uploaded = await uploadImageBuffer(buffer, "pixelforge_generations");
  const tags = autoTagsFromPrompt(enhancedPrompt || prompt);
  const url = uploaded.secure_url;

  const doc = await Image.create({
    user: user._id,
    prompt,
    enhancedPrompt: enhancedPrompt || "",
    photoUrl: url,
    imageUrl: url,
    cloudinaryId: uploaded.public_id,
    mode,
    style,
    aspectRatio,
    tags,
    authorName: user.name,
    authorUsername: user.username || "",
    sourceImageUrl: sourceImageUrl || "",
    isPublic,
    metadata: {
      provider,
      width: uploaded.width,
      height: uploaded.height,
    },
  });

  return doc;
};

const bufferFromUrl = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch source image");
  return Buffer.from(await response.arrayBuffer());
};

const loadUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }
  return user;
};

exports.enhance = async (req, res, next) => {
  try {
    const { prompt, style } = req.body;
    if (!prompt?.trim()) {
      res.status(400);
      throw new Error("Prompt is required");
    }
    const enhanced = enhancePrompt(prompt, style);
    res.json({ enhanced });
  } catch (error) {
    next(error);
  }
};

/**
 * Text to Image Generation Controller
 * Clean try-catch flow:
 * 1. Call AI -> 2. Upload to Cloudinary -> 3. Deduct Credits -> 4. Save to DB
 */
exports.textToImage = async (req, res, next) => {
  try {
    const { prompt, style = "Realistic", aspectRatio = "1:1", enhance = true } =
      req.body;

    console.log("========================================");
    console.log("[BACKEND] IMAGE GENERATION REQUEST RECEIVED");
    console.log("========================================");
    console.log("[BACKEND] Request body:", req.body);
    console.log("[BACKEND] Request body JSON:", JSON.stringify(req.body, null, 2));
    console.log("[BACKEND] Prompt received:", req.body?.prompt);
    console.log("[BACKEND] Style received:", req.body?.style);
    console.log("[BACKEND] Aspect ratio received:", req.body?.aspectRatio);

    if (!prompt?.trim()) {
      res.status(400);
      throw new Error("Prompt is required");
    }

    console.log(`[BACKEND] Loading user ${req.user._id}...`);
    const user = await loadUser(req.user._id);
    console.log(`[BACKEND] User loaded — ${user.name}, credits: ${user.credits}`);

    // Verify credits before calling external APIs (does not deduct yet)
    requireCredits(user, GENERATION_COST);
    const finalPrompt = enhance ? enhancePrompt(prompt, style) : prompt.trim();
    console.log(`[BACKEND] FINAL MODEL PROMPT:`, finalPrompt);

    // 1. Call AI
    console.log(`[BACKEND] 1. Calling Stability AI with final prompt: "${finalPrompt}" (aspectRatio: ${aspectRatio})...`);
    const { buffer, provider } = await generateTextToImage(finalPrompt, aspectRatio);
    console.log(`[BACKEND] Stability AI generated buffer received (size: ${buffer.length} bytes, provider: ${provider})`);

    // 2. Upload to Cloudinary
    console.log(`[BACKEND] 2. Uploading to Cloudinary...`);
    const uploaded = await uploadImageBuffer(buffer, "pixelforge_generations");
    const url = uploaded.secure_url;
    console.log(`[BACKEND] Cloudinary upload success — Secure URL:`, url);

    // 3. Deduct Credits (only happens after Cloudinary succeeds)
    console.log(`[BACKEND] 3. Deducting Credits...`);
    const credits = await deductCredits(user, GENERATION_COST);

    // 4. Save to DB
    console.log(`[DATABASE] Saving generated image`);
    console.log(`[DATABASE] Prompt:`, prompt.trim());
    console.log(`[DATABASE] Image URL:`, url);
    const tags = autoTagsFromPrompt(finalPrompt);
    const image = await Image.create({
      user: user._id,
      prompt: prompt.trim(),
      enhancedPrompt: finalPrompt,
      photoUrl: url,
      imageUrl: url,
      cloudinaryId: uploaded.public_id,
      mode: "text-to-image",
      style,
      aspectRatio,
      tags,
      authorName: user.name,
      authorUsername: user.username || "",
      isPublic: true,
      metadata: { provider, width: uploaded.width, height: uploaded.height },
    });

    console.log(`[BACKEND] Returning generated image URL:`, url);
    res.status(201).json({
      image,
      credits,
      cost: GENERATION_COST,
    });
  } catch (error) {
    console.error(`[Generate] textToImage FAILED:`, error.message || error);
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.generateImage = exports.textToImage;

exports.imageToImage = async (req, res, next) => {
  try {
    const { prompt, style = "Realistic", aspectRatio = "1:1" } = req.body;
    if (!req.file) {
      res.status(400);
      throw new Error("Source image file is required");
    }
    if (!prompt?.trim()) {
      res.status(400);
      throw new Error("Prompt is required");
    }

    const user = await loadUser(req.user._id);
    requireCredits(user, GENERATION_COST);

    const finalPrompt = enhancePrompt(prompt, style);
    
    // 1. Call AI
    const { buffer, provider } = await imageToImageStability(
      finalPrompt,
      req.file.buffer
    );

    // 2. Upload source & generated image to Cloudinary
    const sourceUpload = await uploadImageBuffer(
      req.file.buffer,
      "pixelforge_generations/sources"
    );

    // 3. Upload & Save generated image
    const image = await persistImage({
      user,
      prompt: prompt.trim(),
      enhancedPrompt: finalPrompt,
      buffer,
      mode: "image-to-image",
      style,
      aspectRatio,
      sourceImageUrl: sourceUpload.secure_url,
      provider,
    });

    // 4. Deduct Credits (only after successful upload and persist)
    const credits = await deductCredits(user, GENERATION_COST);

    res.status(201).json({
      image,
      credits,
      cost: GENERATION_COST,
    });
  } catch (error) {
    console.error(`[Generate] imageToImage FAILED:`, error.message || error);
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.variations = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    let sourceBuffer = req.file?.buffer;

    if (!sourceBuffer && imageUrl) {
      sourceBuffer = await bufferFromUrl(imageUrl);
    }
    if (!sourceBuffer) {
      res.status(400);
      throw new Error("Provide an image file or imageUrl");
    }

    const user = await loadUser(req.user._id);
    requireCredits(user, VARIATION_COST);

    // 1. Call AI
    const results = await generateVariations(
      sourceBuffer,
      "same subject and composition, high quality creative variation, detailed"
    );
    const images = [];

    // 2. Upload to Cloudinary & Save to DB
    for (const item of results) {
      const doc = await persistImage({
        user,
        prompt: "Image variation",
        enhancedPrompt: "Stability SDXL variation of source image",
        buffer: item.buffer,
        mode: "variation",
        style: "Realistic",
        aspectRatio: "1:1",
        sourceImageUrl: imageUrl || "",
        provider: item.provider,
      });
      images.push(doc);
    }

    // 3. Deduct Credits (only after all uploads succeed)
    const credits = await deductCredits(user, VARIATION_COST);

    res.status(201).json({
      images,
      credits,
      cost: VARIATION_COST,
    });
  } catch (error) {
    console.error(`[Generate] variations FAILED:`, error.message || error);
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.upscale = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    let sourceBuffer = req.file?.buffer;
    if (!sourceBuffer && imageUrl) {
      sourceBuffer = await bufferFromUrl(imageUrl);
    }
    if (!sourceBuffer) {
      res.status(400);
      throw new Error("Provide an image file or imageUrl");
    }

    const user = await loadUser(req.user._id);
    requireCredits(user, PROCESS_COST);

    // 1. Call AI
    const { buffer, provider } = await upscaleWithStability(sourceBuffer);

    // 2. Upload to Cloudinary & Save to DB
    const image = await persistImage({
      user,
      prompt: "AI Upscale",
      enhancedPrompt: "Super-resolution upscale",
      buffer,
      mode: "upscale",
      style: "Realistic",
      aspectRatio: "1:1",
      sourceImageUrl: imageUrl || "",
      provider,
      isPublic: false,
    });

    // 3. Deduct Credits
    const credits = await deductCredits(user, PROCESS_COST);

    res.status(201).json({
      image,
      credits,
      cost: PROCESS_COST,
    });
  } catch (error) {
    console.error(`[Generate] upscale FAILED:`, error.message || error);
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.removeBackground = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    let sourceBuffer = req.file?.buffer;
    if (!sourceBuffer && imageUrl) {
      sourceBuffer = await bufferFromUrl(imageUrl);
    }
    if (!sourceBuffer) {
      res.status(400);
      throw new Error("Provide an image file or imageUrl");
    }

    const user = await loadUser(req.user._id);
    requireCredits(user, PROCESS_COST);

    // 1. Call AI
    const { buffer, provider } = await removeBackgroundClipdrop(sourceBuffer);

    // 2. Upload to Cloudinary & Save to DB
    const image = await persistImage({
      user,
      prompt: "Background removal",
      enhancedPrompt: "Transparent background cleanup",
      buffer,
      mode: "bg-remove",
      style: "Realistic",
      aspectRatio: "1:1",
      sourceImageUrl: imageUrl || "",
      provider,
      isPublic: false,
    });

    // 3. Deduct Credits
    const credits = await deductCredits(user, PROCESS_COST);

    res.status(201).json({
      image,
      credits,
      cost: PROCESS_COST,
    });
  } catch (error) {
    console.error(`[Generate] removeBackground FAILED:`, error.message || error);
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

