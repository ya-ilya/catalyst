export interface UpdateConfigRequest {
  name?: string;
  files?: { name: string; data: string }[];
  tags?: string[];
  isPublic?: boolean;
}
