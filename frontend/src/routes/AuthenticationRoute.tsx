import { useEffect } from "react";
import { Outlet } from "react-router";

import { createAuthenticationController } from "../api";
import { AuthenticationContext, Session } from "../contexts";
import { useLocalStorage } from "../hooks";

function isTokenExpired(token: string): boolean {
  try {
    const jwtPayload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= jwtPayload.exp * 1000;
  } catch (error) {
    return true;
  }
}

export function AuthenticationRoute() {
  const [session, setSession] = useLocalStorage<Session>("session");

  useEffect(() => {
    const refreshToken = async () => {
      if (!session) {
        return;
      }

      if (!isTokenExpired(session.accessToken)) {
        console.info("Access token is still valid, no need to refresh");
        return;
      }

      if (isTokenExpired(session.refreshToken)) {
        console.error("Refresh token is expired");
        setSession(null);
      }

      try {
        console.info(`Refreshing token`);

        const refreshTokenResponse = await createAuthenticationController().refreshToken({
          refreshToken: session.refreshToken,
        });

        setSession(refreshTokenResponse);

        console.info(`Token refreshed successfully`);
      } catch (err) {
        setSession(null);
        console.error("Failed to refresh token", err);
      }
    };

    refreshToken();
  }, [session, setSession]);

  return (
    <AuthenticationContext.Provider value={[session, setSession]}>
      <Outlet />
    </AuthenticationContext.Provider>
  );
}
