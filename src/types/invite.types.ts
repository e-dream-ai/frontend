import { Role } from "./auth.types";

export type Invite = {
  id: number;
  code: string;
  size: string;
  signupUrl: string;
  signupRole: Role;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};
