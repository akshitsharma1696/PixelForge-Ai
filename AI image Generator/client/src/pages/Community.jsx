import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { GALLERY_IMAGES, GALLERY_TAGS } from "../data/mockImages";
import PromptModal from "../components/PromptModal";
import ImageCard from "../components/ImageCard";
import { useApp } from "../context/AppContext";
import { imagesApi } from "../api/client";
import { SearchRounded } from "@mui/icons-material";

const Page = styled.div`
  padding: 32px 32px 64px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px 16px 48px;
    gap: 20px;
  }
`;

const Headline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: ${({ theme }) => theme.text_primary};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.text_secondary};
    font-size: 14px;
    max-width: 600px;
  }
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.button`
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.primary : theme.border};
  background: ${({ $active, theme }) =>
    $active ? theme.card_light : theme.card};
  color: ${({ $active, theme }) =>
    $active ? theme.text_primary : theme.text_secondary};
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;

  &:hover {
    color: ${({ theme }) => theme.text_primary};
    border-color: ${({ theme }) => theme.borderHover};
  }
`;

const MasonryGrid = styled.div`
  columns: 4;
  column-gap: 16px;

  @media (max-width: 1100px) {
    columns: 3;
  }
  @media (max-width: 750px) {
    columns: 2;
  }
  @media (max-width: 480px) {
    columns: 1;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  gap: 10px;
  color: ${({ theme }) => theme.text_muted};

  h3 {
    margin: 0;
    font-size: 16px;
    color: ${({ theme }) => theme.text_primary};
  }

  p {
    margin: 0;
    font-size: 13.5px;
    max-width: 360px;
  }
`;

function normalize(item) {
  return {
    id: item._id || item.id,
    photoUrl: item.photoUrl || item.imageUrl || item.photo,
    authorName: item.authorName || item.author || "Creator",
    authorUsername: item.authorUsername || item.username || "",
    prompt: item.prompt,
    tags: item.tags || [],
    settings: item.settings || {
      style: item.style,
      aspect: item.aspectRatio,
    },
    height: item.height || 240 + ((item.prompt?.length || 10) % 5) * 20,
  };
}

function Community() {
  const navigate = useNavigate();
  const { searchQuery } = useApp();
  const [activeTag, setActiveTag] = useState("All");
  const [selected, setSelected] = useState(null);
  const [remote, setRemote] = useState([]);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    let alive = true;
    imagesApi
      .community({
        tag: activeTag,
        q: searchQuery || undefined,
      })
      .then(({ data }) => {
        if (!alive) return;
        if (!data.images?.length) {
          setUsingMock(true);
          setRemote([]);
        } else {
          setUsingMock(false);
          setRemote(data.images.map(normalize));
        }
      })
      .catch(() => {
        if (!alive) return;
        setUsingMock(true);
        setRemote([]);
      });
    return () => {
      alive = false;
    };
  }, [activeTag, searchQuery]);

  const filtered = useMemo(() => {
    if (!usingMock) return remote;
    const q = (searchQuery || "").trim().toLowerCase();
    return GALLERY_IMAGES.filter((img) => {
      const tagOk =
        activeTag === "All" ||
        img.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase());
      const searchOk =
        !q ||
        img.prompt.toLowerCase().includes(q) ||
        img.author.toLowerCase().includes(q) ||
        img.tags.some((t) => t.toLowerCase().includes(q));
      return tagOk && searchOk;
    }).map(normalize);
  }, [usingMock, remote, activeTag, searchQuery]);

  return (
    <Page>
      <Headline>
        <h1>Explore Gallery</h1>
        <p>
          Browse visual creations and prompts shared by the PixelForge community.
        </p>
      </Headline>

      <FilterBar>
        {GALLERY_TAGS.map((tag) => (
          <Tag
            key={tag}
            $active={activeTag === tag}
            onClick={() => setActiveTag(tag)}
          >
            {tag === "All" ? "All Categories" : tag}
          </Tag>
        ))}
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState>
          <SearchRounded style={{ fontSize: 32 }} />
          <h3>No creations found</h3>
          <p>Try searching for different keywords or select another category.</p>
        </EmptyState>
      ) : (
        <MasonryGrid>
          {filtered.map((item) => (
            <ImageCard
              key={item.id}
              item={item}
              onClick={() => setSelected(item)}
            />
          ))}
        </MasonryGrid>
      )}

      <PromptModal item={selected} onClose={() => setSelected(null)} />
    </Page>
  );
}

export default Community;


