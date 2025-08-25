import "./Account.css";

import { AxiosError } from "axios";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { Password } from "primereact/password";
import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

import * as api from "../../api";
import { Header } from "../../components";
import { useAuthenticationContext, useToastContext } from "../../contexts";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 100;

export function Account() {
  const meController = api.useMeController();

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [session, setSession] = useAuthenticationContext();
  const [user, setUser] = useState<api.User | null>(null);
  const [showToast] = useToastContext();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      if (!meController) return;

      try {
        const user = await meController.getUser();
        setUser(user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch user data.",
        });
      }
    };

    fetchUser();
  }, [meController]);

  const handlePasswordChange = useCallback(async () => {
    if (!meController) return;

    try {
      setSession(await meController.changePassword({ oldPassword, newPassword }));
      showToast({
        severity: "success",
        summary: "Password Changed",
        detail: "Your password has been successfully changed.",
      });
    } catch (error) {
      console.error("Failed to change password:", error);

      if (error instanceof AxiosError && error.response) {
        if (error.status == 400 && error.response.data.fields.contains("newPassword")) {
          showToast({
            severity: "error",
            summary: "Error",
            detail: "New password cannot be the same as the old password.",
          });

          return;
        } else if (error.status == 400 && error.response.data.fields.contains("oldPassword")) {
          showToast({
            severity: "error",
            summary: "Error",
            detail: "Old password is incorrect.",
          });

          return;
        } else if (error.status == 400) {
          showToast({
            severity: "error",
            summary: "Error",
            detail: "Invalid password format.",
          });

          return;
        }
      }

      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to change password.",
      });
    }

    setIsDialogVisible(false);
  }, [meController, oldPassword, newPassword, confirmPassword, setSession]);

  const handleLogout = useCallback(() => {
    setSession(null);
    navigate("/");
  }, [setSession, navigate]);

  const dialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setIsDialogVisible(false)}
        className="p-button-text"
      />
      <Button
        label="Change Password"
        icon="pi pi-check"
        onClick={handlePasswordChange}
        disabled={
          newPassword.length < MIN_PASSWORD_LENGTH ||
          newPassword.length > MAX_PASSWORD_LENGTH ||
          newPassword === oldPassword ||
          newPassword !== confirmPassword
        }
      />
    </div>
  );

  if (!session) {
    return (
      <Navigate
        to={`/sign-in?redirectTo=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return (
    <div className="account-container">
      <Header />
      <div className="account-content">
        <Card
          title="Account"
          className="account-card"
        >
          {user?.isPasswordChangeRequired && (
            <div className="password-change-warning">
              <i
                className="pi pi-exclamation-triangle"
                style={{ marginRight: 2 }}
              ></i>
              <span>Password change is required!</span>
            </div>
          )}
          <div className="p-grid p-dir-col">
            <div className="p-col">
              <h5 className="info-label">Username:</h5>
              <p className="info-value">{user?.username}</p>
            </div>
            <div className="p-col">
              <h5 className="info-label">Joined:</h5>
              <p className="info-value">{user ? new Date(user?.createdAt).toLocaleDateString() : ""}</p>
            </div>
          </div>
          <div
            className="actions p-d-flex p-jc-between"
            style={{ marginTop: 16 }}
          >
            <Button
              label="Change Password"
              icon="pi pi-lock"
              className="p-button-warning"
              onClick={() => setIsDialogVisible(true)}
            />
            <Button
              label="Logout"
              icon="pi pi-power-off"
              className="p-button-danger"
              onClick={handleLogout}
            />
          </div>
        </Card>
      </div>
      <Dialog
        className="change-password-dialog"
        header="Change Password"
        visible={isDialogVisible}
        style={{ maxWidth: "400px", width: "90vw" }}
        footer={dialogFooter}
        onHide={() => setIsDialogVisible(false)}
      >
        <div className="p-fluid">
          <div className="p-field">
            <FloatLabel>
              <Password
                id="old-password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                invalid={oldPassword.length < MIN_PASSWORD_LENGTH || oldPassword.length > MAX_PASSWORD_LENGTH}
                feedback={false}
                toggleMask
              />
              <label htmlFor="old-password">Old Password</label>
            </FloatLabel>
          </div>
          <div className="p-field">
            <FloatLabel>
              <Password
                id="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                invalid={
                  newPassword.length < MIN_PASSWORD_LENGTH ||
                  newPassword.length > MAX_PASSWORD_LENGTH ||
                  newPassword === oldPassword
                }
                toggleMask
              />
              <label htmlFor="new-password">New Password</label>
            </FloatLabel>
          </div>
          <div className="p-field">
            <FloatLabel>
              <Password
                id="confirm-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                invalid={newPassword !== confirmPassword}
                feedback={false}
                toggleMask
              />
              <label htmlFor="confirm-password">Confirm New Password</label>
            </FloatLabel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
