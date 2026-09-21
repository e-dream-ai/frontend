import React from "react";
import { generateCloudflareImageURL } from "@/utils/image-handler";
import {
  PlaylistCardInfo,
  PlaylistCardMeta,
  PlaylistCardName,
  PlaylistCardShell,
  PlaylistCardThumb,
} from "./uprez-app.styled";

const CARD_THUMB = { width: 200, fit: "cover" as const };

type Props = {
  name: string;
  meta: string;
  thumbnail?: string | null;
  children?: React.ReactNode;
};

export const UprezPlaylistCard: React.FC<Props> = ({
  name,
  meta,
  thumbnail,
  children,
}) => (
  <PlaylistCardShell>
    {thumbnail ? (
      <PlaylistCardThumb
        src={generateCloudflareImageURL(thumbnail, CARD_THUMB)}
        alt=""
      />
    ) : null}
    <PlaylistCardInfo>
      <PlaylistCardName>{name}</PlaylistCardName>
      <PlaylistCardMeta>{meta}</PlaylistCardMeta>
    </PlaylistCardInfo>
    {children}
  </PlaylistCardShell>
);
