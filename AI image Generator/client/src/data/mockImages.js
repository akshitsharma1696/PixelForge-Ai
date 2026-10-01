export const GALLERY_TAGS = [
  "All",
  "Nature",
  "3D",
  "Artistic",
  "Cyberpunk",
  "Portrait",
  "Abstract",
  "Fantasy",
];

export const STYLE_PRESETS = [
  "Cyberpunk",
  "Realistic",
  "Anime",
  "Oil Paint",
  "3D Render",
  "Watercolor",
];

export const ASPECT_RATIOS = [
  { id: "square", label: "Square", value: "1:1" },
  { id: "portrait", label: "Portrait", value: "3:4" },
  { id: "landscape", label: "Landscape", value: "16:9" },
];

export const GALLERY_IMAGES = [
  {
    id: "g1",
    photo:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop",
    author: "Maya Chen",
    prompt:
      "Misty mountain peak at dawn, soft golden light, cinematic atmosphere, ultra detailed",
    tags: ["Nature", "Artistic"],
    settings: { style: "Realistic", aspect: "3:4", steps: 30 },
    height: 280,
  },
  {
    id: "g2",
    photo:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=500&fit=crop",
    author: "Alex Rivera",
    prompt:
      "Abstract fluid geometry, neon cyan and magenta, 3D glass refraction, dark background",
    tags: ["3D", "Abstract"],
    settings: { style: "3D Render", aspect: "1:1", steps: 28 },
    height: 200,
  },
  {
    id: "g3",
    photo:
      "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=600&h=700&fit=crop",
    author: "Jordan Lee",
    prompt:
      "Cyberpunk street market at night, rain reflections, holographic signs, neon glow",
    tags: ["Cyberpunk", "Artistic"],
    settings: { style: "Cyberpunk", aspect: "3:4", steps: 35 },
    height: 260,
  },
  {
    id: "g4",
    photo:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=450&fit=crop",
    author: "Sam Okonkwo",
    prompt:
      "Oil painting of a quiet coastal village, warm sunset palette, impressionist brushwork",
    tags: ["Artistic", "Nature"],
    settings: { style: "Oil Paint", aspect: "16:9", steps: 25 },
    height: 180,
  },
  {
    id: "g5",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=750&fit=crop",
    author: "Priya Nair",
    prompt:
      "Portrait of a woman with silver hair, soft studio lighting, shallow depth of field",
    tags: ["Portrait", "Realistic"],
    settings: { style: "Realistic", aspect: "3:4", steps: 32 },
    height: 300,
  },
  {
    id: "g6",
    photo:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=550&fit=crop",
    author: "Chris Park",
    prompt:
      "Fantasy crystal forest, bioluminescent plants, ethereal fog, magical realism",
    tags: ["Fantasy", "Nature"],
    settings: { style: "Fantasy", aspect: "1:1", steps: 40 },
    height: 220,
  },
  {
    id: "g7",
    photo:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&h=400&fit=crop",
    author: "Elena Voss",
    prompt:
      "Geometric architecture in desert dunes, brutalist forms, harsh midday sun",
    tags: ["3D", "Abstract"],
    settings: { style: "3D Render", aspect: "16:9", steps: 28 },
    height: 160,
  },
  {
    id: "g8",
    photo:
      "https://images.unsplash.com/photo-1614728263952-84ea256f9670?w=600&h=720&fit=crop",
    author: "Noah Kim",
    prompt:
      "Anime-style character standing on a rooftop overlooking neon Tokyo skyline",
    tags: ["Artistic", "Cyberpunk"],
    settings: { style: "Anime", aspect: "3:4", steps: 30 },
    height: 270,
  },
  {
    id: "g9",
    photo:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=480&fit=crop",
    author: "Riley Brooks",
    prompt:
      "Rolling green hills under dramatic storm clouds, wide landscape, natural light",
    tags: ["Nature"],
    settings: { style: "Realistic", aspect: "16:9", steps: 24 },
    height: 190,
  },
  {
    id: "g10",
    photo:
      "https://images.unsplash.com/photo-1634017839464-5c339bbe3c47?w=600&h=600&fit=crop",
    author: "Taylor Quinn",
    prompt:
      "Surreal floating islands in pastel sky, dreamlike watercolor textures",
    tags: ["Fantasy", "Artistic"],
    settings: { style: "Watercolor", aspect: "1:1", steps: 26 },
    height: 240,
  },
  {
    id: "g11",
    photo:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=680&fit=crop",
    author: "Morgan Hale",
    prompt:
      "Close-up of chrome android face, reflective surfaces, sci-fi portrait lighting",
    tags: ["3D", "Portrait"],
    settings: { style: "3D Render", aspect: "3:4", steps: 36 },
    height: 250,
  },
  {
    id: "g12",
    photo:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=420&fit=crop",
    author: "Casey Tran",
    prompt:
      "Deep space nebula with swirling purple and teal gas clouds, starfield background",
    tags: ["Abstract", "Fantasy"],
    settings: { style: "Realistic", aspect: "16:9", steps: 30 },
    height: 170,
  },
];

export const LIBRARY_FOLDERS = [
  { id: "all", name: "All Images", count: 8, color: "#007AFF" },
  { id: "favorites", name: "Favorites", count: 3, color: "#9747FF" },
  { id: "client", name: "Client Work", count: 2, color: "#12ff75" },
  { id: "experiments", name: "Experiments", count: 3, color: "#F7AD63" },
];

export const LIBRARY_IMAGES = [
  {
    id: "l1",
    photo:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    prompt: "Misty mountain peak at dawn",
    folder: "favorites",
    createdAt: "2026-07-20",
  },
  {
    id: "l2",
    photo:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop",
    prompt: "Abstract fluid geometry neon",
    folder: "experiments",
    createdAt: "2026-07-21",
  },
  {
    id: "l3",
    photo:
      "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=400&h=400&fit=crop",
    prompt: "Cyberpunk street market rain",
    folder: "client",
    createdAt: "2026-07-22",
  },
  {
    id: "l4",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    prompt: "Portrait silver hair studio",
    folder: "favorites",
    createdAt: "2026-07-23",
  },
  {
    id: "l5",
    photo:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop",
    prompt: "Fantasy crystal forest",
    folder: "experiments",
    createdAt: "2026-07-24",
  },
  {
    id: "l6",
    photo:
      "https://images.unsplash.com/photo-1614728263952-84ea256f9670?w=400&h=400&fit=crop",
    prompt: "Anime character neon Tokyo",
    folder: "client",
    createdAt: "2026-07-25",
  },
  {
    id: "l7",
    photo:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop",
    prompt: "Rolling green hills storm",
    folder: "favorites",
    createdAt: "2026-07-26",
  },
  {
    id: "l8",
    photo:
      "https://images.unsplash.com/photo-1634017839464-5c339bbe3c47?w=400&h=400&fit=crop",
    prompt: "Surreal floating islands pastel",
    folder: "experiments",
    createdAt: "2026-07-27",
  },
];

export const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 499,
    credits: 100,
    features: ["100 credits", "Text-to-image", "Community gallery"],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    credits: 350,
    features: [
      "350 credits",
      "Image-to-image & variations",
      "Upscale + BG remove",
      "Priority queue",
    ],
    highlighted: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: 2499,
    credits: 1000,
    features: [
      "1000 credits",
      "All Pro tools",
      "Commercial license",
      "Team folders",
    ],
    highlighted: false,
  },
];

export const PLACEHOLDER_RESULT =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop";

export const PLACEHOLDER_UPSCALED =
  "https://images.unsplash.com/photo-1634017839464-5c339bbe3c47?w=1000&h=1000&fit=crop";

export const AI_GENERATED_PRESETS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=1200&fit=crop", // Abstract 3D
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&h=1200&fit=crop", // Cyberpunk
  "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1200&h=1200&fit=crop", // Space/Sci-fi
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&h=1200&fit=crop", // Futuristic Interior
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&h=1200&fit=crop", // Oil art
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=1200&fit=crop", // Crystal forest
  "https://images.unsplash.com/photo-1634017839464-5c339bbe3c47?w=1200&h=1200&fit=crop", // Surreal fantasy
];
