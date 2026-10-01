import React, { useState } from "react";
import styled from "styled-components";
import { LazyLoadImage } from "react-lazy-load-image-component";
import {
  DownloadRounded,
  FavoriteRounded,
  FavoriteBorderRounded,
  AutoAwesomeRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const Card = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  cursor: pointer;
  break-inside: avoid;
  margin-bottom: 14px;
  transition: border-color 0.15s ease, transform 0.15s ease;

  img {
    width: 100%;
    display: block;
    object-fit: cover;
  }

  &:hover {
    border-color: ${({ theme }) => theme.borderHover};
    transform: translateY(-2px);
  }
`;

const HoverOverlay = styled.div`
  opacity: 0;
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(
    to bottom,
    rgba(12, 13, 16, 0.7) 0%,
    transparent 40%,
    rgba(12, 13, 16, 0.95) 100%
  );
  color: #ffffff;
  transition: opacity 0.15s ease;
  padding: 12px;

  ${Card}:hover & {
    opacity: 1;
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const LikeBtn = styled.button`
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: ${({ $liked }) => ($liked ? "#ef4444" : "#f4f4f5")};
  border-radius: 4px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s ease;

  svg {
    font-size: 14px;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const ActionIcon = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;

  svg {
    font-size: 16px;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const BottomArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const PromptText = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
  color: #f4f4f5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Author = styled.div`
  font-weight: 500;
  font-size: 12px;
  display: flex;
  gap: 6px;
  align-items: center;
  color: #a1a1aa;
  cursor: pointer;

  &:hover {
    color: #f4f4f5;
  }
`;

const AvatarCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
`;

const RemixMiniBtn = styled.button`
  background: ${({ theme }) => theme.primary};
  border: none;
  color: white;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }
`;

function ImageCard({ item, onClick }) {
  const navigate = useNavigate();
  const { setRemixPrompt } = useApp();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(
    () => 12 + ((item?.prompt?.length || 5) % 25)
  );

  const photoSrc = item?.photoUrl || item?.imageUrl || item?.photo || "";
  const authorName = item?.authorName || item?.author || "Creator";
  const authorUsername = item?.authorUsername || item?.username || "";

  const handleDownload = (e) => {
    e.stopPropagation();
    if (!photoSrc) return;
    const link = document.createElement("a");
    link.href = photoSrc;
    link.download = "pixelforge-art.jpg";
    link.target = "_blank";
    link.click();
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleRemix = (e) => {
    e.stopPropagation();
    setRemixPrompt(item?.prompt || "");
    navigate("/create");
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    if (authorUsername) {
      navigate(`/u/${authorUsername}`);
    }
  };

  return (
    <Card onClick={onClick}>
      <LazyLoadImage width="100%" src={photoSrc} alt={item?.prompt || "Artwork"} />
      <HoverOverlay>
        <TopRow>
          <LikeBtn $liked={liked} onClick={handleLike} title="Like artwork">
            {liked ? <FavoriteRounded /> : <FavoriteBorderRounded />}
            <span>{likesCount}</span>
          </LikeBtn>
          <ActionIcon onClick={handleDownload} title="Download image">
            <DownloadRounded />
          </ActionIcon>
        </TopRow>

        <BottomArea>
          <PromptText>{item?.prompt}</PromptText>
          <AuthorRow>
            <Author onClick={handleAuthorClick}>
              <AvatarCircle>{authorName[0]?.toUpperCase()}</AvatarCircle>
              <span>{authorName}</span>
            </Author>
            <RemixMiniBtn onClick={handleRemix}>
              <AutoAwesomeRounded style={{ fontSize: 12 }} />
              Remix
            </RemixMiniBtn>
          </AuthorRow>
        </BottomArea>
      </HoverOverlay>
    </Card>
  );
}

export default ImageCard;