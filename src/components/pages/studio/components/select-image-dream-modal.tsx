import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { useMyImageDreams } from "@/api/dream/query/useMyImageDreams";
import { useFlowStore } from "@/stores/flow.store";
import { useDebounce } from "@/hooks/useDebounce";
import { FORMAT } from "@/constants/moment.constants";
import { useExistingDreamUuids } from "../hooks/useExistingDreamUuids";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import { useUuidSelection } from "../hooks/useUuidSelection";
import { mediaAspectRatio } from "../utils/media-aspect-ratio";
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
  Sentinel,
} from "./select-image-dream-modal.styled";

interface Props {
  onClose: () => void;
}

export const SelectImageDreamModal: React.FC<Props> = ({ onClose }) => {
  const addReferenceFrame = useFlowStore((s) => s.addReferenceFrame);
  const existingDreamUuids = useExistingDreamUuids();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useMyImageDreams(debouncedSearch || undefined);

  // Load the next page when the end of the grid is in view. Not on scroll:
  // one page of results fits inside the modal (cards take their image's shape,
  // so a row is short), and a list that cannot be scrolled would never ask for
  // page two. Visibility covers both — it fills the modal on open, then keeps
  // up as you scroll.
  const bodyRef = useRef<HTMLDivElement>(null);
  const [endOfGrid, setEndOfGrid] = useState<HTMLDivElement | null>(null);
  // Read through a ref so the observer is built once. Rebuilding it per fetch
  // re-reports a sentinel that never moved as a fresh sighting, which walks the
  // whole library in one go.
  const paging = useRef({ hasNextPage, isFetchingNextPage, fetchNextPage });
  paging.current = { hasNextPage, isFetchingNextPage, fetchNextPage };

  useEffect(() => {
    if (!endOfGrid) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const { hasNextPage, isFetchingNextPage, fetchNextPage } =
          paging.current;
        if (!entries.some((e) => e.isIntersecting)) return;
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { root: bodyRef.current, rootMargin: "150px" },
    );
    observer.observe(endOfGrid);
    return () => observer.disconnect();
  }, [endOfGrid]);

  const dreams = useMemo(
    () => data?.pages.flatMap((p) => p.data?.dreams ?? []) ?? [],
    [data],
  );

  const { selectedUuids, toggle } = useUuidSelection();

  const handleAdd = useCallback(() => {
    for (const dream of dreams) {
      if (!selectedUuids.has(dream.uuid) || existingDreamUuids.has(dream.uuid))
        continue;
      const imageUrl =
        dream.video || dream.original_video || dream.thumbnail || "";
      addReferenceFrame({
        id: uuidv4(),
        dreamUuid: dream.uuid,
        imageUrl,
        name: dream.name,
      });
    }
    onClose();
  }, [dreams, selectedUuids, existingDreamUuids, addReferenceFrame, onClose]);

  const isEmpty = !isLoading && dreams.length === 0;

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

        <Body ref={bodyRef}>
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
                {dreams.map((dream) => {
                  const isSelected = selectedUuids.has(dream.uuid);
                  const alreadyAdded = existingDreamUuids.has(dream.uuid);
                  // Generated names repeat ("FLUX.1 [schnell] 27" many times
                  // over), so when telling two cards apart the time they were
                  // made is the part that differs. The name is already printed
                  // under the image.
                  const made = dream.created_at
                    ? moment(dream.created_at).format(FORMAT)
                    : dream.name;
                  const imageUrl =
                    dream.thumbnail ||
                    dream.video ||
                    dream.original_video ||
                    "";
                  return (
                    <Card
                      key={dream.uuid}
                      $selected={isSelected}
                      $disabled={alreadyAdded}
                      onClick={() => !alreadyAdded && toggle(dream.uuid)}
                      title={alreadyAdded ? `${made} — already in strip` : made}
                    >
                      {imageUrl && (
                        <CardImg
                          src={imageUrl}
                          alt={dream.name}
                          $ratio={mediaAspectRatio(
                            dream.processedMediaWidth,
                            dream.processedMediaHeight,
                          )}
                        />
                      )}
                      {isSelected && <CardCheckmark>✓</CardCheckmark>}
                      <CardName>{dream.name}</CardName>
                    </Card>
                  );
                })}
              </Grid>
              <Sentinel ref={setEndOfGrid} />
              {isFetchingNextPage && <LoadingMore>Loading more...</LoadingMore>}
            </>
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
