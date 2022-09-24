import { ActionIcon, Container, Divider, Group, Title, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";

export const Schema = ({ schemaName }: { schemaName: string }) => (
  <Container style={{ width: "100%" }}>
    <Group position={"apart"}>
      <Title>{schemaName}</Title>
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
