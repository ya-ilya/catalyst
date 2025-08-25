import { Cape } from "./Cape";

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  isPasswordChangeRequired: boolean;
  cape?: Cape;
  createdAt: string;
}
