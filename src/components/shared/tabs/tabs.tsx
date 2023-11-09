import { TabList as TabListReactTabs } from "react-tabs";
import styled from "styled-components";

export const TabList = styled(TabListReactTabs)`
  display: inline-flex;
  margin: 0;
  margin-bottom: 1rem;
  padding: 0;
  li {
    list-style: none;
    margin-right: 0.5rem;
    padding: 0.5rem 0.5rem;
    color: ${(props) => props.theme.textPrimaryColor};
    cursor: pointer;

    &:hover {
      background-color: ${(props) => props.theme.colorPrimary};
    }

    &[aria-selected="true"] {
      color: ${(props) => props.theme.colorPrimary};
      border-bottom: 1px solid ${(props) => props.theme.colorPrimary};
    }

    &[aria-selected="true"]:hover {
      background-color: transparent;
      cursor: default;
    }
  }
`;
