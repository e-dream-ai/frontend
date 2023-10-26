import ReactPaginate from "react-paginate";
import styled from "styled-components";

export const Paginate = styled(ReactPaginate)`
  display: inline-flex;

  li {
    color: ${(props) => props.theme.primary};
    list-style: none;
    margin: 1rem;
    cursor: pointer;

    &:hover {
      color: ${(props) => props.theme.text1};
    }

    &.disabled {
      color: ${(props) => props.theme.text2};
      cursor: not-allowed;
    }

    &.selected {
      color: ${(props) => props.theme.text1};
    }
  }
`;
