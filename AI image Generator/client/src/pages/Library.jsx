import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";
import {
  FolderRounded,
  DeleteOutlineRounded,
  DriveFileMoveRounded,
  CheckBoxOutlineBlankRounded,
  CheckBoxRounded,
} from "@mui/icons-material";
import Button from "../components/Button";
import { LIBRARY_FOLDERS, LIBRARY_IMAGES } from "../data/mockImages";
import { imagesApi } from "../api/client";

const Page = styled.div`
  padding: 32px 32px 64px;
  max-width: 1300px;
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
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

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

const FolderSection = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FolderCard = styled.button`
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.primary : theme.border};
  background: ${({ $active, theme }) =>
    $active ? theme.card_light : theme.card};
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
  text-align: left;
  font-family: inherit;
  color: inherit;

  svg {
    font-size: 24px;
    color: ${({ $color }) => $color || "#6366f1"};
  }

  &:hover {
    border-color: ${({ theme }) => theme.borderHover};
  }
`;

const FolderMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 13.5px;
    font-weight: 600;
    color: ${({ theme }) => theme.text_primary};
  }

  span {
    font-size: 11.5px;
    color: ${({ theme }) => theme.text_muted};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 1040px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 680px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 440px) {
    grid-template-columns: 1fr;
  }
`;

const ImageCard = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.card};
  border: 1px solid
    ${({ $selected, theme }) =>
      $selected ? theme.primary : theme.border};
  cursor: pointer;
  aspect-ratio: 1;
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

const SelectMark = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  color: ${({ $selected, theme }) => ($selected ? theme.primary : "#ffffff")};
  background: rgba(10, 10, 14, 0.85);
  border-radius: 4px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.15);

  svg {
    font-size: 16px;
  }
`;

const Caption = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 12px;
  background: linear-gradient(transparent, rgba(10, 10, 14, 0.95));
  font-size: 11.5px;
  font-weight: 500;
  color: #f4f4f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BulkBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 10px 16px;

  span {
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.text_primary};
  }
`;

const BulkActions = styled.div`
  display: flex;
  gap: 8px;
`;

function Library() {
  const [activeFolder, setActiveFolder] = useState("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [images, setImages] = useState(LIBRARY_IMAGES);
  const [folders, setFolders] = useState(LIBRARY_FOLDERS);
  const [usingMock, setUsingMock] = useState(true);

  const load = async () => {
    try {
      const { data } = await imagesApi.library();
      if (data?.images?.length) {
        const mapped = data.images.map((img) => ({
          id: img._id || img.id,
          photo: img.photoUrl || img.photo,
          prompt: img.prompt,
          folder: img.folder || "all",
        }));
        setImages(mapped);
      }
      if (data?.folders?.length) {
        setFolders([
          { id: "all", name: "All Images", color: "#6366f1" },
          ...data.folders.map((f) => ({
            id: f._id || f.id || f.name.toLowerCase(),
            name: f.name,
            color: f.color || "#0ea5e9",
          })),
        ]);
      }
      setUsingMock(false);
    } catch (err) {
      setUsingMock(true);
      setImages(LIBRARY_IMAGES);
      setFolders(LIBRARY_FOLDERS);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    if (activeFolder === "all") return images;
    return images.filter((img) => img.folder === activeFolder);
  }, [activeFolder, images]);

  const folderCounts = useMemo(() => {
    const counts = { all: images.length };
    folders.forEach((f) => {
      if (f.id !== "all") {
        counts[f.id] = images.filter((img) => img.folder === f.id).length;
      }
    });
    return counts;
  }, [images, folders]);

  const toggleSelect = (id) => {
    if (!selectMode) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const exitSelect = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  const deleteSelected = async () => {
    if (usingMock) {
      setImages((prev) => prev.filter((img) => !selectedIds.includes(img.id)));
    } else {
      await imagesApi.delete(selectedIds);
      await load();
      toast.success(`Deleted ${selectedIds.length} image(s)`);
    }
    exitSelect();
  };

  const moveSelected = async () => {
    const target =
      activeFolder === "all"
        ? folders.find((f) => f.id !== "all")?.id || "favorites"
        : activeFolder;

    if (usingMock) {
      setImages((prev) =>
        prev.map((img) =>
          selectedIds.includes(img.id) ? { ...img, folder: target } : img
        )
      );
    } else {
      await imagesApi.move(selectedIds, target);
      await load();
    }
    exitSelect();
  };

  return (
    <Page>
      <Header>
        <div>
          <h1>Saved Library</h1>
          <p>Organize and manage your generated creations into folders</p>
        </div>
        <Button
          text={selectMode ? "Done" : "Batch Select"}
          type="secondary"
          onClick={() => (selectMode ? exitSelect() : setSelectMode(true))}
        />
      </Header>

      <FolderSection>
        {folders.map((folder) => (
          <FolderCard
            key={folder.id}
            $active={activeFolder === folder.id}
            $color={folder.color}
            onClick={() => setActiveFolder(folder.id)}
          >
            <FolderRounded />
            <FolderMeta>
              <strong>{folder.name}</strong>
              <span>{folderCounts[folder.id] ?? 0} artworks</span>
            </FolderMeta>
          </FolderCard>
        ))}
      </FolderSection>

      {selectMode && selectedIds.length > 0 && (
        <BulkBar>
          <span>{selectedIds.length} items selected</span>
          <BulkActions>
            <Button
              text="Move to Folder"
              leftIcon={<DriveFileMoveRounded style={{ fontSize: 16 }} />}
              onClick={moveSelected}
            />
            <Button
              text="Delete"
              type="danger"
              leftIcon={<DeleteOutlineRounded style={{ fontSize: 16 }} />}
              onClick={deleteSelected}
            />
          </BulkActions>
        </BulkBar>
      )}

      <Grid>
        {visible.map((img) => {
          const isSelected = selectedIds.includes(img.id);
          return (
            <ImageCard
              key={img.id}
              $selected={isSelected}
              onClick={() => toggleSelect(img.id)}
            >
              <img src={img.photo} alt={img.prompt} loading="lazy" />
              {selectMode && (
                <SelectMark $selected={isSelected}>
                  {isSelected ? (
                    <CheckBoxRounded />
                  ) : (
                    <CheckBoxOutlineBlankRounded />
                  )}
                </SelectMark>
              )}
              <Caption>{img.prompt}</Caption>
            </ImageCard>
          );
        })}
      </Grid>
    </Page>
  );
}

export default Library;


