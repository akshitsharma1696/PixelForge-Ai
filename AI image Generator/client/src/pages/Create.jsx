import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  CloudUploadRounded,
  AutoFixHighRounded,
  ContentCutRounded,
  DownloadRounded,
  AutoAwesomeRounded,
  TuneRounded,
  CollectionsRounded,
  AspectRatioRounded,
  PaletteRounded,
  ImageSearchRounded,
  LightbulbOutlined,
} from "@mui/icons-material";
import Button from "../components/Button";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";
import { generateApi } from "../api/client";
import { ASPECT_RATIOS, STYLE_PRESETS } from "../data/mockImages";

const pulseGlow = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; filter: blur(24px); }
  50% { transform: scale(1.1); opacity: 0.9; filter: blur(38px); }
  100% { transform: scale(0.95); opacity: 0.5; filter: blur(24px); }
`;

const rippleRing = keyframes`
  0% { transform: scale(0.7); opacity: 0.9; }
  100% { transform: scale(2.4); opacity: 0; }
`;

const textShimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeInScale = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const Page = styled.div`
  height: 100%;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px 12px;
    gap: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;

  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: ${({ theme }) => theme.text_primary};
  }

  p {
    margin: 3px 0 0;
    color: ${({ theme }) => theme.text_secondary};
    font-size: 13.5px;
  }
`;

const CostHint = styled.div`
  font-size: 12.5px;
  color: ${({ theme }) => theme.text_secondary};
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  padding: 5px 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;

  strong {
    color: ${({ theme }) => theme.yellow};
  }
`;

const StudioGrid = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 20px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

/* Left: Configuration Panel */
const ConfigPanel = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow-y: auto;
`;

const TabRow = styled.div`
  display: flex;
  background: ${({ theme }) => theme.bgLight};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  padding: 3px;
  gap: 3px;
`;

const TabBtn = styled.button`
  flex: 1;
  border: none;
  background: ${({ $active, theme }) =>
    $active ? theme.card : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.text_primary : theme.text_muted};
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12.5px;
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;

  &:hover {
    color: ${({ theme }) => theme.text_primary};
  }
`;

const UploadArea = styled.label`
  min-height: 120px;
  border: 1px dashed ${({ theme }) => theme.borderHover};
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: ${({ theme }) => theme.text_secondary};
  cursor: pointer;
  text-align: center;
  padding: 14px;
  background: ${({ theme }) => theme.bgLight};
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }

  input {
    display: none;
  }

  img {
    max-width: 100%;
    max-height: 140px;
    border-radius: 4px;
    object-fit: cover;
  }

  svg {
    font-size: 26px;
    color: ${({ theme }) => theme.primary};
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SectionLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_secondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.bgLight};
  color: ${({ theme }) => theme.text_primary};
  padding: 10px 12px;
  font-size: 13.5px;
  font-family: inherit;
  line-height: 1.45;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: ${({ theme }) => theme.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.text_muted};
  }
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
`;

const OptionButton = styled.button`
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.primary : theme.border};
  background: ${({ $active, theme }) =>
    $active ? theme.card_light : theme.bgLight};
  color: ${({ $active, theme }) =>
    $active ? theme.text_primary : theme.text_secondary};
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.borderHover};
    color: ${({ theme }) => theme.text_primary};
  }
`;

const EnhanceBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const SmallTextBtn = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.primary};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;

  &:hover:not(:disabled) {
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* Right: Preview Canvas */
const CanvasPanel = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
`;

const ResultWindow = styled.div`
  flex: 1;
  min-height: 380px;
  background: #08080a;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.border};
  position: relative;
`;

const EmptyStudioState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 20px;
  gap: 12px;
  max-width: 380px;
  color: ${({ theme }) => theme.text_muted};

  svg {
    font-size: 38px;
    color: ${({ theme }) => theme.primary};
    opacity: 0.8;
  }

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${({ theme }) => theme.text_primary};
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
  }
`;

/* "AI is dreaming..." Glowing Simulation Animation */
const DreamingCanvas = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  overflow: hidden;
  background: radial-gradient(circle at center, rgba(18, 16, 28, 0.95) 0%, #07070a 100%);
`;

const DreamAura1 = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, transparent 70%);
  animation: ${pulseGlow} 3s infinite ease-in-out;
  pointer-events: none;
`;

const DreamAura2 = styled.div`
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%);
  animation: ${pulseGlow} 4s infinite ease-in-out reverse;
  pointer-events: none;
`;

const DreamRipple = styled.div`
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid rgba(99, 102, 241, 0.5);
  animation: ${rippleRing} 2.2s infinite cubic-bezier(0.1, 0.8, 0.3, 1);
`;

const DreamCore = styled.div`
  position: relative;
  z-index: 2;
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 0 36px rgba(99, 102, 241, 0.7);

  svg {
    font-size: 34px;
    animation: ${pulseGlow} 2s infinite ease-in-out;
  }
`;

const DreamStatus = styled.div`
  position: relative;
  z-index: 2;
  font-family: "Outfit", sans-serif;
  font-size: 15.5px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(90deg, #a5b4fc, #38bdf8, #f472b6, #a5b4fc);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${textShimmer} 4s infinite linear;
`;

const DreamSub = styled.div`
  position: relative;
  z-index: 2;
  font-size: 12px;
  color: ${({ theme }) => theme.text_muted};
  text-align: center;
  max-width: 300px;
`;

const ResultImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #08080a;
  animation: ${fadeInScale} 0.45s ease;
`;

const ActionToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 10px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const VariationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 6px;

  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.border};
    transition: border-color 0.15s ease, transform 0.15s ease;
    animation: ${fadeInScale} 0.3s ease;

    &:hover {
      border-color: ${({ theme }) => theme.primary};
      transform: scale(1.02);
    }
  }
`;

const aspectValue = (id) =>
  ASPECT_RATIOS.find((a) => a.id === id)?.value || "1:1";

const extractImageUrl = (data) => {
  if (!data) return "";
  if (typeof data === "string") return data;
  return (
    data.imageUrl ||
    data.photoUrl ||
    data.image?.photoUrl ||
    data.image?.imageUrl ||
    data.upscaledUrl ||
    data.cutoutUrl ||
    ""
  );
};

const DREAM_MESSAGES = [
  "AI is dreaming your art into existence...",
  "Synthesizing latent diffusion layers...",
  "Refining lighting, textures & highlights...",
  "Rendering 8K ultra-resolution details...",
];

function Create() {
  const { setCredits, remixPrompt, setRemixPrompt, credits } = useApp();
  const [mode, setMode] = useState("text");
  const [prompt, setPrompt] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [aspect, setAspect] = useState("square");
  const [style, setStyle] = useState("Realistic");
  const [status, setStatus] = useState("idle");
  const [resultUrl, setResultUrl] = useState(null);
  const [variations, setVariations] = useState([]);
  const [error, setError] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [dreamMessage, setDreamMessage] = useState(DREAM_MESSAGES[0]);

  useEffect(() => {
    if (remixPrompt) {
      setMode("text");
      setPrompt(remixPrompt);
      setRemixPrompt(null);
    }
  }, [remixPrompt, setRemixPrompt]);

  // Rotate dreaming messages during synthesis
  useEffect(() => {
    if (status !== "loading") return;
    let idx = 0;
    setDreamMessage(DREAM_MESSAGES[0]);
    const timer = setInterval(() => {
      idx = (idx + 1) % DREAM_MESSAGES.length;
      setDreamMessage(DREAM_MESSAGES[idx]);
    }, 1200);
    return () => clearInterval(timer);
  }, [status]);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  const enhancePrompt = async () => {
    if (!prompt.trim()) return;
    setEnhancing(true);
    setError("");
    try {
      const { data } = await generateApi.enhance({ prompt, style });
      if (data?.enhanced) {
        setPrompt(data.enhanced);
        toast.success("Prompt enhanced with style modifiers!");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Prompt enhance failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setEnhancing(false);
    }
  };

  const generate = async () => {
    if (mode === "text" && !prompt.trim()) return;
    if (mode === "image" && (!uploadFile || !prompt.trim())) return;
    if (status === "loading") return;
    if (credits < 5) {
      const msg = "Need at least 5 credits. Top up in Billing.";
      setError(msg);
      toast.error(msg);
      return;
    }

    const requestId = `gen_${Date.now()}`;
    console.log("========== IMAGE GENERATION START ==========");
    console.log(`[IMAGE ${requestId}] Generate button clicked`);
    console.log("[FRONTEND] Generate button clicked");
    console.log("[FRONTEND] Prompt:", prompt);
    console.log("[FRONTEND] Prompt length:", prompt?.length);
    console.log("[FRONTEND] Selected style:", style);
    console.log("[FRONTEND] Selected aspect ratio:", aspectValue(aspect));
    console.log("[FRONTEND] Selected mode:", mode);
    console.log("[FRONTEND] Enhanced prompt:", prompt);
    console.log("[FRONTEND] Credits before generation:", credits);

    setStatus("loading");
    setResultUrl(null);
    setVariations([]);
    setError("");

    try {
      let res;
      if (mode === "text") {
        const payload = {
          prompt,
          style,
          aspectRatio: aspectValue(aspect),
          enhance: true,
        };
        console.log("[FRONTEND] Generation payload:", payload);
        console.log("[FRONTEND] Generation payload JSON:", JSON.stringify(payload, null, 2));
        console.log("[FRONTEND] API URL: /generate/text-to-image");
        console.log("[FRONTEND] HTTP METHOD: POST");
        console.log("[FRONTEND] Sending generation request...");
        res = await generateApi.textToImage(payload);
      } else {
        const form = new FormData();
        form.append("image", uploadFile);
        form.append("prompt", prompt);
        form.append("style", style);
        form.append("aspectRatio", aspectValue(aspect));
        console.log("[FRONTEND] Sending image-to-image request...");
        res = await generateApi.imageToImage(form);
      }

      console.log("[FRONTEND] Generation API response received");
      console.log("[FRONTEND] Response status:", res.status);
      console.log("[FRONTEND] Response data:", res.data);
      console.log("[FRONTEND] imageUrl:", res.data?.imageUrl);
      console.log("[FRONTEND] image:", res.data?.image);
      console.log("[FRONTEND] url:", res.data?.url);
      console.log("[FRONTEND] cloudinaryUrl:", res.data?.cloudinaryUrl);
      console.log("[FRONTEND] generatedImage:", res.data?.generatedImage);

      const imgUrl = extractImageUrl(res.data);
      console.log("[FRONTEND] IMAGE ABOUT TO BE DISPLAYED:", imgUrl);
      console.log("========================================");

      setResultUrl(imgUrl);
      if (res.data?.credits !== undefined) {
        setCredits(res.data.credits);
      } else {
        setCredits((c) => Math.max(0, c - 5));
      }
      setStatus("ready");
      toast.success("Masterpiece synthesized!");
    } catch (err) {
      console.error("[FRONTEND] Generation error:", err);
      setStatus("idle");
      const apiMessage = err?.response?.data?.message || err?.message || "Generation failed";
      setError(apiMessage);
      toast.error(apiMessage);
    }
  };

  const runTool = async (tool) => {
    if (!resultUrl || status === "loading") return;
    if (credits < 5) {
      const msg = "Need at least 5 credits for this tool.";
      setError(msg);
      toast.error(msg);
      return;
    }
    setStatus("loading");
    setError("");
    try {
      if (tool === "upscale") {
        const { data } = await generateApi.upscale({ imageUrl: resultUrl });
        const upscaled = extractImageUrl(data);
        if (upscaled) setResultUrl(upscaled);
        if (data?.credits !== undefined) setCredits(data.credits);
        toast.success("Upscaled to 4K resolution!");
      } else if (tool === "bg") {
        const { data } = await generateApi.removeBg({ imageUrl: resultUrl });
        const cutout = extractImageUrl(data);
        if (cutout) setResultUrl(cutout);
        if (data?.credits !== undefined) setCredits(data.credits);
        toast.success("Background removed cleanly!");
      } else if (tool === "variations") {
        const { data } = await generateApi.variations({ imageUrl: resultUrl });
        const list = (data.images || data.variations || []).map(extractImageUrl);
        setVariations(list);
        if (list[0]) setResultUrl(list[0]);
        if (data?.credits !== undefined) setCredits(data.credits);
        toast.success("Generated style variations!");
      }
      setStatus("ready");
    } catch (err) {
      setStatus("ready");
      const apiMessage = err?.response?.data?.message || "Operation failed";
      setError(apiMessage);
      toast.error(apiMessage);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "pixelforge-artwork.png";
    link.target = "_blank";
    link.click();
  };

  return (
    <Page>
      <Header>
        <div>
          <h1>Studio Workspace</h1>
          <p>SDXL Latent Diffusion Synthesis Canvas</p>
        </div>
        <CostHint>
          <span>Cost per generation:</span>
          <strong>5 credits</strong>
        </CostHint>
      </Header>

      <StudioGrid>
        {/* Left column: Controls */}
        <ConfigPanel>
          <TabRow>
            <TabBtn $active={mode === "text"} onClick={() => setMode("text")}>
              Text to Image
            </TabBtn>
            <TabBtn $active={mode === "image"} onClick={() => setMode("image")}>
              Image Remix
            </TabBtn>
          </TabRow>

          {mode === "image" && (
            <UploadArea>
              <input type="file" accept="image/*" onChange={handleUpload} />
              {uploadPreview ? (
                <img src={uploadPreview} alt="Upload preview" />
              ) : (
                <>
                  <CloudUploadRounded />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    Click or drop reference image
                  </span>
                  <span style={{ fontSize: 11, color: "#71717a" }}>
                    JPG, PNG up to 8MB
                  </span>
                </>
              )}
            </UploadArea>
          )}

          <FormSection>
            <SectionLabel>
              <span>Prompt Description</span>
              <span style={{ fontSize: 11, color: "#71717a" }}>
                {prompt.length} chars
              </span>
            </SectionLabel>
            <Textarea
              placeholder="Describe your imagination in vivid detail (e.g., Neon cyberpunk street in Tokyo rain, volumetric atmospheric lighting)..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <EnhanceBar>
              <SmallTextBtn
                type="button"
                onClick={() => setPrompt("Abstract fluid iridescent crystal geometry in neon violet, 3D refraction, dark cinematic background")}
              >
                <LightbulbOutlined style={{ fontSize: 13 }} />
                Sample Idea
              </SmallTextBtn>
              <SmallTextBtn
                type="button"
                onClick={enhancePrompt}
                disabled={!prompt.trim() || enhancing}
              >
                <TuneRounded style={{ fontSize: 13 }} />
                {enhancing ? "Enhancing..." : "Enhance Prompt"}
              </SmallTextBtn>
            </EnhanceBar>
          </FormSection>

          <FormSection>
            <SectionLabel>Aspect Ratio</SectionLabel>
            <OptionsGrid>
              {ASPECT_RATIOS.map((item) => (
                <OptionButton
                  key={item.id}
                  $active={aspect === item.id}
                  onClick={() => setAspect(item.id)}
                >
                  {item.label} ({item.value})
                </OptionButton>
              ))}
            </OptionsGrid>
          </FormSection>

          <FormSection>
            <SectionLabel>Style Preset</SectionLabel>
            <OptionsGrid>
              {STYLE_PRESETS.map((item) => (
                <OptionButton
                  key={item}
                  $active={style === item}
                  onClick={() => setStyle(item)}
                >
                  {item}
                </OptionButton>
              ))}
            </OptionsGrid>
          </FormSection>

          {error && (
            <div
              style={{
                fontSize: "12.5px",
                color: "#ef4444",
                background: "rgba(239, 68, 68, 0.1)",
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid rgba(239, 68, 68, 0.25)",
              }}
            >
              {error}
            </div>
          )}

          <Button
            text={status === "loading" ? "Synthesizing..." : "Generate Image (5 Credits)"}
            leftIcon={<AutoAwesomeRounded style={{ fontSize: 16 }} />}
            onClick={generate}
            isLoading={status === "loading"}
            isDisabled={
              (mode === "text" && !prompt.trim()) ||
              (mode === "image" && (!uploadFile || !prompt.trim()))
            }
            flex
          />
        </ConfigPanel>

        {/* Right column: Canvas preview with Dreaming Pulse */}
        <CanvasPanel>
          <ResultWindow>
            {status === "loading" && (
              <DreamingCanvas>
                <DreamAura1 />
                <DreamAura2 />
                <DreamRipple />
                <DreamCore>
                  <AutoAwesomeRounded />
                </DreamCore>
                <DreamStatus>{dreamMessage}</DreamStatus>
                <DreamSub>Processing latent diffusion layers in real time</DreamSub>
              </DreamingCanvas>
            )}

            {status === "idle" && (
              <EmptyStudioState>
                <ImageSearchRounded />
                <h3>Your canvas is ready</h3>
                <p>
                  Enter a prompt on the left and select your preferred style to forge your masterpiece.
                </p>
              </EmptyStudioState>
            )}

            {status === "ready" && resultUrl && (
              <ResultImage src={resultUrl} alt="Generated result" />
            )}
          </ResultWindow>

          {resultUrl && status === "ready" && (
            <ActionToolbar>
              <Button
                text="Upscale (4K)"
                type="secondary"
                leftIcon={<AutoFixHighRounded style={{ fontSize: 15 }} />}
                onClick={() => runTool("upscale")}
              />
              <Button
                text="Remove BG"
                type="secondary"
                leftIcon={<ContentCutRounded style={{ fontSize: 15 }} />}
                onClick={() => runTool("bg")}
              />
              <Button
                text="Variations"
                type="secondary"
                leftIcon={<CollectionsRounded style={{ fontSize: 15 }} />}
                onClick={() => runTool("variations")}
              />
              <Button
                text="Download"
                leftIcon={<DownloadRounded style={{ fontSize: 15 }} />}
                onClick={download}
              />
            </ActionToolbar>
          )}

          {variations.length > 0 && (
            <div>
              <SectionLabel>Generated Variations</SectionLabel>
              <VariationGrid>
                {variations.map((url, idx) => (
                  <img
                    key={url + idx}
                    src={url}
                    alt="Variation"
                    onClick={() => setResultUrl(url)}
                  />
                ))}
              </VariationGrid>
            </div>
          )}
        </CanvasPanel>
      </StudioGrid>
    </Page>
  );
}

export default Create;
