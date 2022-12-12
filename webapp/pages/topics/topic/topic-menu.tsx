import { Badge, Button, Group, Text, Anchor, Tooltip, Loader } from "@mantine/core";
import { IconArrowBarToDown, IconArrowBarToUp, IconFileExport, IconSearch } from "@tabler/icons";
import { CodeEditor } from "../../../components";

type TopicPageMenuProps = {
  topicName: string;
  query: string;
  consumedRecords?: number;
  isConsumerRunning?: boolean;
  height?: number;
  exportInProgress?: boolean;
  onQueryChange: (query: string) => void;
  onQuery: () => void;
  onConsumerToggle: () => void;
  onExportClick: () => void;
};

export const TopicPageMenu = (props: TopicPageMenuProps) => {
  const { consumedRecords, isConsumerRunning, height, query, topicName, exportInProgress } = props;
  const { onQueryChange, onConsumerToggle, onQuery, onExportClick } = props;

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
            leftIcon={isConsumerRunning ? <Loader color={"white"} size={"xs"} /> : <IconArrowBarToDown size={16} />}
            rightIcon={
              <Tooltip label="Total records consumed internally and queryable">
                <Badge hidden={consumedRecords == 0} variant="filled" color={"orange"}>
                  {consumedRecords}
                </Badge>
              </Tooltip>
            }>
            {isConsumerRunning ? "Stop" : "Consume"}
          </Button>
          <Button leftIcon={<IconSearch size={16} />} size="xs" onClick={onQuery}>
            Query
          </Button>
          <Button
            loading={exportInProgress}
            leftIcon={<IconFileExport size={16} />}
            color={"green"}
            size="xs"
            onClick={onExportClick}>
            Export
          </Button>
        </Group>
        <Button disabled leftIcon={<IconArrowBarToUp size={16} />} color={"orange"} size="xs">
          Produce
        </Button>
      </Group>
    </>
  );
};
