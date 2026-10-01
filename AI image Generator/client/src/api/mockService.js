import {
  GALLERY_IMAGES,
  GALLERY_TAGS,
  LIBRARY_FOLDERS,
  LIBRARY_IMAGES,
  PRICING_PLANS,
  AI_GENERATED_PRESETS,
} from "../data/mockImages";

const DEMO_CREDITS_KEY = "pf_demo_credits";
const DEMO_USER_KEY = "pf_demo_user";
const DEMO_CREATIONS_KEY = "pf_demo_creations";
const DEMO_LIBRARY_KEY = "pf_demo_library";

export function getDemoCredits() {
  const saved = localStorage.getItem(DEMO_CREDITS_KEY);
  if (saved !== null) return parseInt(saved, 10);
  localStorage.setItem(DEMO_CREDITS_KEY, "99");
  return 99;
}

export function setDemoCredits(amount) {
  const val = Math.max(0, amount);
  localStorage.setItem(DEMO_CREDITS_KEY, val.toString());
  return val;
}

export function getDemoUser() {
  const saved = localStorage.getItem(DEMO_USER_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      parsed.credits = getDemoCredits();
      return parsed;
    } catch {
      /* ignore */
    }
  }
  const defaultUser = {
    _id: "demo-user-001",
    name: "Alex Rivera",
    username: "alex_ai",
    email: "admin@pixel.com",
    credits: getDemoCredits(),
    bio: "Senior AI Visual Designer & Prompt Artist",
    avatar: "",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(defaultUser));
  return defaultUser;
}

export function saveDemoUser(user) {
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  if (user?.credits !== undefined) {
    setDemoCredits(user.credits);
  }
}

export function getDemoCreations() {
  const saved = localStorage.getItem(DEMO_CREATIONS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      /* ignore */
    }
  }
  const initial = [
    {
      _id: "demo-gen-1",
      photoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&h=1000&fit=crop",
      prompt: "Abstract fluid geometry in neon violet and electric cyan, 3D iridescent crystal glass refraction",
      style: "3D Render",
      aspectRatio: "1:1",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      _id: "demo-gen-2",
      photoUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1000&h=1000&fit=crop",
      prompt: "Cyberpunk android portrait with holographic reflections, neon rain-soaked city bokeh",
      style: "Cyberpunk",
      aspectRatio: "3:4",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      _id: "demo-gen-3",
      photoUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1000&h=1000&fit=crop",
      prompt: "Astral nebula gate orbiting a glowing blue hypergiant star, ultra-deep space photography",
      style: "Realistic",
      aspectRatio: "16:9",
      createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
    {
      _id: "demo-gen-4",
      photoUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1000&h=1000&fit=crop",
      prompt: "Futuristic minimalist architectural atrium with floor-to-ceiling smart glass in misty mountains",
      style: "3D Render",
      aspectRatio: "16:9",
      createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    },
  ];
  localStorage.setItem(DEMO_CREATIONS_KEY, JSON.stringify(initial));
  return initial;
}

export function addDemoCreation(item) {
  const list = getDemoCreations();
  const updated = [item, ...list];
  localStorage.setItem(DEMO_CREATIONS_KEY, JSON.stringify(updated));
  return updated;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let imageIndex = 0;

export const mockHandlers = {
  async authLogin(payload) {
    await sleep(400);
    const email = payload?.email || "admin@pixel.com";
    const name = email.split("@")[0] || "Alex Rivera";
    const username = name.toLowerCase().replace(/[^a-z0-9_]/g, "") || "alex_ai";
    const user = {
      _id: "demo-user-001",
      name: name.charAt(0).toUpperCase() + name.slice(1),
      username: username,
      email: email,
      credits: getDemoCredits(),
      bio: "Generative AI Artist & Prompt Engineer",
      createdAt: new Date().toISOString(),
    };
    saveDemoUser(user);
    return {
      token: "demo-jwt-simulation-token",
      user,
    };
  },

  async authRegister(payload) {
    await sleep(500);
    const user = {
      _id: "demo-user-001",
      name: payload?.name || "Alex Rivera",
      username: payload?.username || "alex_ai",
      email: payload?.email || "admin@pixel.com",
      credits: getDemoCredits(),
      bio: "Generative AI Artist & Prompt Engineer",
      createdAt: new Date().toISOString(),
    };
    saveDemoUser(user);
    return {
      token: "demo-jwt-simulation-token",
      user,
    };
  },

  async authMe() {
    await sleep(150);
    return {
      user: getDemoUser(),
    };
  },

  async updateProfile(payload) {
    await sleep(300);
    const current = getDemoUser();
    const updated = { ...current, ...payload };
    saveDemoUser(updated);
    return { user: updated };
  },

  async generateEnhance(payload) {
    await sleep(600);
    const prompt = payload?.prompt || "";
    const style = payload?.style || "cinematic";
    const enhanced = `${prompt}, ${style} style, 8k resolution, highly detailed, octane render, volumetric lighting, photorealistic masterpiece, vivid color grading, intricate textures`;
    return { enhanced };
  },

  async textToImage(payload) {
    await sleep(2400); // 2.4 second simulation
    const presets = AI_GENERATED_PRESETS && AI_GENERATED_PRESETS.length > 0 ? AI_GENERATED_PRESETS : [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=1200&fit=crop",
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&h=1200&fit=crop",
      "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1200&h=1200&fit=crop",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&h=1200&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&h=1200&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=1200&fit=crop",
      "https://images.unsplash.com/photo-1634017839464-5c339bbe3c47?w=1200&h=1200&fit=crop",
    ];

    const chosenUrl = presets[imageIndex % presets.length];
    imageIndex++;

    console.log("🚨 [IMAGE FALLBACK] FALLBACK / MOCK IMAGE IS BEING USED 🚨");
    console.log("[IMAGE FALLBACK] Source: mockService.js textToImage (Preset Unsplash Image)");
    console.log("[IMAGE FALLBACK] Preset index:", (imageIndex - 1) % presets.length);
    console.log("[IMAGE FALLBACK] Image URL:", chosenUrl);
    if (chosenUrl.includes("photo-1614728263952-84ea256f9679")) {
      console.log("🚀 [IMAGE FALLBACK] THIS IS THE SPACE / ROCKET SHUTTLE IMAGE (photo-1614728263952-84ea256f9679) 🚀");
    }

    const currentCredits = getDemoCredits();
    const newCredits = setDemoCredits(currentCredits - 5);

    const creation = {
      _id: `demo-gen-${Date.now()}`,
      photoUrl: chosenUrl,
      prompt: payload?.prompt || "Futuristic masterpiece artwork",
      style: payload?.style || "Realistic",
      aspectRatio: payload?.aspectRatio || "1:1",
      createdAt: new Date().toISOString(),
    };
    addDemoCreation(creation);

    return {
      imageUrl: chosenUrl,
      photoUrl: chosenUrl,
      prompt: creation.prompt,
      credits: newCredits,
      id: creation._id,
      _id: creation._id,
    };
  },

  async imageToImage(formData) {
    await sleep(2600);
    const presets = [
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&h=1200&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=1200&fit=crop",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&h=1200&fit=crop",
    ];
    const chosenUrl = presets[Math.floor(Math.random() * presets.length)];
    const currentCredits = getDemoCredits();
    const newCredits = setDemoCredits(currentCredits - 5);

    return {
      imageUrl: chosenUrl,
      photoUrl: chosenUrl,
      credits: newCredits,
      _id: `remix-${Date.now()}`,
    };
  },

  async variations(payload) {
    await sleep(2200);
    const variations = [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&h=800&fit=crop",
    ];
    return { variations };
  },

  async upscale(payload) {
    await sleep(1800);
    const upscaledUrl =
      payload?.imageUrl ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&h=1600&fit=crop";
    return {
      upscaledUrl,
      photoUrl: upscaledUrl,
      imageUrl: upscaledUrl,
      message: "Image upscaled to 4K resolution",
    };
  },

  async removeBg(payload) {
    await sleep(1800);
    const cutoutUrl =
      payload?.imageUrl ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&h=1000&fit=crop";
    return {
      cutoutUrl,
      photoUrl: cutoutUrl,
      imageUrl: cutoutUrl,
      message: "Background removed cleanly",
    };
  },

  async community(params) {
    await sleep(300);
    const tag = params?.tag;
    const q = (params?.q || "").toLowerCase().trim();

    let items = GALLERY_IMAGES.map((item) => ({
      _id: item.id,
      id: item.id,
      photoUrl: item.photo,
      imageUrl: item.photo,
      authorName: item.author,
      authorUsername: item.author.toLowerCase().replace(/\s+/g, "_"),
      prompt: item.prompt,
      tags: item.tags,
      settings: item.settings,
      height: item.height,
    }));

    if (tag && tag !== "All") {
      items = items.filter((x) =>
        x.tags?.some((t) => t.toLowerCase() === tag.toLowerCase())
      );
    }
    if (q) {
      items = items.filter(
        (x) =>
          x.prompt.toLowerCase().includes(q) ||
          x.authorName.toLowerCase().includes(q) ||
          x.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return { images: items };
  },

  async library(params) {
    await sleep(250);
    const userCreations = getDemoCreations();
    const mappedCreations = userCreations.map((c) => ({
      _id: c._id,
      photoUrl: c.photoUrl,
      prompt: c.prompt,
      folder: "all",
      createdAt: c.createdAt,
    }));

    const defaultLib = LIBRARY_IMAGES.map((img) => ({
      _id: img.id,
      photoUrl: img.photo,
      prompt: img.prompt,
      folder: img.folder || "favorites",
      createdAt: img.createdAt,
    }));

    return {
      images: [...mappedCreations, ...defaultLib],
      folders: LIBRARY_FOLDERS,
    };
  },

  async dashboard() {
    await sleep(200);
    const creations = getDemoCreations();
    const credits = getDemoCredits();
    return {
      credits,
      totalImages: creations.length + 8,
      publicImages: 6,
      folders: 4,
      recent: creations.slice(0, 4),
    };
  },

  async paymentsPlans() {
    await sleep(150);
    return { plans: PRICING_PLANS };
  },

  async paymentsOrder(planId) {
    await sleep(300);
    const plan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[0];
    return {
      orderId: `order_demo_${Date.now()}`,
      keyId: "rzp_test_simulation",
      amount: plan.price * 100,
      currency: "INR",
      planName: plan.name,
      credits: plan.credits,
    };
  },

  async paymentsUpiOrder(planId) {
    await sleep(300);
    const plan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[0];
    const upiRef = "PIXEL-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    return {
      orderId: `upi_demo_${Date.now()}`,
      upiRef,
      upiId: "demo@upi",
      upiUri: `upi://pay?pa=demo@upi&pn=PixelForge&am=${plan.price}&cu=INR&tn=PixelForge%20${plan.name}%20-%20${upiRef}`,
      amount: plan.price,
      credits: plan.credits,
      planId: plan.id,
      planName: plan.name,
      status: "pending",
    };
  },

  async paymentsVerify(payload) {
    await sleep(400);
    const current = getDemoCredits();
    const added = 100;
    const newTotal = setDemoCredits(current + added);
    return {
      credits: newTotal,
      added,
      alreadyProcessed: false,
    };
  },

  async socialFeed() {
    await sleep(300);
    return {
      feed: [
        {
          _id: "post-1",
          author: { name: "Maya Chen", username: "maya_chen", avatar: "" },
          photoUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
          prompt: "Misty mountain peak at dawn with ethereal morning radiance",
          likes: 42,
          commentsCount: 5,
          createdAt: "20m ago",
        },
        {
          _id: "post-2",
          author: { name: "Elena Voss", username: "elena_voss", avatar: "" },
          photoUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&h=600&fit=crop",
          prompt: "Minimalist brutalist architecture surrounded by undulating sand dunes",
          likes: 29,
          commentsCount: 3,
          createdAt: "1h ago",
        },
        {
          _id: "post-3",
          author: { name: "Chris Park", username: "chris_park", avatar: "" },
          photoUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop",
          prompt: "Bioluminescent crystal forest with glowing flora and fairy waterfalls",
          likes: 88,
          commentsCount: 12,
          createdAt: "3h ago",
        },
      ],
    };
  },

  async socialFriends() {
    await sleep(200);
    return {
      friends: [
        { _id: "f1", name: "Maya Chen", username: "maya_chen", status: "online" },
        { _id: "f2", name: "Jordan Lee", username: "jordan_lee", status: "offline" },
        { _id: "f3", name: "Elena Voss", username: "elena_voss", status: "online" },
      ],
      requests: [],
    };
  },

  async socialChat(friendId) {
    await sleep(200);
    return {
      messages: [
        {
          _id: "m1",
          sender: friendId,
          text: "Hey! Loved your recent Cyberpunk generation on PixelForge!",
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          _id: "m2",
          sender: "demo-user-001",
          text: "Thanks Maya! Used the SDXL prompt enhancer for the reflections.",
          createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        },
      ],
    };
  },

  async socialSendMessage(friendId, text) {
    await sleep(150);
    return {
      message: {
        _id: `msg-${Date.now()}`,
        sender: "demo-user-001",
        text,
        createdAt: new Date().toISOString(),
      },
    };
  },
};
