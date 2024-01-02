import { User } from "./auth.types";

export type Dream = {
  id: number;
  name: string;
  activityLevel: number;
  thumbnail: string;
  updated_at: string;
  user: Omit<User, "token">;
  uuid: string;
  video: string;
  created_at: string;
};
