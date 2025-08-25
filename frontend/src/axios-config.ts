import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";

import { createAuthenticationController } from "./api";
import { Session } from "./contexts";

function isTokenExpired(token: string): boolean {
  const jwtPayload = JSON.parse(atob(token.split(".")[1]));
  return Date.now() >= jwtPayload.exp * 1000;
}

export const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:3000",
});

export async function refreshTokenRequestIntercepter(
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig<any>> {
  if (!config.headers["Authorization"]) return config;

  const serializedSession = localStorage.getItem("session");
  if (!serializedSession) return config;

  let session = JSON.parse(serializedSession) as Session;

  if (!isTokenExpired(session.accessToken)) return config;
  if (isTokenExpired(session.refreshToken)) {
    localStorage.removeItem("session");
    return Promise.reject();
  }

  try {
    console.info("[request-intercepter] Refreshing token");

    const refreshTokenResponse = await createAuthenticationController().refreshToken({
      refreshToken: session.refreshToken,
    });

    const newSession = JSON.stringify(refreshTokenResponse);

    localStorage.setItem("session", newSession);

    window.dispatchEvent(
      new CustomEvent("localStorageChange", {
        detail: {
          key: "session",
          newValue: newSession,
        },
      })
    );

    config.headers["Authorization"] = `Bearer ${refreshTokenResponse.accessToken}`;

    console.info("[request-intercepter] Token refreshed");
  } catch (err) {
    console.error("[request-intercepter] Failed to refresh token:", err);
  }

  return config;
}

export async function refreshTokenResponseIntercepter(
  response: AxiosResponse<any, any>
): Promise<AxiosResponse<any, any>> {
  if (response.status < 400) {
    return Promise.resolve(response);
  }

  const serializedSession = localStorage.getItem("session");
  if (!serializedSession) return Promise.reject(response);

  let session = JSON.parse(serializedSession) as Session;

  if (response.status === 403 || response.status === 401) {
    if (isTokenExpired(session.refreshToken)) {
      console.error("[response-intercepter] refreshToken expired");
      localStorage.removeItem("session");
      return Promise.reject(response);
    }

    try {
      console.info("[response-intercepter] Refreshing token");

      const refreshTokenResponse = await createAuthenticationController().refreshToken({
        refreshToken: session.refreshToken,
      });

      const newSession = JSON.stringify(refreshTokenResponse);

      localStorage.setItem("session", newSession);

      window.dispatchEvent(
        new CustomEvent("localStorageChange", {
          detail: {
            key: "session",
            newValue: newSession,
          },
        })
      );

      console.info("[response-intercepter] Token refreshed");
    } catch (err) {
      console.error("[response-intercepter] Failed to refresh token:", err);
    }
  }

  return Promise.reject(response);
}
