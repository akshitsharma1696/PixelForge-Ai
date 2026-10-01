import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import {
  AutoAwesomeRounded,
  ShareRounded,
  PersonAddRounded,
  CheckRounded,
  BrushRounded,
  ChatBubbleOutlineRounded,
} from "@mui/icons-material";
import Button from "../components/Button";
import PromptModal from "../components/PromptModal";
import { socialApi } from "../api/client";
import { useApp } from "../context/AppContext";

const Page = styled.div`
  padding: 32px 32px 64px;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;

  @media (max-width: 768px) {
    padding: 20px 16px 48px;
    gap: 20px;
  }
`;

const ProfileCard = styled.div`
  border-radius: 8px;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const HeroBanner = styled.div`
  height: 120px;
  background: #1a1b22;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const ProfileInfo = styled.div`
  padding: 0 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
`;

const AvatarRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: -40px;
  gap: 16px;
  flex-wrap: wrap;
`;

const AvatarCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary};
  border: 3px solid ${({ theme }) => theme.card};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const BioBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: ${({ theme }) => theme.text_primary};
  }

  .handle {
    font-size: 13px;
    color: ${({ theme }) => theme.text_muted};
  }

  p {
    margin: 6px 0 0;
    color: ${({ theme }) => theme.text_secondary};
    font-size: 13.5px;
    line-height: 1.5;
    max-width: 680px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.border};

  div {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: ${({ theme }) => theme.text_secondary};

    strong {
      color: ${({ theme }) => theme.text_primary};
      font-weight: 600;
    }
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

const ArtworkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 550px) {
    grid-template-columns: 1fr;
  }
`;

const ArtCard = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  aspect-ratio: 1;
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

const ArtOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10, 10, 14, 0.95) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.15s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 12px;
  gap: 8px;

  ${ArtCard}:hover & {
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
`;

const RemixBtn = styled.button`
  background: ${({ theme }) => theme.primary};
  border: none;
  color: white;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  font-family: inherit;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
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

function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { setRemixPrompt, isAuthenticated } = useApp();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedArt, setSelectedArt] = useState(null);

  const load = async () => {
    try {
      const res = await socialApi.profile(username);
      setData(res.data);
      setError("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Profile not found";
      setError(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    load();
  }, [username]);

  const toggleFollow = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to follow creators");
      return;
    }
    if (isFollowing) {
      setIsFollowing(false);
      toast("Unfollowed creator", { icon: "👋" });
    } else {
      setIsFollowing(true);
      toast.success(`Following @${username}!`);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied!");
    }
  };

  const addFriend = async () => {
    setBusy(true);
    try {
      await socialApi.sendRequest(username);
      toast.success(`Friend request sent to @${username}`);
      await load();
    } catch (err) {
      const msg = err?.response?.data?.message || "Request failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  if (error && !data) {
    return (
      <Page>
        <EmptyState>
          <BrushRounded style={{ fontSize: 32 }} />
          <h3>Profile Not Found</h3>
          <p>{error}</p>
          <Button text="Back to Explore" onClick={() => navigate("/community")} />
        </EmptyState>
      </Page>
    );
  }

  if (!data) {
    return (
      <Page>
        <EmptyState>
          <AutoAwesomeRounded style={{ fontSize: 32 }} />
          <h3>Loading Profile…</h3>
        </EmptyState>
      </Page>
    );
  }

  const { profile, images, isSelf, isFriend, requestStatus } = data;
  const displayName = profile.name || "Creator";
  const bioText =
    profile.bio ||
    "Generating creative visual art with PixelForge latent diffusion.";

  return (
    <Page>
      <ProfileCard>
        <HeroBanner />
        <ProfileInfo>
          <AvatarRow>
            <AvatarCircle>{displayName[0]?.toUpperCase()}</AvatarCircle>

            <ActionButtons>
              {!isSelf && (
                <Button
                  text={isFollowing ? "Following" : "Follow"}
                  type={isFollowing ? "secondary" : "primary"}
                  leftIcon={
                    isFollowing ? (
                      <CheckRounded style={{ fontSize: 15 }} />
                    ) : (
                      <PersonAddRounded style={{ fontSize: 15 }} />
                    )
                  }
                  onClick={toggleFollow}
                />
              )}

              {!isSelf && isAuthenticated && !isFriend && requestStatus !== "outgoing" && (
                <Button
                  text={requestStatus === "incoming" ? "Respond in Social" : "Add Friend"}
                  type="secondary"
                  onClick={
                    requestStatus === "incoming"
                      ? () => navigate("/social")
                      : addFriend
                  }
                  isLoading={busy}
                />
              )}

              {!isSelf && isFriend && (
                <Button
                  text="Message"
                  type="secondary"
                  leftIcon={<ChatBubbleOutlineRounded style={{ fontSize: 15 }} />}
                  onClick={() => navigate("/social")}
                />
              )}

              {isSelf && (
                <Button
                  text="Create Art"
                  leftIcon={<AutoAwesomeRounded style={{ fontSize: 15 }} />}
                  onClick={() => navigate("/create")}
                />
              )}

              <Button
                text="Share"
                type="secondary"
                leftIcon={<ShareRounded style={{ fontSize: 15 }} />}
                onClick={handleShare}
              />
            </ActionButtons>
          </AvatarRow>

          <BioBlock>
            <h1>{displayName}</h1>
            <div className="handle">@{profile.username}</div>
            <p>{bioText}</p>
          </BioBlock>

          <StatsRow>
            <div>
              <strong>{images.length}</strong> creations
            </div>
            <div>
              <strong>{profile.friendsCount || 0}</strong> connections
            </div>
          </StatsRow>
        </ProfileInfo>
      </ProfileCard>

      <SectionHeader>
        <h2>Published Creations</h2>
        <span style={{ fontSize: "12.5px", color: "#71717a" }}>
          {images.length} works
        </span>
      </SectionHeader>

      {images.length === 0 ? (
        <EmptyState>
          <BrushRounded style={{ fontSize: 32 }} />
          <h3>No creations published yet</h3>
          <p>
            {isSelf
              ? "Create and publish your first artwork from the Studio."
              : "This creator has not published any public artwork yet."}
          </p>
          {isSelf && (
            <Button
              text="Open Studio"
              leftIcon={<AutoAwesomeRounded style={{ fontSize: 15 }} />}
              onClick={() => navigate("/create")}
            />
          )}
        </EmptyState>
      ) : (
        <ArtworkGrid>
          {images.map((img) => (
            <ArtCard
              key={img._id}
              onClick={() =>
                setSelectedArt({
                  id: img._id,
                  photoUrl: img.photoUrl,
                  prompt: img.prompt,
                  authorName: displayName,
                  settings: {
                    style: img.style || "Realistic",
                    aspect: img.aspectRatio || "1:1",
                  },
                })
              }
            >
              <img src={img.photoUrl} alt={img.prompt} loading="lazy" />
              <ArtOverlay>
                <p>{img.prompt}</p>
                <RemixBtn
                  onClick={(e) => {
                    e.stopPropagation();
                    setRemixPrompt(img.prompt);
                    navigate("/create");
                  }}
                >
                  <AutoAwesomeRounded style={{ fontSize: 12 }} />
                  Remix
                </RemixBtn>
              </ArtOverlay>
            </ArtCard>
          ))}
        </ArtworkGrid>
      )}

      <PromptModal item={selectedArt} onClose={() => setSelectedArt(null)} />
    </Page>
  );
}

export default Profile;


