import { Badge, Button, Group, Text, Anchor, Tooltip, Loader } from "@mantine/core";
import { IconArrowBarToDown, IconArrowBarToUp, IconSearch } from "@tabler/icons";
import { CodeEditor } from "../../../components";

type TopicPageMenuProps = {
  topicName: string;
  query: string;
  consumedRecords?: number;
  isConsumerRunning?: boolean;
  height?: number;
  onQueryChange: (query: string) => void;
  onQuery: () => void;
  onConsumerToggle: () => void;
  onExportClick: () => void;
};

export const TopicPageMenu = ({
  consumedRecords,
  isConsumerRunning,
  height,
  query,
  topicName,
  onQueryChange,
  onConsumerToggle,
  onQuery,
  onExportClick,
}: TopicPageMenuProps) => {
  return (
    <>
      <Text my={5} size={"xs"}>
        Note: use json syntax to filter by field in the payload{" "}
        <Anchor href="https://www.sqlite.org/json1.html" target="tauri">
          https://www.sqlite.org/json1.html
        </Anchor>
      </Text>
      <CodeEditor
        path={topicName}
        hideLineNumbers={true}
        height={height ?? 20}
        language="sql"
        value={query}
        onChange={(v) => onQueryChange(v)}
      />
      <Group mt={5} position="apart">
        <Group>
          <Button
            size="xs"
            onClick={onConsumerToggle}
            leftIcon={isConsumerRunning && <Loader color={"white"} size={"xs"}></Loader>}
            rightIcon={
              <Tooltip label="Total records consumed internally and queryable">
                <Badge hidden={consumedRecords == 0} variant="filled" color={"orange"}>
                  {consumedRecords}
                </Badge>
              </Tooltip>
            }>
            {isConsumerRunning ? "Stop" : "Consume"}
          </Button>

          <Button leftIcon={<IconSearch size={14} />} size="xs" onClick={onQuery}>
            Query
          </Button>
          <Button leftIcon={<IconArrowBarToDown size={14} />} color={"green"} size="xs" onClick={onExportClick}>
            Export
          </Button>
        </Group>
        <Button disabled leftIcon={<IconArrowBarToUp size={14} />} color={"orange"} size="xs">
          Produce
        </Button>
      </Group>
    </>
  );
};
