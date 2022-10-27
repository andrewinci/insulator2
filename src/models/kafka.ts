export type TopicInfo = {
  name: string;
  partitions: PartitionInfo[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configurations: any;
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

export type ConsumerSettingsFrom =
  | "Beginning"
  | "End"
  | {
      Custom: {
        start_timestamp: number; //time in ms
        stop_timestamp?: number; //time in ms
      };
    };

export type ConsumerGroupInfo = {
  name: string;
  offsets: TopicPartitionOffset[];
};

export type TopicPartitionOffset = {
  topic: string;
  partition_id: number;
  offset: number;
  last_offset: number;
};

export type PartitionInfo = {
  id: number;
  isr: number;
  replicas: number;
  last_offset: number;
};
export type PartitionOffset = {
  partitionId: number;
  offset: number;
};
