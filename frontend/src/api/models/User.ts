export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  isPasswordChangeRequired: boolean;
  createdAt: string;
}
