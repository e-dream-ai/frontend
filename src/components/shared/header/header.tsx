import { Anchor } from "../anchor/anchor";
import { AuthHeader } from "./auth-header";
import StyledHeader, {
  HeaderImage,
  HeaderList,
  HeaderListItem,
  NavHeader,
} from "./header.styled";

const NAV_ROUTES: Array<{ name: string }> = [
  { name: "About" },
  { name: "Download" },
  { name: "Sheep" },
  { name: "FAQ" },
  { name: "Gear" },
  { name: "Blog" },
  { name: "Forum" },
];

const MenuHeader: React.FC = () => {
  return (
    <HeaderList>
      {NAV_ROUTES.map((route) => (
        <HeaderListItem key={route.name}>
          <Anchor>{route.name}</Anchor>
        </HeaderListItem>
      ))}
    </HeaderList>
  );
};

export const Header: React.FC = () => {
  return (
    <StyledHeader>
      <HeaderImage
        src="/images/es-logo.svg"
        className="img-responsive"
        alt="Electric Sheep"
      />
      <NavHeader>
        <AuthHeader></AuthHeader>
        <MenuHeader></MenuHeader>
      </NavHeader>
    </StyledHeader>
  );
};

export default Header;
