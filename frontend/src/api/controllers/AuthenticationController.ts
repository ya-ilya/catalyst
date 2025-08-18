import { Axios } from "axios";
import { useState } from "react";

import { AuthenticationResponse, RefreshTokenRequest, SignInRequest } from "../";
import { axiosClient } from "../../";
import { Controller } from "./Controller";

export function useAuthenticationController() {
  const [authenticationController] = useState(createAuthenticationController());

  return authenticationController;
}

export function createAuthenticationController() {
  return new AuthenticationController(axiosClient);
}

export class AuthenticationController extends Controller {
  constructor(client: Axios) {
    super(client, "/authentication");
  }

  async signIn(body: SignInRequest): Promise<AuthenticationResponse> {
    return (await this.client.post("/sign-in", body)).data;
  }

  async refreshToken(body: RefreshTokenRequest): Promise<AuthenticationResponse> {
    return (await this.client.post("/refreshToken", body)).data;
  }
}
