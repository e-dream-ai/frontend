import { DEVICES } from "@/constants/devices.constants";
import ReactPaginate from "react-paginate";
import styled from "styled-components";

export const Paginate = styled(ReactPaginate)`
  display: inline-flex;
  margin: 0;
  margin-top: 1rem;

  li {
    color: ${(props) => props.theme.colorPrimary};
    list-style: none;
    margin: 1rem;
    cursor: pointer;

    &:hover {
      color: ${(props) => props.theme.colorSecondary};
    }

    &.disabled {
      color: ${(props) => props.theme.textSecondaryColor};
      cursor: not-allowed;
    }

    &.selected {
      color: ${(props) => props.theme.textPrimaryColor};
    }
  }

  @media (max-width: ${DEVICES.TABLET}) {
    li {
      flex-wrap: wrap;
      margin: 0.8rem;
    }
  }
`;
