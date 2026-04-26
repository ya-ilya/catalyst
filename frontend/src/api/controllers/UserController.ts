import { Axios } from "axios";
import { useEffect, useState } from "react";

import { axiosClient } from "../../";
import { Session, useAuthenticationContext } from "../../contexts";
import { UserProfileResponse } from "../models/UserProfileResponse";
import { Controller } from "./Controller";

export function useUserController() {
  const [session] = useAuthenticationContext();
  const [userController, setUserController] = useState(session ? createUserController(session) : undefined);

  useEffect(() => {
    if (session) {
      setUserController(createUserController(session));
    } else {
      setUserController(undefined);
    }
  }, [session]);

  return userController;
}

export function createUserController(session: Session) {
  return new UserController(axiosClient, session.accessToken);
}

export function createUserControllerWithoutAuthentication() {
  return new UserController(axiosClient);
}

export class UserController extends Controller {
  constructor(client: Axios, token: string | null = null) {
    super(client, "/api/users", token);
  }

  async getUserProfile(minecraftUuid: string): Promise<UserProfileResponse> {
    return (await this.client.get(`/profile/${minecraftUuid}`)).data;
  }
}
