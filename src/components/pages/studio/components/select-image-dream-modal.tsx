import React, { useState, useMemo, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import InfiniteScroll from "react-infinite-scroll-component";
import { useMyImageDreams } from "@/api/dream/query/useMyImageDreams";
import { useFlowStore } from "@/stores/flow.store";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Overlay,
  Panel,
  Header,
  Title,
  CloseBtn,
  SearchRow,
  SearchInput,
  Body,
  EmptyMsg,
  Grid,
  SkeletonCard,
  Card,
  CardImg,
  CardCheckmark,
  CardName,
  Footer,
  CountLabel,
  FooterButtons,
  CancelBtn,
  AddBtn,
  LoadingMore,
} from "./select-image-dream-modal.styled";

const SCROLL_TARGET_ID = "image-dream-modal-body";

interface Props {
  onClose: () => void;
}

export const SelectImageDreamModal: React.FC<Props> = ({ onClose }) => {
  const addKeyframe = useFlowStore((s) => s.addKeyframe);
  const keyframes = useFlowStore((s) => s.keyframes);
  const existingDreamUuids = useMemo(
    () =>
      new Set(
        keyframes
          .map((kf) => kf.dreamUuid)
          .filter((v): v is string => Boolean(v)),
      ),
    [keyframes],
  );

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, hasNextPage, fetchNextPage } = useMyImageDreams(
    debouncedSearch || undefined,
  );

  const dreams = useMemo(
    () => data?.pages.flatMap((p) => p.data?.dreams ?? []) ?? [],
    [data],
  );

  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set());

  const toggle = useCallback((uuid: string) => {
    setSelectedUuids((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  }, []);

  const handleAdd = useCallback(() => {
    for (const dream of dreams) {
      if (!selectedUuids.has(dream.uuid) || existingDreamUuids.has(dream.uuid))
        continue;
      const imageUrl =
        dream.video || dream.original_video || dream.thumbnail || "";
      addKeyframe({
        id: uuidv4(),
        dreamUuid: dream.uuid,
        imageUrl,
        name: dream.name,
      });
    }
    onClose();
  }, [dreams, selectedUuids, existingDreamUuids, addKeyframe, onClose]);

  const isEmpty = !isLoading && dreams.length === 0;

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>My Image Library</Title>
          <CloseBtn onClick={onClose}>&times;</CloseBtn>
        </Header>

        <SearchRow>
          <SearchInput
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </SearchRow>

        <Body id={SCROLL_TARGET_ID}>
          {isLoading ? (
            <Grid>
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </Grid>
          ) : isEmpty ? (
            <EmptyMsg>
              {debouncedSearch
                ? "No images match your search."
                : "No image dreams yet. Upload images in the studio to see them here."}
            </EmptyMsg>
          ) : (
            <InfiniteScroll
              dataLength={dreams.length}
              next={fetchNextPage}
              hasMore={hasNextPage ?? false}
              loader={<LoadingMore>Loading more...</LoadingMore>}
              scrollableTarget={SCROLL_TARGET_ID}
            >
              <Grid>
                {dreams.map((dream) => {
                  const isSelected = selectedUuids.has(dream.uuid);
                  const alreadyAdded = existingDreamUuids.has(dream.uuid);
                  const imageUrl =
                    dream.thumbnail ||
                    dream.video ||
                    dream.original_video ||
                    "";
                  return (
                    <Card
                      key={dream.uuid}
                      $selected={isSelected}
                      onClick={() => !alreadyAdded && toggle(dream.uuid)}
                      style={
                        alreadyAdded
                          ? { opacity: 0.4, cursor: "default" }
                          : undefined
                      }
                      title={alreadyAdded ? "Already in strip" : dream.name}
                    >
                      {imageUrl && <CardImg src={imageUrl} alt={dream.name} />}
                      {isSelected && <CardCheckmark>✓</CardCheckmark>}
                      <CardName>{dream.name}</CardName>
                    </Card>
                  );
                })}
              </Grid>
            </InfiniteScroll>
          )}
        </Body>

        <Footer>
          <CountLabel>
            {selectedUuids.size > 0
              ? `${selectedUuids.size} selected`
              : `${dreams.length} image${dreams.length !== 1 ? "s" : ""}`}
          </CountLabel>
          <FooterButtons>
            <CancelBtn onClick={onClose}>Cancel</CancelBtn>
            <AddBtn onClick={handleAdd} disabled={selectedUuids.size === 0}>
              Add{selectedUuids.size > 0 ? ` (${selectedUuids.size})` : ""}
            </AddBtn>
          </FooterButtons>
        </Footer>
      </Panel>
    </Overlay>
  );
};
