import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  AutoAwesomeRounded,
  ArrowForwardRounded,
  AspectRatioRounded,
  PaletteRounded,
  DownloadRounded,
  SearchRounded,
} from "@mui/icons-material";
import Button from "../components/Button";
import PromptModal from "../components/PromptModal";
import { useApp } from "../context/AppContext";
import { GALLERY_IMAGES, ASPECT_RATIOS, STYLE_PRESETS } from "../data/mockImages";
import logoImg from "../assets/logo.png";
import { Link } from "react-router-dom";

const Page = styled.div`
  padding: 32px 32px 64px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 36px;

  @media (max-width: 768px) {
    padding: 20px 16px 48px;
    gap: 28px;
  }
`;

const BrandBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  padding: 4px 12px 4px 6px;
  width: fit-content;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_secondary};
  margin-bottom: 4px;

  img {
    width: 18px;
    height: 18px;
    object-fit: contain;
    border-radius: 4px;
  }
`;

const Footer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text_muted};
  font-size: 13px;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const FooterBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.text_primary};
  font-family: "Outfit", sans-serif;
  font-size: 15px;

  span {
    color: ${({ theme }) => theme.primary};
  }
`;

const FooterLogo = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;

  a {
    color: ${({ theme }) => theme.text_secondary};
    text-decoration: none;
    font-size: 12.5px;
    transition: color 0.15s ease;

    &:hover {
      color: ${({ theme }) => theme.text_primary};
    }
  }
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: ${({ theme }) => theme.text_primary};
    letter-spacing: -0.02em;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.text_secondary};
    font-size: 14.5px;
  }
`;

/* Practical Prompt Composer on Home Page */
const ComposerCard = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: ${({ theme }) => theme.cardShadow};
`;

const PromptInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  textarea {
    width: 100%;
    min-height: 80px;
    background: transparent;
    border: none;
    outline: none;
    color: ${({ theme }) => theme.text_primary};
    font-family: inherit;
    font-size: 14.5px;
    line-height: 1.5;
    resize: vertical;

    &::placeholder {
      color: ${({ theme }) => theme.text_muted};
    }
  }
`;

const ComposerControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const SelectBox = styled.select`
  background: ${({ theme }) => theme.bgLight};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text_secondary};
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12.5px;
  font-family: inherit;
  outline: none;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.borderHover};
    color: ${({ theme }) => theme.text_primary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const InspirationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  span {
    font-size: 12px;
    color: ${({ theme }) => theme.text_muted};
  }
`;

const PromptChip = styled.button`
  background: ${({ theme }) => theme.bgLight};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text_secondary};
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.surfaceHover};
    border-color: ${({ theme }) => theme.borderHover};
    color: ${({ theme }) => theme.text_primary};
  }
`;

/* Creations Section */
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.text_primary};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 1040px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 460px) {
    grid-template-columns: 1fr;
  }
`;

const CreationCard = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.borderHover};
    transform: translateY(-2px);
  }
`;

const CardImage = styled.div`
  aspect-ratio: 1;
  background: #000;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const CardMeta = styled.div`
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  p {
    margin: 0;
    font-size: 12.5px;
    font-weight: 500;
    color: ${({ theme }) => theme.text_primary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: 11px;
    color: ${({ theme }) => theme.text_muted};
  }
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px 10px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const ActionTextBtn = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.primary};
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: inherit;

  &:hover {
    text-decoration: underline;
  }
`;

const QuickWorkflowsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const WorkflowCard = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  h3 {
    margin: 0;
    font-size: 14.5px;
    font-weight: 600;
    color: ${({ theme }) => theme.text_primary};
  }

  p {
    margin: 0;
    font-size: 12.5px;
    color: ${({ theme }) => theme.text_secondary};
    line-height: 1.5;
  }
`;

const SAMPLE_PROMPTS = [
  "Cyberpunk neon street at dusk with reflections in rain",
  "Warm cozy wooden cabin in pine forest under snow",
  "Minimalist architectural house with floor-to-ceiling glass",
  "Vintage anime watercolor landscape with floating clouds",
];

function Home() {
  const navigate = useNavigate();
  const { setRemixPrompt, isAuthenticated } = useApp();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [aspect, setAspect] = useState("square");
  const [selectedItem, setSelectedItem] = useState(null);

  const handleGenerate = () => {
    if (prompt.trim()) {
      setRemixPrompt(prompt.trim());
    }
    navigate(isAuthenticated ? "/create" : "/signup");
  };

  const handleChipClick = (text) => {
    setPrompt(text);
  };

  const recentCreations = GALLERY_IMAGES.slice(0, 8);

  return (
    <Page>
      <HeaderSection>
        <BrandBadge>
          <img src={logoImg} alt="PixelForge" />
          <span>PixelForge Generative Suite</span>
        </BrandBadge>
        <h1>Create something new</h1>
        <p>Generate images from your ideas using PixelForge latent diffusion</p>
      </HeaderSection>

      {/* Primary Interaction: Prompt Composer */}
      <ComposerCard>
        <PromptInputWrapper>
          <textarea
            placeholder="Describe the image you want to create (e.g., A futuristic glass greenhouse in a misty morning forest)..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </PromptInputWrapper>

        <InspirationRow>
          <span>Ideas:</span>
          {SAMPLE_PROMPTS.map((sample) => (
            <PromptChip key={sample} onClick={() => handleChipClick(sample)}>
              {sample.slice(0, 36)}…
            </PromptChip>
          ))}
        </InspirationRow>

        <ComposerControls>
          <ControlGroup>
            <SelectBox value={style} onChange={(e) => setStyle(e.target.value)}>
              {STYLE_PRESETS.map((s) => (
                <option key={s} value={s}>
                  Style: {s}
                </option>
              ))}
            </SelectBox>

            <SelectBox value={aspect} onChange={(e) => setAspect(e.target.value)}>
              {ASPECT_RATIOS.map((a) => (
                <option key={a.id} value={a.id}>
                  Ratio: {a.label} ({a.value})
                </option>
              ))}
            </SelectBox>
          </ControlGroup>

          <Button
            text="Open in Studio"
            leftIcon={<AutoAwesomeRounded style={{ fontSize: 16 }} />}
            onClick={handleGenerate}
          />
        </ComposerControls>
      </ComposerCard>

      {/* Recent Creations Grid */}
      <div>
        <SectionHeader>
          <h2>Recent community creations</h2>
          <Button
            text="View Gallery"
            type="secondary"
            rightIcon={<ArrowForwardRounded style={{ fontSize: 15 }} />}
            onClick={() => navigate("/community")}
          />
        </SectionHeader>

        <Grid style={{ marginTop: "14px" }}>
          {recentCreations.map((item) => (
            <CreationCard key={item.id} onClick={() => setSelectedItem(item)}>
              <CardImage>
                <img src={item.photo} alt={item.prompt} loading="lazy" />
              </CardImage>
              <CardMeta>
                <p>{item.prompt}</p>
                <span>by {item.author}</span>
              </CardMeta>
              <CardActions>
                <ActionTextBtn
                  onClick={(e) => {
                    e.stopPropagation();
                    setRemixPrompt(item.prompt);
                    navigate("/create");
                  }}
                >
                  Remix prompt
                </ActionTextBtn>
                <ActionTextBtn
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item);
                  }}
                >
                  Details
                </ActionTextBtn>
              </CardActions>
            </CreationCard>
          ))}
        </Grid>
      </div>

      {/* How it works simple cards */}
      <div>
        <SectionHeader>
          <h2>How PixelForge works</h2>
        </SectionHeader>

        <QuickWorkflowsGrid style={{ marginTop: "14px" }}>
          <WorkflowCard>
            <h3>1. Prompt & Style</h3>
            <p>
              Type your description and choose your desired style preset and dimensions.
            </p>
          </WorkflowCard>

          <WorkflowCard>
            <h3>2. Latent Diffusion</h3>
            <p>
              The engine processes your prompt through SDXL latent diffusion in seconds.
            </p>
          </WorkflowCard>

          <WorkflowCard>
            <h3>3. Refine & Export</h3>
            <p>
              Upscale to high resolution, remove backgrounds, or remix variations.
            </p>
          </WorkflowCard>
        </QuickWorkflowsGrid>
      </div>

      <Footer>
        <FooterBrand>
          <FooterLogo>
            <img src={logoImg} alt="PixelForge" />
          </FooterLogo>
          <span>PixelForge</span>
        </FooterBrand>

        <FooterLinks>
          <Link to="/create">Studio</Link>
          <Link to="/community">Community</Link>
          <Link to="/billing">Pricing</Link>
          <Link to="/social">Feed</Link>
        </FooterLinks>
      </Footer>

      <PromptModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </Page>
  );
}

export default Home;


