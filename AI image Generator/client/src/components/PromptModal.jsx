import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  CloseRounded,
  AutoAwesomeRounded,
  PaletteRounded,
  AspectRatioRounded,
  SpeedRounded,
  LocalOfferRounded,
  AutoFixHighRounded,
  DownloadRounded,
} from "@mui/icons-material";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;

const imageFadeIn = keyframes`
  from { opacity: 0; transform: scale(1.02); }
  to { opacity: 1; transform: scale(1); }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Modal = styled.div`
  width: min(880px, 100%);
  max-height: 88vh;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  animation: ${scaleIn} 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    max-height: 90vh;
    overflow-y: auto;
  }
`;

const ImagePane = styled.div`
  background: #06060a;
  min-height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    max-height: 65vh;
    animation: ${imageFadeIn} 0.4s ease;
  }
`;

const DetailPane = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow-y: auto;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.bgLight};
  color: ${({ theme }) => theme.text_secondary};
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.surfaceHover};
    color: ${({ theme }) => theme.text_primary};
  }

  svg {
    font-size: 16px;
  }
`;

const HeaderGroup = styled.div`
  padding-right: 32px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: ${({ theme }) => theme.text_primary};
  }

  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: ${({ theme }) => theme.text_secondary};

    span {
      color: ${({ theme }) => theme.text_primary};
      font-weight: 600;
    }
  }
`;

const SectionLabel = styled.div`
  font-size: 11.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_secondary};
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    font-size: 14px;
  }
`;

const PromptBox = styled.div`
  background: ${({ theme }) => theme.bgLight};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.text_primary};
  user-select: text;
`;

const SettingsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Chip = styled.div`
  background: ${({ theme }) => theme.bgLight};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text_secondary};
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11.5px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;

  svg {
    font-size: 13px;
  }
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.span`
  font-size: 11.5px;
  font-weight: 500;
  color: ${({ theme }) => theme.secondary};
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.25);
  padding: 3px 8px;
  border-radius: 4px;
`;

const ButtonStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
`;

function PromptModal({ item, onClose }) {
  const navigate = useNavigate();
  const { setRemixPrompt } = useApp();
  const [upscaling, setUpscaling] = useState(false);

  if (!item) return null;

  const imgSrc = item.photoUrl || item.imageUrl || item.photo;

  const usePrompt = () => {
    setRemixPrompt(item.prompt);
    onClose();
    navigate("/create");
  };

  const handleUpscale = () => {
    setUpscaling(true);
    setTimeout(() => {
      setUpscaling(false);
      toast.success("Image upscaled to 4K resolution!");
    }, 1200);
  };

  const handleDownload = () => {
    if (!imgSrc) return;
    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = `pixelforge-${item.id || "art"}.png`;
    link.target = "_blank";
    link.click();
    toast.success("Downloading image...");
  };

  return (
    <Backdrop onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ImagePane>
          <img src={imgSrc} alt={item.prompt} />
        </ImagePane>
        <DetailPane>
          <CloseBtn onClick={onClose} aria-label="Close">
            <CloseRounded />
          </CloseBtn>
          <HeaderGroup>
            <h3>Creation Details</h3>
            <p>
              By <span>{item.authorName || item.author || "Creator"}</span>
            </p>
          </HeaderGroup>
          <div>
            <SectionLabel>Prompt</SectionLabel>
            <PromptBox>{item.prompt}</PromptBox>
          </div>
          <div>
            <SectionLabel>Parameters</SectionLabel>
            <SettingsRow>
              <Chip>
                <PaletteRounded /> Style: {item.settings?.style || "Realistic"}
              </Chip>
              <Chip>
                <AspectRatioRounded /> Aspect: {item.settings?.aspect || "1:1"}
              </Chip>
              <Chip>
                <SpeedRounded /> Steps: {item.settings?.steps || "30"}
              </Chip>
            </SettingsRow>
          </div>
          {item.tags?.length > 0 && (
            <div>
              <SectionLabel>
                <LocalOfferRounded /> Tags
              </SectionLabel>
              <TagRow>
                {item.tags.map((tag) => (
                  <Tag key={tag}>#{tag}</Tag>
                ))}
              </TagRow>
            </div>
          )}
          <ButtonStack>
            <Button
              text="Remix in Studio"
              leftIcon={<AutoAwesomeRounded style={{ fontSize: 16 }} />}
              onClick={usePrompt}
              flex
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                text={upscaling ? "Upscaling..." : "Upscale 4K"}
                type="secondary"
                leftIcon={<AutoFixHighRounded style={{ fontSize: 15 }} />}
                onClick={handleUpscale}
                isLoading={upscaling}
                flex
              />
              <Button
                text="Download"
                type="secondary"
                leftIcon={<DownloadRounded style={{ fontSize: 15 }} />}
                onClick={handleDownload}
                flex
              />
            </div>
          </ButtonStack>
        </DetailPane>
      </Modal>
    </Backdrop>
  );
}

export default PromptModal;
