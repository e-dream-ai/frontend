import React, { useState, useMemo, useCallback } from "react";
import moment from "moment";
import type { Dream } from "@/types/dream.types";
import { useMyImageDreams } from "@/api/dream/query/useMyImageDreams";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteScrollSentinel } from "@/hooks/useInfiniteScrollSentinel";
import { FORMAT } from "@/constants/moment.constants";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import { useUuidSelection } from "../hooks/useUuidSelection";
import { SelectImageDreamCard } from "./select-image-dream-card";
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
  Footer,
  CountLabel,
  FooterButtons,
  CancelBtn,
  AddBtn,
  LoadingMore,
  Sentinel,
} from "./select-image-dream-modal.styled";

interface Props {
  onClose: () => void;
  /** Dream UUIDs already present in the caller's collection; shown as
   *  "already added" and skipped on add. */
  existingDreamUuids: Set<string>;
  /** Receives the selected dreams that are not already present. The caller
   *  owns the mapping into its own store shape (flow frame vs studio image). */
  onAdd: (dreams: Dream[]) => void;
}

export const SelectImageDreamModal: React.FC<Props> = ({
  onClose,
  existingDreamUuids,
  onAdd,
}) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useMyImageDreams(debouncedSearch || undefined);

  const { rootRef, sentinelRef } = useInfiniteScrollSentinel<HTMLDivElement>({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const dreams = useMemo(
    () => data?.pages.flatMap((p) => p.data?.dreams ?? []) ?? [],
    [data],
  );

  const madeByUuid = useMemo(
    () =>
      new Map(
        dreams.map((d): [string, string] => [
          d.uuid,
          d.created_at ? moment(d.created_at).format(FORMAT) : d.name,
        ]),
      ),
    [dreams],
  );

  const { selectedUuids, toggle } = useUuidSelection();

  const handleAdd = useCallback(() => {
    const picked = dreams.filter(
      (dream) =>
        selectedUuids.has(dream.uuid) && !existingDreamUuids.has(dream.uuid),
    );
    if (picked.length > 0) onAdd(picked);
    onClose();
  }, [dreams, selectedUuids, existingDreamUuids, onAdd, onClose]);

  const isEmpty = !isLoading && dreams.length === 0;
  const totalCount = data?.pages[0]?.data?.count ?? dreams.length;

  // Escape closes, Tab stays inside, the page behind stops scrolling.
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);

  return (
    <Overlay
      ref={overlayRef}
      tabIndex={-1}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="My Image Library"
    >
      <Panel onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>My Image Library</Title>
          <CloseBtn onClick={onClose} aria-label="Close">
            &times;
          </CloseBtn>
        </Header>

        <SearchRow>
          <SearchInput
            placeholder="Search images..."
            aria-label="Search images"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-autofocus
          />
        </SearchRow>

        <Body ref={rootRef}>
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
            <>
              <Grid>
                {dreams.map((dream) => (
                  <SelectImageDreamCard
                    key={dream.uuid}
                    dream={dream}
                    made={madeByUuid.get(dream.uuid) ?? dream.name}
                    isSelected={selectedUuids.has(dream.uuid)}
                    alreadyAdded={existingDreamUuids.has(dream.uuid)}
                    onToggle={toggle}
                  />
                ))}
              </Grid>
              <Sentinel ref={sentinelRef} aria-hidden="true" />
              {isFetchingNextPage && <LoadingMore>Loading more...</LoadingMore>}
            </>
          )}
        </Body>

        <Footer>
          <CountLabel>
            {selectedUuids.size > 0
              ? `${selectedUuids.size} selected`
              : `${totalCount} image${totalCount !== 1 ? "s" : ""}`}
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
