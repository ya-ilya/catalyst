import "./SignIn.css";

import { AxiosError } from "axios";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import * as api from "../../api";
import { Header } from "../../components";
import { useAuthenticationContext, useToastContext } from "../../contexts";

const MIN_USERNAME_LENGTH = 4;
const MAX_USERNAME_LENGTH = 32;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 100;

export function SignIn() {
  const authenticationController = api.useAuthenticationController();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [, setSession] = useAuthenticationContext();
  const [showToast] = useToastContext();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLogin = useCallback(async () => {
    setLoading(true);

    try {
      const response = await authenticationController.signIn({ username, password });
      const redirectTo = searchParams.get("redirectTo");
      setSession(response);
      navigate(redirectTo ? decodeURIComponent(redirectTo) : "/");
    } catch (error) {
      console.error("Login failed:", error);

      if (error instanceof AxiosError && error.response) {
        if (error.status == 400 && error.response.data.fields.contains("password")) {
          showToast({
            severity: "error",
            summary: "Login Error",
            detail: "Invalid password.",
          });
          return;
        } else if (error.status == 404) {
          showToast({
            severity: "error",
            summary: "Login Error",
            detail: "User not found.",
          });
          return;
        } else if (error.status == 400) {
          showToast({
            severity: "error",
            summary: "Login Error",
            detail: "Invalid username or password.",
          });
          return;
        }
      }

      showToast({
        severity: "error",
        summary: "Login Error",
        detail: "Failed to sign in.",
      });
    } finally {
      setLoading(false);
    }
  }, [username, password, searchParams, authenticationController]);

  return (
    <div className="signin-container">
      <Header />
      <div className="signin-content">
        <Card
          title="Sign In"
          className="signin-card"
        >
          <div className="p-fluid">
            <div className="p-field">
              <FloatLabel>
                <InputText
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  invalid={username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH}
                />
                <label htmlFor="username">Username</label>
              </FloatLabel>
            </div>
            <div className="p-field">
              <FloatLabel>
                <Password
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  invalid={password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH}
                  feedback={false}
                  toggleMask
                />
                <label htmlFor="password">Password</label>
              </FloatLabel>
            </div>
            <div style={{ marginTop: 16 }}>
              <Button
                label="Sign In"
                icon="pi pi-sign-in"
                className="w-full"
                onClick={handleLogin}
                loading={loading}
                disabled={
                  username.length < MIN_USERNAME_LENGTH ||
                  username.length > MAX_USERNAME_LENGTH ||
                  password.length < MIN_PASSWORD_LENGTH ||
                  password.length > MAX_PASSWORD_LENGTH
                }
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
