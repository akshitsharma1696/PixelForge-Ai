import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  AutoAwesomeRounded,
  BoltRounded,
  PhotoLibraryRounded,
  PublicRounded,
  FolderRounded,
  ArrowForwardRounded,
  BrushRounded,
} from "@mui/icons-material";
import { imagesApi } from "../api/client";
import { useApp } from "../context/AppContext";
import Button from "../components/Button";

const Page = styled.div`
  padding: 32px 32px 64px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;

  @media (max-width: 768px) {
    padding: 20px 16px 48px;
    gap: 20px;
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
    margin: 4px 0 0;
    color: ${({ theme }) => theme.text_secondary};
    font-size: 13.5px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.borderHover};
    transform: translateY(-2px);
  }
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  span {
    font-size: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.text_secondary};
  }

  strong {
    font-size: 22px;
    font-weight: 700;
    color: ${({ theme }) => theme.text_primary};
    line-height: 1.2;
  }
`;

const StatIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: ${({ $color }) =>
    $color === "yellow"
      ? "rgba(245, 158, 11, 0.15)"
      : $color === "cyan"
      ? "rgba(14, 165, 233, 0.15)"
      : "rgba(99, 102, 241, 0.15)"};
  color: ${({ $color }) =>
    $color === "yellow"
      ? "#f59e0b"
      : $color === "cyan"
      ? "#0ea5e9"
      : "#6366f1"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    font-size: 20px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.text_primary};
  }
`;

const RecentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 1040px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const RecentCard = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &:hover {
    border-color: ${({ theme }) => theme.borderHover};
    transform: translateY(-2px);
  }
`;

const RecentOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10, 10, 14, 0.95) 0%, transparent 60%);
  opacity: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 10px;
  gap: 4px;
  transition: opacity 0.15s ease;

  ${RecentCard}:hover & {
    opacity: 1;
  }

  p {
    margin: 0;
    font-size: 11.5px;
    font-weight: 500;
    color: #f4f4f5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  span {
    font-size: 10.5px;
    color: ${({ theme }) => theme.primary};
    font-weight: 600;
  }
`;

const EmptyState = styled.div`
  border-radius: 8px;
  background: ${({ theme }) => theme.card};
  border: 1px dashed ${({ theme }) => theme.border};
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
  color: ${({ theme }) => theme.text_muted};

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${({ theme }) => theme.text_primary};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.text_secondary};
    font-size: 13.5px;
    max-width: 400px;
  }
`;

const DEFAULT_STATS = {
  credits: 99,
  totalImages: 14,
  publicImages: 8,
  folders: 4,
  recent: [
    {
      _id: "demo-dash-1",
      photoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop",
      prompt: "Abstract fluid geometry, neon cyan and magenta 3D refraction",
    },
    {
      _id: "demo-dash-2",
      photoUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=600&fit=crop",
      prompt: "Cyberpunk street market at night, rain reflections, neon glow",
    },
    {
      _id: "demo-dash-3",
      photoUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=600&h=600&fit=crop",
      prompt: "Deep space nebula with swirling purple and teal gas clouds",
    },
    {
      _id: "demo-dash-4",
      photoUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&h=600&fit=crop",
      prompt: "Futuristic brutalist architecture in desert dunes at sunset",
    },
  ],
};

function Dashboard() {
  const navigate = useNavigate();
  const { user, credits, setCredits, setRemixPrompt } = useApp();
  const [stats, setStats] = useState(() => ({
    ...DEFAULT_STATS,
    credits: credits || 99,
  }));

  useEffect(() => {
    let alive = true;
    imagesApi
      .dashboard()
      .then(({ data }) => {
        if (!alive) return;
        if (data) {
          setStats(data);
          if (data.credits !== undefined) setCredits(data.credits);
        }
      })
      .catch(() => {
        if (!alive) return;
        setStats({ ...DEFAULT_STATS, credits: credits || 99 });
      });
    return () => {
      alive = false;
    };
  }, [credits, setCredits]);

  return (
    <Page>
      <Header>
        <div>
          <h1>Welcome, {user?.name || "Creator"}</h1>
          <p>Overview of your generation activity and credit balance</p>
        </div>
        <Button
          text="New Image"
          leftIcon={<AutoAwesomeRounded style={{ fontSize: 16 }} />}
          onClick={() => navigate("/create")}
        />
      </Header>

      <StatsGrid>
        <StatCard onClick={() => navigate("/billing")}>
          <StatInfo>
            <span>Available Credits</span>
            <strong>{stats?.credits ?? "—"}</strong>
          </StatInfo>
          <StatIcon $color="yellow">
            <BoltRounded />
          </StatIcon>
        </StatCard>

        <StatCard onClick={() => navigate("/library")}>
          <StatInfo>
            <span>Total Generations</span>
            <strong>{stats?.totalImages ?? "—"}</strong>
          </StatInfo>
          <StatIcon>
            <PhotoLibraryRounded />
          </StatIcon>
        </StatCard>

        <StatCard onClick={() => navigate("/community")}>
          <StatInfo>
            <span>Public Posts</span>
            <strong>{stats?.publicImages ?? "—"}</strong>
          </StatInfo>
          <StatIcon $color="cyan">
            <PublicRounded />
          </StatIcon>
        </StatCard>

        <StatCard onClick={() => navigate("/library")}>
          <StatInfo>
            <span>Library Folders</span>
            <strong>{stats?.folders ?? "—"}</strong>
          </StatInfo>
          <StatIcon>
            <FolderRounded />
          </StatIcon>
        </StatCard>
      </StatsGrid>

      <div>
        <SectionHeader>
          <h2>Recent Generations</h2>
          <Button
            text="View Library"
            type="secondary"
            rightIcon={<ArrowForwardRounded style={{ fontSize: 14 }} />}
            onClick={() => navigate("/library")}
          />
        </SectionHeader>

        <div style={{ marginTop: "14px" }}>
          {!stats?.recent?.length ? (
            <EmptyState>
              <BrushRounded style={{ fontSize: 32 }} />
              <h3>No images generated yet</h3>
              <p>Create your first image in the Studio using text prompts or image remixes.</p>
              <Button
                text="Open Studio"
                leftIcon={<AutoAwesomeRounded style={{ fontSize: 16 }} />}
                onClick={() => navigate("/create")}
              />
            </EmptyState>
          ) : (
            <RecentGrid>
              {stats.recent.map((img) => (
                <RecentCard
                  key={img._id}
                  onClick={() => {
                    setRemixPrompt(img.prompt);
                    navigate("/create");
                  }}
                >
                  <img src={img.photoUrl} alt={img.prompt} loading="lazy" />
                  <RecentOverlay>
                    <p>{img.prompt}</p>
                    <span>Click to Remix →</span>
                  </RecentOverlay>
                </RecentCard>
              ))}
            </RecentGrid>
          )}
        </div>
      </div>
    </Page>
  );
}

export default Dashboard;


