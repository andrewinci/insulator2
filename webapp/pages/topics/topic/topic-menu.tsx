import { Badge, Button, Group, Text, Anchor, Tooltip } from "@mantine/core";
import { IconArrowBarToDown, IconArrowBarToUp, IconSearch } from "@tabler/icons";
import { CodeEditor } from "../../../components";
import { useState } from "react";

type TopicPageMenuProps = {
  consumedRecords?: number;
  isConsumerRunning?: boolean;
  onConsumerToggle: () => void;
  onQuery: (query: string) => void;
};

export const TopicPageMenu = ({
  consumedRecords,
  isConsumerRunning,
  onConsumerToggle,
  onQuery,
}: TopicPageMenuProps) => {
  const defaultQuery =
    "SELECT partition, offset, timestamp, key, payload\nFROM {:topic}\nORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}";
  const [queryState, setQueryState] = useState<{ opened: boolean; query: string }>({
    opened: false,
    query: defaultQuery,
  });
  return (
    <>
      <Text my={5} size={"xs"}>
        Note: use json syntax to filter by field in the payload{" "}
        <Anchor href="https://www.sqlite.org/json1.html" target="tauri">
          https://www.sqlite.org/json1.html
        </Anchor>
      </Text>
      <CodeEditor
        height={80}
        language="sql"
        value={queryState.query}
        onChange={(v) => setQueryState({ ...queryState, query: v ?? "" })}
      />
      <Group mt={5} position="apart">
        <Group>
          <Button
            size="xs"
            onClick={onConsumerToggle}
            rightIcon={
              <Tooltip label="Total records consumed internally and queryable">
                <Badge variant="filled" color={"red"}>
                  {consumedRecords}
                </Badge>
              </Tooltip>
            }>
            {isConsumerRunning ? "Stop" : "Consume"}
          </Button>

          <Button leftIcon={<IconSearch size={14} />} size="xs" onClick={() => onQuery(queryState.query)}>
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
