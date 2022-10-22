export type Subject = {
  subject: string;
  compatibility: string;
  versions: SchemaVersion[];
};

export type SchemaVersion = {
  id: number;
  version: number;
  schema: string;
};
