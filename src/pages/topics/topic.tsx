import { ActionIcon, Button, Container, Divider, Group, Title, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";
import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { useCurrentCluster } from "../../providers";

export const Topic = ({ topicName }: { topicName: string }) => {
  const cluster = useCurrentCluster();
  // register for backend events
  useEffect(() => {
    const eventListener = async () => {
      console.log("Init");
      return await listen<string>(`consumer_${topicName}`, (event) => {
        console.log(event);
      });
    };
    const listener = eventListener();
    return () => {
      listener
        .then((unListen) => {
          unListen();
        })
        .catch((err) => console.error(err));
    };
  });

  return (
    <Container>
      <Group noWrap style={{ maxHeight: 50 }} position={"apart"}>
        <Title
          style={{
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}>
          {topicName}
        </Title>
        <Tooltip position="bottom" label="Topic info">
          <ActionIcon>
            <IconInfoCircle />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Divider my={10} />
      <Button
        onClick={async () =>
          await invoke("start_consumer", { config: { cluster: cluster, topic: topicName } })
            .then((r) => console.log(r))
            .catch((err) => console.error(err))
        }>
        Start
      </Button>
      <Button
        onClick={async () =>
          await invoke("stop_consumer", { consumer: { cluster_id: cluster?.id, topic: topicName } })
            .then((r) => console.log(r))
            .catch((err) => console.error(err))
        }>
        Stop
      </Button>
      <Button
        onClick={async () =>
          await invoke("get_record", {
            consumer: { cluster_id: cluster?.id, topic: topicName },
            index: 10,
          })
            .then((r) => console.log(r))
            .catch((err) => console.error(err))
        }>
        Get
      </Button>
    </Container>
  );
};
