export interface UpdateConfigRequest {
  name?: string;
  files?: { name: string; data: string }[];
  isPublic?: boolean;
}
