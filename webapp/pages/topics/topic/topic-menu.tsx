import { Badge, Button, Group, Text, Anchor, Tooltip, Loader } from "@mantine/core";
import { IconArrowBarToDown, IconArrowBarToUp, IconSearch } from "@tabler/icons";
import { CodeEditor } from "../../../components";

type TopicPageMenuProps = {
  consumedRecords?: number;
  isConsumerRunning?: boolean;
  height?: number;
  query: string;
  onQueryChange: (query: string) => void;
  onQuery: () => void;
  onConsumerToggle: () => void;
};

export const TopicPageMenu = ({
  consumedRecords,
  isConsumerRunning,
  height,
  query,
  onQueryChange,
  onConsumerToggle,
  onQuery,
}: TopicPageMenuProps) => {
  return (
    <>
      <Text my={5} size={"xs"}>
        Note: use json syntax to filter by field in the payload{" "}
        <Anchor href="https://www.sqlite.org/json1.html" target="tauri">
          https://www.sqlite.org/json1.html
        </Anchor>
      </Text>
      <CodeEditor height={height} language="sql" value={query} onChange={(v) => onQueryChange(v)} />
      <Group mt={5} position="apart">
        <Group>
          <Button
            size="xs"
            onClick={onConsumerToggle}
            leftIcon={isConsumerRunning && <Loader color={"red"} size={"xs"}></Loader>}
            rightIcon={
              <Tooltip label="Total records consumed internally and queryable">
                <Badge variant="filled" color={"red"}>
                  {consumedRecords}
                </Badge>
              </Tooltip>
            }>
            {isConsumerRunning ? "Stop" : "Consume"}
          </Button>

          <Button leftIcon={<IconSearch size={14} />} size="xs" onClick={() => onQuery()}>
            Query
          </Button>
          <Button leftIcon={<IconArrowBarToDown size={14} />} disabled size="xs">
            Export
          </Button>
        </Group>
        <Button leftIcon={<IconArrowBarToUp size={14} />} disabled color={"orange"} size="xs">
          Produce
        </Button>
      </Group>
    </>
  );
};
