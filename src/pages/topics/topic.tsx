import { ActionIcon, Container, Divider, Group, Title, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";

export const Topic = ({ topicName }: { topicName: string }) => (
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
    <Divider mt={10} />
  </Container>
);
