import { Axios } from "axios";
import { useEffect, useState } from "react";

import { Config, ConfigFile, CreateConfigRequest, Subscription, UpdateConfigRequest } from "../";
import { axiosClient } from "../../";
import { Session, useAuthenticationContext } from "../../contexts";
import { Controller } from "./Controller";

export function useConfigController() {
  const [session] = useAuthenticationContext();
  const [configController, setConfigController] = useState(
    session ? createConfigController(session) : undefined
  );

  useEffect(() => {
    if (session) {
      setConfigController(createConfigController(session));
    } else {
      setConfigController(undefined);
    }
  }, [session]);

  return configController;
}

export function createConfigController(session: Session) {
  return new ConfigController(axiosClient, session.accessToken);
}

export function createConfigControllerWithoutAuthentication() {
  return new ConfigController(axiosClient);
}

export class ConfigController extends Controller {
  constructor(client: Axios, token: string | null = null) {
    super(client, "/api/configs", token);
  }

  async getConfigById(id: string): Promise<Config> {
    return (await this.client.get(`/${id}`)).data;
  }

  async getPublicConfigs(
    limit: number,
    offset: number,
    query?: string,
    author?: string,
    tags?: string[],
    sortBy?: string
  ): Promise<{ configs: Config[]; total: number; pages: number }> {
    const response = await this.client.get("", {
      params: {
        limit: limit,
        offset: offset,
        query: query,
        author: author,
        tags: tags,
        sortBy: sortBy,
      },
    });

    return {
      configs: response.data,
      total: parseInt(response.headers["x-total-count"]),
      pages: parseInt(response.headers["x-total-pages"]),
    };
  }

  async getConfigFiles(id: string): Promise<ConfigFile[]> {
    return (await this.client.get(`/${id}/files`)).data;
  }

  async getConfigFile(id: string, name: string): Promise<string | any> {
    return (await this.client.get(`/${id}/files/${name}`)).data;
  }

  async subscribe(id: string): Promise<Subscription> {
    return (await this.client.get(`/${id}/subscribe`)).data;
  }

  async unsubscribe(id: string) {
    await this.client.get(`/${id}/unsubscribe`);
  }

  async createConfig(body: CreateConfigRequest): Promise<Config> {
    return (await this.client.post("", body)).data;
  }

  async updateConfig(id: string, body: UpdateConfigRequest): Promise<Config> {
    return (await this.client.patch(`/${id}`, body)).data;
  }

  async deleteConfig(id: string) {
    await this.client.delete(`/${id}`);
  }
}
