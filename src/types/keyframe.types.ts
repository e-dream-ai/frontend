import { User } from "./auth.types";
import { Dream } from "./dream.types";

export type Keyframe = {
  id: number;
  uuid: string;
  name: string;
  image: string;
  user: User;
  displayedOwner: User;
  dreams: Dream[];
  created_at: string;
  updated_at: string;
};
