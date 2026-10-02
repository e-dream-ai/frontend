import React, { memo, useMemo } from "react";
import moment from "moment";
import { FORMAT } from "@/constants/moment.constants";
import type { PromptHistoryEntry } from "../utils/prompt-history";
import { markPromptHistory, type PromptSegment } from "../utils/prompt-diff";
import { HISTORY_THUMB, sizedImageUrl } from "../utils/sized-image";
import {
  AddedText,
  AddedThenDroppedText,
  DiffKey,
  DiffKeyItem,
  DiffKeyRail,
  DroppedText,
  HistoryItem,
  HistoryList,
  HistoryMeta,
  HistoryPrompt,
  HistoryRow,
  HistoryText,
  HistoryThumb,
} from "./prompt-library.styled";

interface Props {
  entries: readonly PromptHistoryEntry[];
  modelLabels: Map<string, string>;
  onOpen: (uuid: string) => void;
}

const ADDED_TITLE = "Added since the prompt below";
const DROPPED_TITLE = "Removed in the prompt above";
const ADDED_THEN_DROPPED_TITLE =
  "Added since the prompt below, removed in the prompt above";

const Segment: React.FC<{ segment: PromptSegment }> = ({ segment }) => {
  if (segment.added && segment.removed) {
    return (
      <AddedThenDroppedText title={ADDED_THEN_DROPPED_TITLE}>
        {segment.text}
      </AddedThenDroppedText>
    );
  }
  if (segment.added) {
    return <AddedText title={ADDED_TITLE}>{segment.text}</AddedText>;
  }
  if (segment.removed) {
    return <DroppedText title={DROPPED_TITLE}>{segment.text}</DroppedText>;
  }
  return <>{segment.text}</>;
};

const metaLine = (entry: PromptHistoryEntry, modelLabel: string) =>
  [
    entry.name,
    entry.name.startsWith(modelLabel) ? undefined : modelLabel,
    moment(entry.createdAt).format(FORMAT),
  ]
    .filter(Boolean)
    .join(" · ");

const PromptHistoryTextListComponent: React.FC<Props> = ({
  entries,
  modelLabels,
  onOpen,
}) => {
  const marked = useMemo(
    () => markPromptHistory(entries.map((entry) => entry.origin.prompt)),
    [entries],
  );

  return (
    <>
      <DiffKey aria-label="Highlight key">
        <DiffKeyItem>
          <AddedText>added</AddedText>
          since the prompt below
        </DiffKeyItem>
        <DiffKeyItem>
          <DroppedText>removed</DroppedText>
          in the prompt above
        </DiffKeyItem>
        <DiffKeyItem>
          <DiffKeyRail aria-hidden="true" />
          linked rows are edits of each other
        </DiffKeyItem>
      </DiffKey>
      <HistoryList>
        {entries.map((entry, index) => (
          <HistoryItem
            key={entry.uuid}
            $linkedBelow={marked[index].linkedBelow}
          >
            <HistoryRow type="button" onClick={() => onOpen(entry.uuid)}>
              <HistoryThumb
                src={sizedImageUrl(entry.thumbnail, HISTORY_THUMB)}
                alt=""
                loading="lazy"
              />
              <HistoryText>
                <HistoryMeta>
                  {metaLine(
                    entry,
                    modelLabels.get(entry.origin.algorithm) ??
                      entry.origin.algorithm,
                  )}
                </HistoryMeta>
                <HistoryPrompt>
                  {marked[index].segments.map((segment, i) => (
                    <Segment key={i} segment={segment} />
                  ))}
                </HistoryPrompt>
              </HistoryText>
            </HistoryRow>
          </HistoryItem>
        ))}
      </HistoryList>
    </>
  );
};

export const PromptHistoryTextList = memo(PromptHistoryTextListComponent);
