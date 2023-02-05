import styled from "@emotion/styled";
import { Paper, Text, Group, ActionIcon, Tooltip } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { Prism } from "@mantine/prism";
import { IconCopy, IconEraser, IconEye } from "@tabler/icons";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { pretty } from "../../../helpers/json";
import { KafkaRecord } from "../../../models/kafka";

type KafkaRecordCardProps = {
  record: KafkaRecord;
  index: number;
  style: React.CSSProperties;
  height: number;
  onOpenDetails: (record: KafkaRecord) => void;
};

export const KafkaRecordCard = ({ record, index, style, height, onOpenDetails }: KafkaRecordCardProps) => {
  const timestamp = useMemo(
    () => (record?.timestamp ? dayjs(record.timestamp).toISOString() : "N/A"),
    [record.timestamp]
  );
  const clipboard = useClipboard();

  const [copyState, setCopyState] = useState<{ color?: string }>({ color: undefined });
  return (
    <Paper shadow="xs" p={5} withBorder style={{ ...style, maxHeight: height, width: "calc(100% - 20px)" }}>
      <Group position="apart" align="flex-start" mt={-3} p={0} style={{ height: 20 }}>
        <Text weight={"bold"} size={13}>
          {index} - {record?.key}
        </Text>
        <Group position="right" spacing={0}>
          {!record.payload && (
            <Tooltip label="This record is a tombstone">
              <ActionIcon>
                <IconEraser size={20} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Copy record" color={copyState.color}>
            <ActionIcon
              onClick={() => {
                clipboard.copy(pretty(record.payload));
                setCopyState({ color: "green" });
                setTimeout(() => setCopyState({}), 600);
              }}>
              <IconCopy size={20}></IconCopy>
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Record details">
            <ActionIcon onClick={() => onOpenDetails(record)}>
              <IconEye size={20}></IconEye>
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Group spacing={0} noWrap={true} style={{ height: 12 }}>
        <LabelValue label="partition: " value={record?.partition} />
        <LabelValue label="offset: " value={record?.offset} />
        <LabelValue label="timestamp: " value={timestamp} />
      </Group>
      <CustomPrism mt={2} noCopy={true} language={"json"}>
        {record?.payload ?? ""}
      </CustomPrism>
    </Paper>
  );
};

const LabelValue = ({ label, value }: { label: string; value: string | number }) => (
  <>
    <Text size={12}>{label}</Text>
    <Text size={12} weight={"bold"} mr={8}>
      {value}
    </Text>
  </>
);

const CustomPrism = styled(Prism)`
  code[class*="language-"],
  pre[class*="language-"] {
    padding-right: 20px; //avoid to have text under the copy icon
    font-size: 13px;
    white-space: normal !important;
    word-break: break-word !important;
    height: 85px;
  }
  pre {
    height: 80px;
    overflow-y: auto;
  }
`;
