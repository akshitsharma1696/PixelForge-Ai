const STYLE_HINTS = {
  Cyberpunk:
    "neon-lit cyberpunk aesthetic, rain-slick streets, holographic glow, cinematic lighting",
  Realistic:
    "photorealistic, natural lighting, sharp focus, ultra detailed, 8k",
  Anime:
    "anime style, clean line art, vibrant colors, studio ghibli inspired composition",
  "Oil Paint":
    "oil painting, visible brush strokes, rich pigments, classical fine art",
  "3D Render":
    "octane render, unreal engine, soft global illumination, highly detailed 3D",
  Watercolor:
    "watercolor painting, soft washes, paper texture, delicate pigment blooms",
};

const enhancePrompt = (rawPrompt, style = "Realistic") => {
  const cleaned = (rawPrompt || "").trim().replace(/\s+/g, " ");
  if (!cleaned) return "";

  const styleHint = STYLE_HINTS[style] || STYLE_HINTS.Realistic;
  return `${cleaned}, ${styleHint}, professional composition, high quality, masterpiece`;
};

const autoTagsFromPrompt = (prompt = "") => {
  const dictionary = [
    "nature",
    "portrait",
    "cyberpunk",
    "fantasy",
    "abstract",
    "anime",
    "3d",
    "artistic",
    "city",
    "space",
    "animal",
    "architecture",
  ];

  const lower = prompt.toLowerCase();
  const tags = dictionary.filter((tag) => lower.includes(tag));

  if (tags.length === 0) {
    tags.push("artistic");
  }

  return [...new Set(tags.map((t) => t.charAt(0).toUpperCase() + t.slice(1)))].slice(
    0,
    5
  );
};

module.exports = { enhancePrompt, autoTagsFromPrompt };
