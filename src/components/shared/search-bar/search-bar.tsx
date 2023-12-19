import {
  ChangeEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useState,
} from "react";
import {
  SearchBarIcon,
  SearchInput,
  StyledSearchBar,
} from "./search-bar.styled";

type SearchBarProps = {
  onSearch?: (value?: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [search, setSearch] = useState<string | undefined>();

  const handleSearchInputChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => setSearch(event.target.value);

  const handleSearchBarIconClick: MouseEventHandler<HTMLLIElement> = (_) => {
    onSearch?.(search);
  };

  const handleOnKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSearch?.(search);
    }
  };

  return (
    <StyledSearchBar>
      <SearchInput
        onKeyDown={handleOnKeyDown}
        onChange={handleSearchInputChange}
      />
      <SearchBarIcon
        className="fa fa-search"
        onClick={handleSearchBarIconClick}
      />
    </StyledSearchBar>
  );
};

export default SearchBar;
