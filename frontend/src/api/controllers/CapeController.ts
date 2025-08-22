import { Axios } from "axios";
import { useEffect, useState } from "react";

import { Session, useAuthenticationContext } from "../";
import { axiosClient } from "../../";
import { Cape } from "../models/Cape";
import { Controller } from "./Controller";

export function useCapeController() {
  const [session] = useAuthenticationContext();
  const [capeController, setCapeController] = useState(session ? createCapeController(session) : undefined);

  useEffect(() => {
    if (session) {
      setCapeController(createCapeController(session));
    }
  }, [session]);

  return capeController;
}

export function createCapeController(session: Session) {
  return new CapeController(axiosClient, session.accessToken);
}

export function createCapeControllerWithoutAuthentication() {
  return new CapeController(axiosClient);
}

export class CapeController extends Controller {
  constructor(client: Axios, token: string | null = null) {
    super(client, "/api/capes", token);
  }

  async getCapes(): Promise<Cape[]> {
    return (await this.client.get("")).data;
  }

  async getCapeById(id: string): Promise<Cape> {
    return (await this.client.get(`/${id}`)).data;
  }

  async getCapeImage(id: string): Promise<Blob> {
    const response = await this.client.get(`/${id}/image`, { responseType: "blob" });
    return response.data;
  }
}
