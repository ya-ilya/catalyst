import { Axios } from "axios";
import { useEffect, useState } from "react";

import { AuthenticationResponse, ChangePasswordRequest, Config, Subscription, User } from "../";
import { axiosClient } from "../..";
import { Session, useAuthenticationContext } from "../../contexts";
import { Controller } from "./Controller";

export function useMeController() {
  const [session] = useAuthenticationContext();
  const [meController, setMeController] = useState(session ? createMeController(session) : undefined);

  useEffect(() => {
    if (session) {
      setMeController(createMeController(session));
    } else {
      setMeController(undefined);
    }
  }, [session]);

  return meController;
}

export function createMeController(session: Session) {
  return new MeController(axiosClient, session.accessToken);
}

export function createMeControllerByAccessToken(accessToken: string) {
  return new MeController(axiosClient, accessToken);
}

export class MeController extends Controller {
  constructor(client: Axios, token: string) {
    super(client, "/api/me", token);
  }

  async getUser(): Promise<User> {
    return (await this.client.get("")).data;
  }

  async getSubscriptions(
    limit: number,
    offset: number,
    filter?: string
  ): Promise<{ subscriptions: Subscription[]; total: number; pages: number }> {
    const response = await this.client.get("/subscriptions", {
      params: {
        limit: limit,
        offset: offset,
        filter: filter,
      },
    });

    return {
      subscriptions: response.data,
      total: parseInt(response.headers["x-total-count"]),
      pages: parseInt(response.headers["x-total-pages"]),
    };
  }

  async getConfigs(): Promise<Config[]> {
    return (await this.client.get("/configs")).data;
  }

  async getCapeImage(): Promise<Blob> {
    const response = await this.client.get(`/cape/image`, { responseType: "blob" });
    return response.data;
  }

  async unselectCape(): Promise<void> {
    await this.client.get("/cape/unselect");
  }

  async changePassword(body: ChangePasswordRequest): Promise<AuthenticationResponse> {
    return (await this.client.post("/change-password", body)).data;
  }
}
