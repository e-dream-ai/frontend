import { User } from "./auth.types";

export type Keyframe = {
  id: number;
  uuid: string;
  name: string;
  image: string;
  user: User;
  displayedOwner: User;
  created_at: string;
  updated_at: string;
};
