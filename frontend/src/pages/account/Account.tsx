import "./Account.css";

import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useState } from "react";

import { Header } from "../../components";

export function Account() {
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const user = {
    id: "11846151-d0a9-413e-8179-6ee39c36057a",
    username: "Username",
    isPasswordChangeRequired: true, // Имитируем обязательную смену
    createdAt: "2024-08-18T10:00:00Z",
  };

  const handlePasswordChange = () => {
    // TODO: Добавить валидацию (пароли должны совпадать)
    if (newPassword !== confirmPassword) {
      console.error("New passwords do not match!");
      return;
    }
    // TODO: Отправить запрос на бэкенд
    console.log("Password change requested...");
    setIsDialogVisible(false);
  };

  const handleLogout = () => {
    // TODO: Логика для выхода из системы
    console.log("Logging out...");
  };

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

  return (
    <div className="account-container">
      <Header />
      <div className="account-content">
        <Card
          title="Account"
          className="account-card"
        >
          {user.isPasswordChangeRequired && (
            <div className="password-change-warning">
              <i className="pi pi-exclamation-triangle mr-2"></i>
              <span>Password change is required!</span>
            </div>
          )}
          <div className="p-grid p-dir-col">
            <div className="p-col">
              <h5 className="info-label">Username:</h5>
              <p className="info-value">{user.username}</p>
            </div>
            <div className="p-col">
              <h5 className="info-label">Joined:</h5>
              <p className="info-value">{new Date(user.createdAt).toLocaleDateString()}</p>
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
        style={{ width: "400px" }}
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
