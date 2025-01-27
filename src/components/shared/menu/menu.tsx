import { DEVICES } from "@/constants/devices.constants";
import {
  MenuButton as MenuButtonComponent,
  Menu as MenuComponent,
  MenuItem as MenuItemComponent,
  FocusableItem as FocusableItemComponent,
} from "@szhsin/react-menu";
import styled from "styled-components";

export const MenuButton = styled(MenuButtonComponent)`
  height: fit-content;
  cursor: pointer;
  background-color: transparent;
  border: 0;
  color: ${(props) => props.theme.colorPrimary};
  font-size: 1rem;
`;

export const MenuItem = styled(MenuItemComponent)`
  color: ${(props) => props.theme.textAccentColor};
  background-color: ${(props) => props.theme.inputBackgroundColor};
  &:hover {
    background-color: ${(props) => props.theme.inputBackgroundColor};
    color: ${(props) => props.theme.colorSecondary};
  }
`;

export const Menu = styled(MenuComponent)`
  .my-menu {
    background-color: ${(props) => props.theme.inputBackgroundColor};
  }

  .my-kebab-menu {
    background-color: ${(props) => props.theme.inputBackgroundColor};
    
    .mobile {
      display: none;
    }
    .desktop {
      display: flex;
    }

    @media (max-width: ${DEVICES.TABLET}) {
      .desktop {
        display: none;
      }
      .mobile {
        display: flex;
      }
    }
  }
`;

export const FocusableItem = styled(FocusableItemComponent)``;
