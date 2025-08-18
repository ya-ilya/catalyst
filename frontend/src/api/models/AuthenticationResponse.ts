import { User } from "./User";

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
