import { Axios } from "axios";
import { useEffect, useState } from "react";

import { CreateUserRequest, User, UserCreatedResponse } from "../";
import { axiosClient } from "../../axios-config";
import { Session, useAuthenticationContext } from "../../contexts";
import { Controller } from "./Controller";

export function useAdminController() {
  const [session] = useAuthenticationContext();
  const [adminController, setAdminController] = useState(session ? createAdminController(session) : undefined);

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

  async getUsers(): Promise<User[]> {
    return (await this.client.get("/users")).data;
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
}
