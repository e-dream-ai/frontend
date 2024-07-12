import { FileState } from "@/constants/file.constants";
import { MultiMediaState } from "@/types/media.types";
import { useState } from "react";
import { useParams } from "react-router-dom";

type Params = { id: string };

export const usePlaylistState = () => {
  const { id } = useParams<Params>();
  const playlistId = id ? Number(id) : undefined;
  const [userSearch, setUserSearch] = useState<string>("");
  const [videos, setVideos] = useState<FileState[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [currentUploadFile, setCurrentUploadFile] = useState(0);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isThumbnailRemoved, setIsThumbnailRemoved] = useState<boolean>(false);
  const [thumbnail, setTumbnail] = useState<MultiMediaState>();
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] =
    useState<boolean>(false);

  return {
    playlistId,
    userSearch,
    setUserSearch,
    videos,
    setVideos,
    isUploadingFiles,
    setIsUploadingFiles,
    currentUploadFile,
    setCurrentUploadFile,
    editMode,
    setEditMode,
    isThumbnailRemoved,
    setIsThumbnailRemoved,
    thumbnail,
    setTumbnail,
    showConfirmDeleteModal,
    setShowConfirmDeleteModal,
  };
};
