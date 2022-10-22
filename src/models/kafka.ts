export type ClusterAuthentication =
  | { Sasl: { username: string; password: string; scram: boolean } }
  | {
      Ssl: {
        ca: string;
        certificate: string;
        key: string;
        keyPassword?: string;
      };
    }
  | "None";

export type Cluster = {
  id: string;
  name: string;
  endpoint: string;
  authentication: ClusterAuthentication;
  schemaRegistry?: SchemaRegistry;
};

export type Topic = {
  name: string;
};

export type KafkaRecord = {
  key: string;
  payload: string;
  partition: number;
  offset: number;
  timestamp?: number;
};

export type ConsumerState = {
  isRunning: boolean;
  recordCount: number;
};

export type SchemaRegistry = {
  endpoint: string;
  username?: string;
  password?: string;
};

export type ConsumerSettingsFrom =
  | "Beginning"
  | "End"
  | {
      Custom: {
        start_timestamp: number; //time in ms
        stop_timestamp?: number; //time in ms
      };
    };

export type ConsumerSettings = {
  cluster: Cluster;
  topic: string;
  from: ConsumerSettingsFrom;
};

export type ConsumerGroupInfo = {
  name: string;
  state: string;
  offsets: TopicPartitionOffset[];
};

export type TopicPartitionOffset = {
  topic: string;
  partition_id: number;
  offset: number;
};
