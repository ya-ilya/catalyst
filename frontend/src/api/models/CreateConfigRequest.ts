export interface CreateConfigRequest {
  name: string;
  files: { name: string, data: string }[];
  isPublic: boolean;
}