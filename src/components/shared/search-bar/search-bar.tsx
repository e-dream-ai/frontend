import {
  SearchBarIcon,
  SearchInput,
  StyledSearchBar,
} from "./search-bar.styled";

const SearchBar = () => {
  return (
    <StyledSearchBar>
      <SearchInput />
      <SearchBarIcon className="fa fa-search" />
    </StyledSearchBar>
  );
};

export default SearchBar;
