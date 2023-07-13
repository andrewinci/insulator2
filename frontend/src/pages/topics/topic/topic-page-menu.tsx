import { Badge, Button, Group, Text, Anchor, Tooltip, Loader, Menu, TextInput } from "@mantine/core";
import {
  IconAdjustments,
  IconArrowBarToDown,
  IconArrowBarToUp,
  IconCalendar,
  IconClock,
  IconFlag,
  IconHourglassLow,
  IconPlayerPlay,
  IconSearch,
  IconSwitchVertical,
} from "@tabler/icons";
import { useState } from "react";
import { CodeEditor } from "../../../components";
import { ConsumerConfiguration } from "../../../models";
import { ProducerModal } from "../modals/producer-modal";

type TopicPageMenuProps = {
  clusterId: string;
  topicName: string;
  query: string;
  consumedRecords?: number;
  isConsumerRunning?: boolean;
  height?: number;
  onQueryChange: (query: string) => void;
  onQuery: () => void;
  onConsumerChange: (config: "Custom" | ConsumerConfiguration | "Stop") => void;
  onModeChange?: (mode: "SQL" | "Simple") => void;
};

export const TopicPageMenu = (props: TopicPageMenuProps) => {
  const { consumedRecords, isConsumerRunning, height, query, topicName, clusterId } = props;
  const { onQueryChange, onConsumerChange, onQuery, onModeChange } = props;
  const [queryMode, setQueryMode] = useState(false);
  const [simpleSearchText, setSimpleSearchText] = useState("");

  onModeChange?.(queryMode ? "SQL" : "Simple");

  const onSimpleSearchTextChange = (text: string) => {
    setSimpleSearchText(text);
    text = text.trim();
    onQueryChange(`SELECT * FROM {:topic}
-- query by json fields with the json_extract function
-- WHERE json_extract(payload, "$.fieldName") = "something"
WHERE key like '%${text}%' OR payload like '%${text}%'
ORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}`);
  };

  const { consumeLast15Minutes, consumeLastHour, consumeLastDay, consumeFromNow, consumeFromBeginning } =
    consumeFromFunctions(onConsumerChange);

  const ConsumerBadge = () => (
    <Tooltip label="Total records consumed internally and queryable">
      <Badge hidden={consumedRecords == 0} variant="filled" color={"orange"}>
        {consumedRecords}
      </Badge>
    </Tooltip>
  );

  const StopButton = () => (
    <Button
      size="xs"
      onClick={() => onConsumerChange("Stop")}
      leftIcon={<Loader color={"white"} size={"xs"} />}
      rightIcon={<ConsumerBadge />}>
      Stop
    </Button>
  );

  const [producerOpened, setProducerOpened] = useState(false);

  return (
    <>
      {queryMode && (
        <>
          <Text my={5} size={"xs"}>
            Note: use json syntax to filter by field in the payload{" "}
            <Anchor href="https://www.sqlite.org/json1.html" target="tauri">
              https://www.sqlite.org/json1.html
            </Anchor>
          </Text>
          <CodeEditor
            hideLineNumbers={true}
            height={height ?? 20}
            language="sql"
            value={query}
            onChange={(v) => onQueryChange(v)}
          />
        </>
      )}
      {!queryMode && (
        <div style={{ minHeight: height ?? 20 }}>
          <TextInput
            pb={5}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            label="Text to search (Click the Query button to apply)"
            value={simpleSearchText}
            onChange={(v) => onSimpleSearchTextChange(v.target.value)}></TextInput>
        </div>
      )}
      <Group spacing={5} my={5} position="apart">
        <Group spacing={5}>
          {isConsumerRunning && <StopButton />}
          {!isConsumerRunning && (
            <Menu position="bottom-start">
              <Menu.Target>
                <Button size="xs" leftIcon={<IconArrowBarToDown size={16} />} rightIcon={<ConsumerBadge />}>
                  Consume
                </Button>
              </Menu.Target>
              <Menu.Dropdown mt={-3} pos={"fixed"}>
                <Menu.Item onClick={consumeLast15Minutes} icon={<IconHourglassLow size={14} />}>
                  Last 15 minutes
                </Menu.Item>
                <Menu.Item onClick={consumeLastHour} icon={<IconClock size={14} />}>
                  Last hour
                </Menu.Item>
                <Menu.Item onClick={consumeLastDay} icon={<IconCalendar size={14} />}>
                  Last day
                </Menu.Item>
                <Menu.Item onClick={consumeFromNow} icon={<IconFlag size={14} />}>
                  From now
                </Menu.Item>
                <Menu.Item onClick={consumeFromBeginning} icon={<IconPlayerPlay size={14} />}>
                  From the beginning
                </Menu.Item>
                <Menu.Item onClick={() => onConsumerChange("Custom")} icon={<IconAdjustments size={14} />}>
                  Custom
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
          <Button leftIcon={<IconSearch size={16} />} size="xs" onClick={onQuery}>
            Query
          </Button>
          <Button
            color="teal"
            leftIcon={<IconSwitchVertical size={16} />}
            size="xs"
            onClick={() => setQueryMode((s) => !s)}>
            {queryMode ? "Simple" : "SQL"}
          </Button>
        </Group>
        <Button
          leftIcon={<IconArrowBarToUp size={16} />}
          color={"orange"}
          size="xs"
          onClick={() => setProducerOpened(true)}>
          Produce
        </Button>
        <ProducerModal
          clusterId={clusterId}
          topic={topicName}
          onClose={() => setProducerOpened(false)}
          opened={producerOpened}
        />
      </Group>
    </>
  );
};

function consumeFromFunctions(onConsumerChange: (config: "Custom" | ConsumerConfiguration | "Stop") => void) {
  const FifteenMinutesMs = 15 * 60 * 1000;
  const OneHourMs = FifteenMinutesMs * 4;
  const consumeLast15Minutes = () =>
    onConsumerChange({
      compactify: false,
      consumer_start_config: { Custom: { start_timestamp: Date.now() - FifteenMinutesMs } },
    });
  const consumeLastHour = () =>
    onConsumerChange({
      compactify: false,
      consumer_start_config: { Custom: { start_timestamp: Date.now() - OneHourMs } },
    });
  const consumeLastDay = () =>
    onConsumerChange({
      compactify: false,
      consumer_start_config: { Custom: { start_timestamp: Date.now() - 24 * OneHourMs } },
    });
  const consumeFromNow = () =>
    onConsumerChange({
      compactify: false,
      consumer_start_config: "End",
    });
  const consumeFromBeginning = () =>
    onConsumerChange({
      compactify: false,
      consumer_start_config: "Beginning",
    });
  return { consumeLast15Minutes, consumeLastHour, consumeLastDay, consumeFromNow, consumeFromBeginning };
}
