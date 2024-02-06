import { User } from "@/types/auth.types";

export const getUserName = (user: User) => user.name || user.email || "-";
