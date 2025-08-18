import axios, { Axios } from "axios";

export abstract class Controller {
  protected client: Axios;

  constructor(client: Axios, baseURL: string, token: string | null = null) {
    this.client = axios.create({
      ...client.defaults,
      baseURL: client.defaults.baseURL + baseURL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
}
