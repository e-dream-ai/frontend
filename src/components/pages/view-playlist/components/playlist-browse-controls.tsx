import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownWideShort,
  faArrowUpWideShort,
  faSearch,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { SearchInput } from "@/components/shared/search-bar/search-bar.styled";
import {
  ClearButton,
  ControlButton,
  SearchField,
  Toolbar,
} from "./playlist-browse-controls.styled";

interface PlaylistBrowseControlsProps {
  search: string;
  order: "asc" | "desc";
  onSearchChange: (value: string) => void;
  onReverse: () => void;
}

export const PlaylistBrowseControls = ({
  search,
  order,
  onSearchChange,
  onReverse,
}: PlaylistBrowseControlsProps) => {
  const { t } = useTranslation();

  return (
    <Toolbar>
      <SearchField role="search">
        <FontAwesomeIcon icon={faSearch} />
        <SearchInput
          type="text"
          value={search}
          maxLength={200}
          aria-label={t("page.view_playlist.search_playlist")}
          placeholder={t("page.view_playlist.search_playlist")}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
        />
        {search ? (
          <ClearButton
            type="button"
            aria-label={t("page.view_playlist.clear_search")}
            onClick={() => onSearchChange("")}
          >
            <FontAwesomeIcon icon={faXmark} />
          </ClearButton>
        ) : null}
      </SearchField>
      <ControlButton
        type="button"
        aria-pressed={order === "desc"}
        onClick={onReverse}
      >
        <FontAwesomeIcon
          icon={order === "desc" ? faArrowUpWideShort : faArrowDownWideShort}
        />
        {t("page.view_playlist.reverse_order")}
      </ControlButton>
    </Toolbar>
  );
};
