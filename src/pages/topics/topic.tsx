import { ActionIcon, Container, Divider, Group, Title, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";
import { TopicInfo } from "../../kafka";

export const Topic = ({ topic }: { topic: TopicInfo }) => (
  <Container style={{ width: "100%" }}>
    <Group position={"apart"}>
      <Title>{topic.name}</Title>
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
