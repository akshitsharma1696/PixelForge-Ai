/**
 * PixelForge generation engine
 * Primary: Stability AI SDXL (DALL·E replacement)
 * Optional: OpenAI GPT Image (only when IMAGE_PROVIDER=openai|auto and key has credits)
 */
const OpenAI = require("openai");
const fetch = require("node-fetch");
const FormData = require("form-data");
const sharp = require("sharp");

const STABILITY_ENGINE =
  "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0";

const SD_SIZES = [
  [1024, 1024],
  [1152, 896],
  [1216, 832],
  [1344, 768],
  [1536, 640],
  [640, 1536],
  [768, 1344],
  [832, 1216],
  [896, 1152],
];

const aspectToSize = (aspectRatio = "1:1") => {
  if (aspectRatio === "16:9") return [1344, 768];
  if (aspectRatio === "3:4") return [896, 1152];
  return [1024, 1024];
};

const nearestSdSize = (width, height) => {
  const ratio = width / height;
  let best = SD_SIZES[0];
  let bestScore = Infinity;

  for (const [w, h] of SD_SIZES) {
    const score =
      Math.abs(w / h - ratio) + Math.abs(w * h - width * height) / 1e7;
    if (score < bestScore) {
      bestScore = score;
      best = [w, h];
    }
  }
  return best;
};

const resizeForSd = async (imageBuffer) => {
  const meta = await sharp(imageBuffer).metadata();
  const [targetW, targetH] = nearestSdSize(
    meta.width || 1024,
    meta.height || 1024
  );

  return sharp(imageBuffer)
    .rotate()
    .resize(targetW, targetH, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
};

const bufferFromUrl = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to download generated image");
  return Buffer.from(await response.arrayBuffer());
};

const requireStability = () => {
  if (!process.env.STABILITY_API_KEY) {
    throw new Error(
      "STABILITY_API_KEY is required. Stability AI is PixelForge's DALL·E replacement."
    );
  }
};

/** ---------- Stability AI SD v1.6 (primary) ---------- */

const parseStabilityJson = async (response, context = "") => {
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    console.error(`[Stability ${context}] Non-JSON response (${response.status}):`, text?.slice(0, 500));
    throw new Error(text || "Stability AI returned a non-JSON response");
  }
  if (!response.ok) {
    const detail =
      data?.message ||
      data?.name ||
      (Array.isArray(data?.errors) ? data.errors.join(", ") : null) ||
      text;
    console.error(`[Stability ${context}] API error ${response.status}:`, detail);
    throw new Error(detail || "Stability AI request failed");
  }
  console.log(`[Stability ${context}] Success — ${response.status}`);
  return data;
};

const generateWithStability = async (prompt, aspectRatio) => {
  requireStability();
  const [w, h] = aspectToSize(aspectRatio);

  const url = `${STABILITY_ENGINE}/text-to-image`;
  console.log("🔥🔥🔥 [STABILITY] ABOUT TO CALL STABILITY AI 🔥🔥🔥");
  console.log("[STABILITY] Prompt being sent:", prompt);
  console.log("[STABILITY] Model:", "stable-diffusion-xl-1024-v1-0");
  console.log("[STABILITY] Aspect ratio:", aspectRatio);
  console.log("[STABILITY] Resolution:", `${w}x${h}`);
  console.log("[STABILITY] Endpoint:", url);
  console.log("[STABILITY] API key exists:", Boolean(process.env.STABILITY_API_KEY));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 7,
      height: h,
      width: w,
      samples: 1,
      steps: 30,
    }),
  });

  console.log("✅ [STABILITY] RESPONSE RECEIVED");
  console.log("[STABILITY] Status:", response.status);
  console.log("[STABILITY] Content-Type:", response.headers.get("content-type"));

  const data = await parseStabilityJson(response, "text-to-image");
  const artifact = data.artifacts?.[0]?.base64;
  if (!artifact) throw new Error("Stability AI returned no image");

  const buffer = Buffer.from(artifact, "base64");
  console.log("[STABILITY] Binary image received");
  console.log("[STABILITY] Response buffer size (bytes):", buffer.length);

  return {
    buffer,
    provider: "stability-sdxl",
  };
};

const imageToImageStability = async (prompt, imageBuffer) => {
  requireStability();
  const resized = await resizeForSd(imageBuffer);

  const form = new FormData();
  form.append("init_image", resized, { filename: "init.png" });
  form.append("text_prompts[0][text]", prompt);
  form.append("text_prompts[0][weight]", "1");
  form.append("image_strength", "0.35");
  form.append("cfg_scale", "7");
  form.append("samples", "1");
  form.append("steps", "30");

  const url = `${STABILITY_ENGINE}/image-to-image`;
  console.log(`[Stability] POST ${url}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  const data = await parseStabilityJson(response, "image-to-image");

  const artifact = data.artifacts?.[0]?.base64;
  if (!artifact) throw new Error("Stability AI returned no image");
  return {
    buffer: Buffer.from(artifact, "base64"),
    provider: "stability-sdxl",
  };
};

/** 3 variations via SD v1.6 image-to-image (replaces DALL·E variations) */
const generateVariations = async (
  imageBuffer,
  prompt = "same subject, high quality variation, detailed"
) => {
  requireStability();
  const resized = await resizeForSd(imageBuffer);
  const strengths = [0.28, 0.4, 0.55];
  const results = [];

  for (const strength of strengths) {
    const form = new FormData();
    form.append("init_image", resized, { filename: "init.png" });
    form.append("text_prompts[0][text]", prompt);
    form.append("text_prompts[0][weight]", "1");
    form.append("image_strength", String(strength));
    form.append("cfg_scale", "7");
    form.append("samples", "1");
    form.append("steps", "30");
    form.append("seed", String(Math.floor(Math.random() * 1_000_000_000)));

    const response = await fetch(`${STABILITY_ENGINE}/image-to-image`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    const data = await parseStabilityJson(response, `variation-${strength}`);

    const artifact = data.artifacts?.[0]?.base64;
    if (artifact) {
      results.push({
        buffer: Buffer.from(artifact, "base64"),
        provider: "stability-sdxl",
      });
    }
  }

  if (!results.length) throw new Error("No variations were generated");
  return results;
};

const upscaleWithStability = async (imageBuffer) => {
  requireStability();

  const form = new FormData();
  form.append("image", imageBuffer, { filename: "image.png" });
  form.append("width", "2048");

  const response = await fetch(
    "https://api.stability.ai/v2beta/stable-image/upscale/fast",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        Accept: "image/*",
        ...form.getHeaders(),
      },
      body: form,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || "Upscale failed");
  }

  const arrayBuffer = await response.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), provider: "stability-upscale" };
};

/** ---------- Optional OpenAI (not used when IMAGE_PROVIDER=stability) ---------- */

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const GPT_IMAGE_SIZES = {
  "1:1": "1024x1024",
  "3:4": "1024x1536",
  "16:9": "1536x1024",
};

const generateWithOpenAI = async (prompt, aspectRatio) => {
  const openai = getOpenAI();
  if (!openai) throw new Error("OPENAI_API_KEY is not configured");

  const models = [
    process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
    "gpt-image-1",
    "gpt-image-1-mini",
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError;
  for (const model of models) {
    try {
      const response = await openai.images.generate({
        model,
        prompt,
        n: 1,
        size: GPT_IMAGE_SIZES[aspectRatio] || GPT_IMAGE_SIZES["1:1"],
        quality: process.env.OPENAI_IMAGE_QUALITY || "medium",
      });
      const item = response.data?.[0];
      if (item?.b64_json) {
        return {
          buffer: Buffer.from(item.b64_json, "base64"),
          provider: `openai:${model}`,
        };
      }
      if (item?.url) {
        return {
          buffer: await bufferFromUrl(item.url),
          provider: `openai:${model}`,
        };
      }
      throw new Error("OpenAI returned no image data");
    } catch (err) {
      lastError = err;
      if (
        /does not exist|not found|deprecated|credits|429|billing/i.test(
          err.message || ""
        )
      ) {
        console.warn(`OpenAI model ${model} skipped:`, err.message);
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error("OpenAI image generation unavailable");
};

const removeBackgroundClipdrop = async (imageBuffer) => {
  if (!process.env.CLIPDROP_API_KEY) {
    throw new Error("CLIPDROP_API_KEY is not configured");
  }

  const form = new FormData();
  form.append("image_file", imageBuffer, { filename: "image.png" });

  const response = await fetch("https://clipdrop-api.co/remove-background/v1", {
    method: "POST",
    headers: {
      "x-api-key": process.env.CLIPDROP_API_KEY,
      ...form.getHeaders(),
    },
    body: form,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || "Background removal failed");
  }

  const arrayBuffer = await response.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), provider: "clipdrop" };
};

/**
 * DALL·E replacement entrypoint — Stability SDXL by default.
 * Set IMAGE_PROVIDER=openai only if you have OpenAI image credits.
 */
const generateTextToImage = async (prompt, aspectRatio) => {
  const hasStability = Boolean(process.env.STABILITY_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const preference = (
    process.env.IMAGE_PROVIDER || (hasStability ? "stability" : "openai")
  ).toLowerCase();

  if (!hasStability && !hasOpenAI) {
    throw new Error(
      "Set STABILITY_API_KEY (recommended DALL·E replacement) or OPENAI_API_KEY in server/.env"
    );
  }

  if (preference === "openai" && hasOpenAI) {
    try {
      return await generateWithOpenAI(prompt, aspectRatio);
    } catch (err) {
      if (hasStability) {
        console.warn("OpenAI unavailable, using Stability SDXL:", err.message);
        return generateWithStability(prompt, aspectRatio);
      }
      throw err;
    }
  }

  // Default path: Stability SDXL
  if (hasStability) {
    return generateWithStability(prompt, aspectRatio);
  }

  return generateWithOpenAI(prompt, aspectRatio);
};

module.exports = {
  generateTextToImage,
  imageToImageStability,
  generateVariations,
  /** @deprecated use generateVariations — kept for compatibility */
  variationsWithOpenAI: generateVariations,
  upscaleWithStability,
  removeBackgroundClipdrop,
  resizeForSd,
};
