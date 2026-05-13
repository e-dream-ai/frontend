import React, { useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import styled from "styled-components";
import { useFlowStore } from "@/stores/flow.store";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { FLOW } from "@/constants/flow-theme.constants";
import { KeyframeStrip } from "./keyframe-strip";

const FlowContainer = styled.div`
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: 16px;
  overflow: hidden;
`;

export const FlowBuilder: React.FC = () => {
  const addKeyframe = useFlowStore((s) => s.addKeyframe);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddGenerate = useCallback(() => {
    alert("Inline image generation coming in Phase 1");
  }, []);

  const handleAddUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const headers = getRequestHeaders({ contentType: ContentType.json });

      for (const file of files) {
        try {
          const extension = file.name.split(".").pop() ?? "jpg";

          const createRes = await axiosClient.post(
            "/v1/keyframe",
            { name: file.name.replace(/\.[^.]+$/, "") },
            { headers },
          );
          const keyframeUuid = createRes.data.data.keyframe.uuid;

          const initRes = await axiosClient.post(
            `/v1/keyframe/${keyframeUuid}/image/init`,
            { extension },
            { headers },
          );
          const { uploadId, urls } = initRes.data.data;

          const parts: { ETag: string; PartNumber: number }[] = [];
          const chunkSize = 5 * 1024 * 1024;
          for (let i = 0; i < urls.length; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            const chunk = file.slice(start, end);
            const uploadRes = await fetch(urls[i], {
              method: "PUT",
              body: chunk,
            });
            parts.push({
              ETag: uploadRes.headers.get("ETag") ?? "",
              PartNumber: i + 1,
            });
          }

          await axiosClient.post(
            `/v1/keyframe/${keyframeUuid}/image/complete`,
            { extension, parts, uploadId },
            { headers },
          );

          const kfRes = await axiosClient.get(`/v1/keyframe/${keyframeUuid}`);
          const kfData = kfRes.data.data.keyframe;

          addKeyframe({
            id: uuidv4(),
            keyframeUuid: kfData.uuid,
            imageUrl: kfData.image,
            name: kfData.name,
          });
        } catch (err) {
          console.error("Failed to upload keyframe image:", err);
        }
      }
    },
    [addKeyframe],
  );

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      await uploadFiles(Array.from(files));
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [uploadFiles],
  );

  const handleAddFromPlaylist = useCallback(() => {
    // TODO: Task 7 adds the playlist modal
    alert("Import from playlist coming soon");
  }, []);

  return (
    <FlowContainer>
      <KeyframeStrip
        onAddGenerate={handleAddGenerate}
        onAddUpload={handleAddUpload}
        onAddFromPlaylist={handleAddFromPlaylist}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />
    </FlowContainer>
  );
};
