import { User } from "@/types/auth.types";

export const getUserName = (user?: Omit<User, "token">) => user?.name || "-";

export const getUserEmail = (user?: Omit<User, "token">) => user?.email || "-";

export const getUserNameOrEmail = (user?: Omit<User, "token">) =>
  user?.name || user?.email || "-";
