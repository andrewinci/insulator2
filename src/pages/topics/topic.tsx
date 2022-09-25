import { invoke } from "@tauri-apps/api";
import { ActionIcon, Container, Divider, Group, Title, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";
import { useAppState } from "../../providers";

export const Topic = ({ topicName }: { topicName: string }) => {
  const { appState } = useAppState();
  invoke("start_consume", { cluster: appState.activeCluster, settings: { topic: topicName } })
    .then((r) => console.log(r))
    .catch((err) => console.error(err));
  return (
    <Container style={{ width: "100%" }}>
      <Group position={"apart"}>
        <Title>{topicName}</Title>
        <Group>
          <Tooltip label="Topic info">
            <ActionIcon>
              <IconInfoCircle />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Divider mt={10} />
    </Container>
  );
};
