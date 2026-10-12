import React from "react";
import { generateCloudflareImageURL } from "@/utils/image-handler";
import {
  PlaylistCardInfo,
  PlaylistCardMeta,
  PlaylistCardName,
  PlaylistCardShell,
  PlaylistCardThumb,
} from "./enhance-app.styled";

const CARD_THUMB = { width: 200, fit: "cover" as const };

type Props = {
  name: string;
  /** One line each, under the name. */
  meta: string[];
  thumbnail?: string | null;
  children?: React.ReactNode;
};

export const EnhancePlaylistCard: React.FC<Props> = ({
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
      {meta.map((line) => (
        <PlaylistCardMeta key={line}>{line}</PlaylistCardMeta>
      ))}
    </PlaylistCardInfo>
    {children}
  </PlaylistCardShell>
);
