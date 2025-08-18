import { Config } from "./Config";

export interface Subscription {
  id: string;
  config: Config;
  subscribedAt: string;
}