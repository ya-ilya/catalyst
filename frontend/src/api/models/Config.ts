import { User } from "./User";

export interface Config {
  id: string;
  name: string;
  isPublic: boolean;
  author: User;
  lastUpdated: string;
  createdAt: string;
}
