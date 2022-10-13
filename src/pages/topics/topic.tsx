import { ActionIcon, Button, Center, Container, Divider, Group, Loader, Tooltip, Text } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";
import React from "react";
import { Async } from "react-async";
import { Cluster, ConsumerState } from "../../models/kafka";
import { useCurrentCluster } from "../../providers";
import { RecordsList } from "./record-list";
import { getConsumerState, getRecord, stopConsumer } from "../../tauri";
import { SingleLineTitle } from "../../components";
import { openConsumerModal } from "./consumer-modal";

type TopicPageProps = {
  topicName: string;
  cluster: Cluster;
};

type TopicPageState = ConsumerState;

class TopicStateful extends React.Component<TopicPageProps, TopicPageState> {
  interval!: NodeJS.Timer;

  constructor(props: TopicPageProps) {
    super(props);
    this.state = {
      isRunning: false,
      recordCount: 0,
    };
  }

  componentDidMount(): void {
    // poll the backend for updates
    clearInterval(this.interval);
    this.interval = setInterval(async () => await this.updateState(), 500);
  }

  componentWillUnmount(): void {
    clearInterval(this.interval);
  }

  //only update the record count if the it changed in the backend
  shouldComponentUpdate(nextProps: Readonly<TopicPageProps>, nextState: Readonly<TopicPageState>): boolean {
    if (nextState.isRunning != this.state.isRunning) return true;
    const res =
      nextProps.topicName === this.props.topicName &&
      nextProps.cluster.id === this.props.cluster.id &&
      this.state.isRunning === nextState.isRunning &&
      this.state.recordCount === nextState.recordCount;
    return !res;
  }

  updateState = () =>
    getConsumerState(this.props.cluster, this.props.topicName).then((s) =>
      this.setState((current) => ({ ...current, ...s }))
    );

  toggleConsumerRunning = async () =>
    this.state.isRunning
      ? await stopConsumer(this.props.cluster.id, this.props.topicName)
      : openConsumerModal({ cluster: this.props.cluster, topicName: this.props.topicName });

  render = () => (
    <Container>
      <Group noWrap style={{ maxHeight: 50 }} position={"apart"}>
        <SingleLineTitle>{this.props.topicName}</SingleLineTitle>
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
          <RecordsList
            heightOffset={140}
            itemCount={this.state.recordCount}
            fetchRecord={(index) => getRecord(index, this.props.cluster, this.props.topicName)}
          />
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
