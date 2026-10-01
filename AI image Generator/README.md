# PixelForge AI

Full-stack MERN creative suite for AI image generation — sidebar workspace (not a chatbot). Styled with **styled-components** only (no Tailwind).

## Stack


- **client/** — React + Vite + styled-components
- **server/** — Express + MongoDB + JWT + Cloudinary + Razorpay + **Stability SDXL** (DALL·E replacement; OpenAI optional)

## Theme
      
| Token      | Value     |      
| ---------- | --------- |
| Background | `#121212` |
| Cards      | `#1C1E21` |  
| Primary    | `#007AFF` |

## Setup

### 1. server

```bash
cd server
cp .env.example .env
# Fill MONGO_URI, JWT_SECRET, Cloudinary, Razorpay, and at least one AI key
npm install
npm run dev
```

### 2. Client

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 — API defaults to http://localhost:8080/api.

### Required `.env` keys (`server/.env`)

See `server/.env.example` for:

- `MONGO_URI`, `JWT_SECRET`
- `STABILITY_API_KEY` (primary image engine — replaces DALL·E)
- `IMAGE_PROVIDER=stability` (optional OpenAI only if you have credits)
- `OPENAI_API_KEY` (optional)
- `CLOUDINARY_*`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `CLIPDROP_API_KEY` (background removal)

## Payments (Razorpay)

1. Frontend calls `POST /api/billing/create-order`
2. Backend creates a Razorpay Order (INR) and returns `order_id` + public `keyId`
3. Frontend opens Razorpay Checkout
4. Frontend sends payment response to `POST /api/billing/verify`
5. Backend verifies HMAC signature, then credits the wallet
6. Optional webhook: `POST /api/billing/webhook` (raw body + `x-razorpay-signature`)

## Features

- JWT auth with credit wallet (50 starting credits; **5 credits per generation**)
- Text-to-image, image-to-image, variations, upscale, BG remove
- Prompt enhancer + auto-tags
- Cloudinary hosting before MongoDB save
- Community masonry + Remix
- Personal library folders
- Razorpay credit top-up (INR, Test Mode for development)

## Scripts

| Location | Command       | Purpose          |
| -------- | ------------- | ---------------- |
| server   | `npm run dev` | API with nodemon |
| client   | `npm run dev` | Vite dev server  |



