import axios, { Axios, AxiosInstance } from "axios";

import { refreshTokenRequestIntercepter, refreshTokenResponseIntercepter } from "../..";

export abstract class Controller {
  protected client: AxiosInstance;

  constructor(client: Axios, baseURL: string, token: string | null = null) {
    this.client = axios.create({
      ...client.defaults,
      baseURL: client.defaults.baseURL + baseURL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    this.client.interceptors.request.use(refreshTokenRequestIntercepter);
    this.client.interceptors.response.use(refreshTokenResponseIntercepter);
  }
}
