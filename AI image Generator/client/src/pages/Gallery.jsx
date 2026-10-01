import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { GALLERY_IMAGES, GALLERY_TAGS } from "../data/mockImages";
import PromptModal from "../components/PromptModal";
import { useApp } from "../context/AppContext";

const Page = styled.div`
  padding: 28px 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px 12px 40px;
  }
`;

const Headline = styled.div`
  text-align: center;

  h1 {
    margin: 0;
    font-size: 30px;
    font-weight: 600;

    @media (max-width: 600px) {
      font-size: 22px;
    }
  }

  span {
    display: block;
    margin-top: 4px;
    font-size: 26px;
    font-weight: 800;
    color: ${({ theme }) => theme.secondary};

    @media (max-width: 600px) {
      font-size: 18px;
    }
  }
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
`;

const Tag = styled.button`
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.secondary : theme.text_secondary + 40};
  background: ${({ $active, theme }) =>
    $active ? theme.secondary + 28 : theme.bgLight};
  color: ${({ $active, theme }) =>
    $active ? theme.secondary : theme.text_secondary};
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  font-family: inherit;

  &:hover {
    border-color: ${({ theme }) => theme.secondary};
    color: ${({ theme }) => theme.text_primary};
  }
`;

const Masonry = styled.div`
  columns: 4;
  column-gap: 16px;

  @media (max-width: 1100px) {
    columns: 3;
  }
  @media (max-width: 768px) {
    columns: 2;
  }
  @media (max-width: 480px) {
    columns: 1;
  }
`;

const Card = styled.div`
  break-inside: avoid;
  margin-bottom: 16px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: ${({ theme }) => theme.card};
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px ${({ theme }) => theme.shadow};
  }

  img {
    width: 100%;
    height: ${({ $height }) => $height}px;
    object-fit: cover;
    display: block;
    transition: 0.3s;
  }
`;

const RemixOverlay = styled.div`
  opacity: 0;
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.2) 55%,
    transparent 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 14px;
  gap: 10px;
  transition: 0.3s;

  ${Card}:hover & {
    opacity: 1;
  }
`;

const PromptPreview = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.white};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RemixBtn = styled.button`
  align-self: flex-start;
  border: none;
  background: ${({ theme }) => theme.primary};
  color: white;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s;
  font-family: inherit;

  &:hover {
    filter: brightness(1.1);
    transform: scale(1.03);
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 48px 16px;
  color: ${({ theme }) => theme.text_secondary};
`;

function Gallery() {
  const navigate = useNavigate();
  const { searchQuery, setRemixPrompt } = useApp();
  const [activeTag, setActiveTag] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
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
    });
  }, [activeTag, searchQuery]);

  const usePrompt = (e, item) => {
    e.stopPropagation();
    setRemixPrompt(item.prompt);
    navigate("/create");
  };

  return (
    <Page>
      <Headline>
        <h1>Explore popular posts in the Community</h1>
        <span>Generated with AI</span>
      </Headline>

      <FilterBar>
        {GALLERY_TAGS.map((tag) => (
          <Tag
            key={tag}
            $active={activeTag === tag}
            onClick={() => setActiveTag(tag)}
          >
            {tag === "All" ? "All" : `#${tag}`}
          </Tag>
        ))}
      </FilterBar>

      {filtered.length === 0 ? (
        <Empty>No images match your search or filters.</Empty>
      ) : (
        <Masonry>
          {filtered.map((item) => (
            <Card
              key={item.id}
              $height={item.height}
              onClick={() => setSelected(item)}
            >
              <img src={item.photo} alt={item.prompt} loading="lazy" />
              <RemixOverlay>
                <PromptPreview>{item.prompt}</PromptPreview>
                <RemixBtn onClick={(e) => usePrompt(e, item)}>
                  Use Prompt
                </RemixBtn>
              </RemixOverlay>
            </Card>
          ))}
        </Masonry>
      )}

      <PromptModal item={selected} onClose={() => setSelected(null)} />
    </Page>
  );
}

export default Gallery;
