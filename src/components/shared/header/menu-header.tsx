import { Anchor } from "../anchor/anchor";
import { HeaderList, HeaderListItem } from "./header.styled";

const NAV_ROUTES: Array<{ name: string }> = [
  { name: "About" },
  { name: "Download" },
  { name: "Sheep" },
  { name: "FAQ" },
  { name: "Gear" },
  { name: "Blog" },
  { name: "Forum" },
];

export const MenuHeader: React.FC = () => {
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
