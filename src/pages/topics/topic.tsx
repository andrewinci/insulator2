import { ActionIcon, Button, Center, Container, Divider, Group, Loader, Tooltip, Text } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";
import React from "react";
import { Async } from "react-async";
import { ConsumerState } from "../../models/kafka";
import { RecordsList } from "./record-list";
import { getConsumerState, getRecord, stopConsumer } from "../../tauri/consumer";
import { PageHeader } from "../../components";
import { openConsumerModal } from "./consumer-modal";
import { useParams } from "react-router-dom";

type TopicPageProps = {
  topicName: string;
  clusterId: string;
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
      nextProps.clusterId === this.props.clusterId &&
      this.state.isRunning === nextState.isRunning &&
      this.state.recordCount === nextState.recordCount;
    return !res;
  }

  updateState = () =>
    getConsumerState(this.props.clusterId, this.props.topicName).then((s) =>
      this.setState((current) => ({ ...current, ...s }))
    );

  toggleConsumerRunning = async () => {
    const { clusterId, topicName } = this.props;
    this.state.isRunning ? await stopConsumer(clusterId, topicName) : openConsumerModal({ clusterId, topicName });
  };
  render = () => (
    <Container>
      <Group noWrap style={{ maxHeight: 50 }} position={"apart"}>
        {/* todo: retrieve info from the topic */}
        <PageHeader
          title={this.props.topicName}
          subtitle={"Estimated Records: 10000000000, Cleanup policy: Delete, Partitions: 12"}
        />

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
            fetchRecord={(index) => getRecord(index, this.props.clusterId, this.props.topicName)}
          />
        </Async.Resolved>
      </Async>
    </Container>
  );
}

export const Topic = (props: { topicName: string }) => {
  const { clusterId } = useParams();
  return clusterId ? (
    <TopicStateful topicName={props.topicName} clusterId={clusterId}></TopicStateful>
  ) : (
    <Text>Missing cluster configuration</Text>
  );
};
