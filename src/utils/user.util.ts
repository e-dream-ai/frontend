import { User } from "@/types/auth.types";

export const getUserName = (user?: Omit<User, "token">) => user?.name || "-";
