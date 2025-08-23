import "./SignIn.css";

import { AxiosError } from "axios";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { useState } from "react";
import { useNavigate } from "react-router";

import * as api from "../../api";
import { Header } from "../../components";
import { useAuthenticationContext } from "../../contexts";
import { useToast } from "../../hooks";

export function SignIn() {
  const authenticationController = api.useAuthenticationController();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [, setSession] = useAuthenticationContext();

  const [toast, showToast] = useToast();

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      setSession(await authenticationController.signIn({ username, password }));
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);

      if (error instanceof AxiosError && error.response) {
        if (error.status == 401 && error.response.data.fields.contains("password")) {
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
  };

  return (
    <div className="signin-container">
      <Toast ref={toast} />
      <Header />
      <div className="signin-content">
        <Card
          title="Sign In"
          className="signin-card"
        >
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="username">Username</label>
              <InputText
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div
              className="p-field"
              style={{ marginTop: 3 }}
            >
              <label htmlFor="password">Password</label>
              <Password
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                toggleMask
                feedback={false}
              />
            </div>
            <div style={{ marginTop: 4 }}>
              <Button
                label="Sign In"
                icon="pi pi-sign-in"
                className="w-full"
                onClick={handleLogin}
                loading={loading}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
