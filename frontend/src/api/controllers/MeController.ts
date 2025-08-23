import { Axios } from "axios";
import { useEffect, useState } from "react";

import {
    AuthenticationResponse, Cape, ChangePasswordRequest, Config, Subscription, User
} from "../";
import { axiosClient } from "../..";
import { Session, useAuthenticationContext } from "../../contexts";
import { Controller } from "./Controller";

export function useMeController() {
  const [session] = useAuthenticationContext();
  const [meController, setMeController] = useState(session ? createMeController(session) : undefined);

  useEffect(() => {
    if (session) {
      setMeController(createMeController(session));
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

  async getSubscriptions(): Promise<Subscription[]> {
    return (await this.client.get("/subscriptions")).data;
  }

  async getConfigs(): Promise<Config[]> {
    return (await this.client.get("/configs")).data;
  }

  async getCape(): Promise<Cape> {
    return (await this.client.get("/cape")).data;
  }

  async changePassword(body: ChangePasswordRequest): Promise<AuthenticationResponse> {
    return (await this.client.post("/change-password", body)).data;
  }
}
