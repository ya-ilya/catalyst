import React from "react";

import { User } from "../api";

export function useAuthenticationContext() {
  return React.useContext(AuthenticationContext);
}

export class Session {
  accessToken: string;
  refreshToken: string;
  user: User;

  constructor(accessToken: string, refreshToken: string, user: User) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }
}

export const AuthenticationContext = React.createContext<
  [session: Session | null, setSession: (session: Session | null) => void]
>([null, () => {}]);
