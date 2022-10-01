import {
  ActionIcon,
  Button,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  NavLink,
  Skeleton,
  Title,
  Tooltip,
  Text,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";
import { invoke } from "@tauri-apps/api";
import React from "react";
import { Async } from "react-async";
import { FixedSizeList } from "react-window";
import { Cluster } from "../../models/kafka";
import { useCurrentCluster } from "../../providers";

type ConsumerState = {
  isRunning: boolean;
  recordCount: number;
};

type KafkaRecord = {
  key: string;
  value: string;
};

type TopicPageProps = {
  topicName: string;
  cluster: Cluster;
};

type TopicPageState = {
  windowHeight: number;
} & ConsumerState;

class TopicStateful extends React.Component<TopicPageProps, TopicPageState> {
  interval!: NodeJS.Timer;

  constructor(props: TopicPageProps) {
    super(props);
    this.state = {
      isRunning: false,
      recordCount: 0,
      windowHeight: window.innerHeight,
    };
  }

  componentDidMount(): void {
    // poll the backend for updates
    clearInterval(this.interval);
    this.interval = setInterval(async () => {
      await this.getConsumerState(this.props.cluster, this.props.topicName).then((s) =>
        this.setState((current) => ({ ...current, ...s }))
      );
    }, 500);
    // resize list on window resize
    window.addEventListener("resize", () => this.setState((s) => ({ ...s, windowHeight: window.innerHeight })));
  }

  componentWillUnmount(): void {
    clearInterval(this.interval);
  }

  //only update the record count if the it changed in the backend
  shouldComponentUpdate(nextProps: Readonly<TopicPageProps>, nextState: Readonly<TopicPageState>): boolean {
    if (nextState.windowHeight != this.state.windowHeight) return true;
    if (nextState.isRunning != this.state.isRunning) return true;
    const res =
      nextProps.topicName === this.props.topicName &&
      nextProps.cluster.id == this.props.cluster.id &&
      this.state.isRunning === nextState.isRunning &&
      this.state.recordCount === nextState.recordCount;
    return !res;
  }

  getConsumerState = async (cluster: Cluster, topic: string) =>
    await invoke<ConsumerState>("get_consumer_state", { consumer: { cluster_id: cluster.id, topic } });
  getRecord = async (index: number, cluster: Cluster, topic: string) =>
    await invoke<KafkaRecord>("get_record", { consumer: { cluster_id: cluster.id, topic }, index });

  updateState = () => this.getConsumerState(this.props.cluster, this.props.topicName).then((s) => this.setState(s));
  toggleConsumerRunning = async () =>
    this.state.isRunning
      ? await invoke<void>("stop_consumer", {
          consumer: { cluster_id: this.props.cluster.id, topic: this.props.topicName },
        })
      : await invoke<void>("start_consumer", { config: { cluster: this.props.cluster, topic: this.props.topicName } });

  render = () => (
    <Container>
      <Group noWrap style={{ maxHeight: 50 }} position={"apart"}>
        <Title
          style={{
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}>
          {this.props.topicName}
        </Title>
        <Tooltip position="bottom" label="Topic info">
          <ActionIcon>
            <IconInfoCircle />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Divider my={10} />
      <Async promiseFn={this.updateState}>
        <Async.Pending>
          <Center mt={10}>
            <Loader />
          </Center>
        </Async.Pending>
        <Async.Resolved>
          <Button mb={10} size="xs" onClick={this.toggleConsumerRunning}>
            {this.state.isRunning ? "Stop" : "Consume"}
          </Button>
          <FixedSizeList
            height={this.state.windowHeight - 170}
            itemCount={this.state.recordCount}
            itemSize={38}
            width={"100%"}>
            {({ index, style }) => (
              <Async
                promise={this.getRecord(
                  this.state.recordCount - (index + 1),
                  this.props.cluster,
                  this.props.topicName
                )}>
                <Async.Loading>
                  <Skeleton />
                </Async.Loading>
                <Async.Fulfilled>
                  {(data) => (
                    <NavLink style={style} noWrap label={this.state.recordCount - index + JSON.stringify(data)} />
                  )}
                </Async.Fulfilled>
              </Async>
            )}
          </FixedSizeList>
        </Async.Resolved>
      </Async>
    </Container>
  );
}

export const Topic = (props: { topicName: string }) => {
  const cluster = useCurrentCluster();
  return cluster ? (
    <TopicStateful topicName={props.topicName} cluster={cluster}></TopicStateful>
  ) : (
    <Text>Missing cluster configuration</Text>
  );
};
