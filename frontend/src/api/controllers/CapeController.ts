import { Axios } from "axios";
import { useEffect, useState } from "react";

import { axiosClient } from "../../";
import { Session, useAuthenticationContext } from "../../contexts";
import { Cape } from "../models/Cape";
import { Controller } from "./Controller";

export function useCapeController() {
  const [session] = useAuthenticationContext();
  const [capeController, setCapeController] = useState(session ? createCapeController(session) : undefined);

  useEffect(() => {
    if (session) {
      setCapeController(createCapeController(session));
    } else {
      setCapeController(undefined);
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

  async getCapes(
    limit: number,
    offset: number,
    filter?: string
  ): Promise<{ capes: Cape[]; total: number; pages: number }> {
    const response = await this.client.get("", {
      params: {
        limit: limit,
        offset: offset,
        filter: filter,
      },
    });

    return {
      capes: response.data,
      total: parseInt(response.headers["x-total-count"]),
      pages: parseInt(response.headers["x-total-pages"]),
    };
  }

  async getCapeById(id: string): Promise<Cape> {
    return (await this.client.get(`/${id}`)).data;
  }

  async select(id: string) {
    await this.client.get(`/${id}/select`);
  }

  async getCapeImage(id: string): Promise<Blob> {
    const response = await this.client.get(`/${id}/image`, { responseType: "blob" });
    return response.data;
  }
}
