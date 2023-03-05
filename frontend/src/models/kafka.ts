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
  schema_id?: number;
  record_bytes: number;
  header?: string;
};

export type ConsumerState = {
  isRunning: boolean;
  recordCount: number;
};

export type ConsumerOffsetConfiguration =
  | "Beginning"
  | "End"
  | {
      Custom: {
        /** unix timestamp in ms */
        start_timestamp: number;
        /** unix timestamp in ms */
        stop_timestamp?: number;
      };
    };

export type ConsumerConfiguration = {
  compactify: boolean;
  consumer_start_config: ConsumerOffsetConfiguration;
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
