import "./Account.css";

import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";

import * as api from "../../api";
import { Header } from "../../components";
import { useToast } from "../../hooks";

export function Account() {
  const meController = api.useMeController();

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [session, setSession] = api.useAuthenticationContext();
  const [user, setUser] = useState<api.User | null>(null);

  const [toast, showToast] = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    meController
      ?.getUser()
      .then((user) => {
        setUser(user);
      })
      .catch((error) => {
        console.error("Failed to fetch user data:", error);
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch user data.",
        });
      });
  }, [meController]);

  const handlePasswordChange = useCallback(async () => {
    if (!meController) {
      return;
    }

    if (newPassword !== confirmPassword) {
      console.error("New passwords do not match!");
      showToast({
        severity: "error",
        summary: "Error",
        detail: "New passwords do not match.",
      });
      return;
    }

    try {
      setSession(await meController.changePassword({ oldPassword, newPassword }));
      showToast({
        severity: "success",
        summary: "Password Changed",
        detail: "Your password has been successfully changed.",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
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
      />
    </div>
  );

  if (!session) {
    return (
      <Navigate
        to="/sign-in"
        replace
      />
    );
  }

  return (
    <div className="account-container">
      <Toast ref={toast} />
      <Header />
      <div className="account-content">
        <Card
          title="Account"
          className="account-card"
        >
          {user?.isPasswordChangeRequired && (
            <div className="password-change-warning">
              <i className="pi pi-exclamation-triangle mr-2"></i>
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
          <div className="actions p-d-flex p-jc-between mt-4">
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
        header="Change Password"
        visible={isDialogVisible}
        style={{ maxWidth: "400px", width: "90vw" }}
        footer={dialogFooter}
        onHide={() => setIsDialogVisible(false)}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="old-password">Old Password</label>
            <Password
              id="old-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              toggleMask
              feedback={false}
            />
          </div>
          <div className="p-field">
            <label htmlFor="new-password">New Password</label>
            <Password
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              toggleMask
            />
          </div>
          <div className="p-field">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <InputText
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
