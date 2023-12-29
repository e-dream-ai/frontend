import {
  ChangeEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useState,
} from "react";
import {
  SearchBarClearButton,
  SearchBarIcon,
  SearchInput,
  StyledSearchBar,
} from "./search-bar.styled";
import { faRemove, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type SearchBarProps = {
  showClearButton?: boolean;
  onSearch?: (value?: string) => void;
  onClear?: () => void;
};

const SearchBar: React.FC<SearchBarProps> = ({
  showClearButton,
  onSearch,
  onClear,
}) => {
  const [search, setSearch] = useState<string | undefined>();

  const handleSearchInputChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => setSearch(event.target.value);

  const handleSearchBarIconClick: MouseEventHandler<HTMLButtonElement> = (
    _,
  ) => {
    onSearch?.(search);
  };

  const handleOnKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSearch?.(search);
    }
  };

  const handleSearchBarClearClick: MouseEventHandler<HTMLButtonElement> = (
    _,
  ) => {
    onClear?.();
    setSearch("");
  };

  return (
    <StyledSearchBar>
      <SearchInput
        value={search}
        onKeyDown={handleOnKeyDown}
        onChange={handleSearchInputChange}
      />
      {showClearButton ? (
        <SearchBarClearButton onClick={handleSearchBarClearClick}>
          <FontAwesomeIcon icon={faRemove} />
        </SearchBarClearButton>
      ) : (
        false
      )}
      <SearchBarIcon onClick={handleSearchBarIconClick}>
        <FontAwesomeIcon icon={faSearch} />
      </SearchBarIcon>
    </StyledSearchBar>
  );
};

export default SearchBar;
