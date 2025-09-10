import { Axios } from "axios";
import { useEffect, useState } from "react";

import { Cape, CreateUserRequest, User, UserCreatedResponse } from "../";
import { axiosClient } from "../../axios-config";
import { Session, useAuthenticationContext } from "../../contexts";
import { Controller } from "./Controller";

export function useAdminController() {
  const [session] = useAuthenticationContext();
  const [adminController, setAdminController] = useState(
    session ? createAdminController(session) : undefined
  );

  useEffect(() => {
    if (session) {
      setAdminController(createAdminController(session));
    } else {
      setAdminController(undefined);
    }
  }, [session]);

  return adminController;
}

export function createAdminController(session: Session) {
  return new AdminController(axiosClient, session.accessToken);
}

export function createAdminControllerByAccessToken(accessToken: string) {
  return new AdminController(axiosClient, accessToken);
}

export class AdminController extends Controller {
  constructor(client: Axios, token: string) {
    super(client, "/api/admin", token);
  }

  async getUsers(
    limit: number,
    offset: number,
    filter?: string,
    sortBy?: string,
  ): Promise<{ users: User[]; total: number; pages: number }> {
    const response = await this.client.get("/users", {
      params: {
        limit: limit,
        offset: offset,
        filter: filter,
        sortBy: sortBy,
      },
    });

    return {
      users: response.data,
      total: parseInt(response.headers["x-total-count"]),
      pages: parseInt(response.headers["x-total-pages"]),
    };
  }

  async getUserById(id: string): Promise<User> {
    return (await this.client.get(`/users/${id}`)).data;
  }

  async createUser(body: CreateUserRequest): Promise<UserCreatedResponse> {
    return (await this.client.post("/users", body)).data;
  }

  async deleteUser(id: string) {
    await this.client.delete(`/users/${id}`);
  }

  async createCape(name: string, description: string, image: File | Blob): Promise<Cape> {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", image, "cape.png");

    return (
      await this.client.post("/capes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    ).data;
  }

  async deleteCape(id: string) {
    await this.client.delete(`/capes/${id}`);
  }
}
