import "./SignIn.css";

import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { useState } from "react";
import { useNavigate } from "react-router";

import * as api from "../../api";
import { Header } from "../../components";
import { useToast } from "../../hooks";

export function SignIn() {
  const authenticationController = api.useAuthenticationController();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [, setSession] = api.useAuthenticationContext();

  const [toast, showToast] = useToast();

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      setSession(await authenticationController.signIn({ username, password }));
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      showToast({
        severity: "error",
        summary: "Login Failed",
        detail: "Invalid username or password.",
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
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="p-field mt-3">
              <label htmlFor="password">Password</label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                toggleMask
                feedback={false}
              />
            </div>
            <div className="mt-4">
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
