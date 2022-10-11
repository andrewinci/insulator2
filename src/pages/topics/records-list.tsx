import styled from "@emotion/styled";
import { Paper, Text, Group } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { formatISO } from "date-fns";
import React, { useEffect, useState } from "react";
import { FixedSizeList } from "react-window";
import { KafkaRecord } from "../../models/kafka";

type RecordsListProps = {
  itemCount: number;
  heightOffset?: number;
  fetchRecord: (rowIndex: number) => Promise<KafkaRecord>;
};

export const RecordsList = (props: RecordsListProps) => {
  const { itemCount, heightOffset, fetchRecord } = props;
  const [state, setState] = useState<{ windowHeight: number }>({ windowHeight: window.innerHeight });

  useEffect(() => {
    const handleWindowResize = () => setState((s) => ({ ...s, windowHeight: window.innerHeight }));
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return (
    <FixedSizeList
      height={state.windowHeight - (heightOffset ?? 0)}
      itemCount={itemCount}
      itemSize={125}
      width={"100%"}>
      {({ index, style }) => <KafkaRecordCard index={index} style={style} fetchRecord={fetchRecord} />}
    </FixedSizeList>
  );
};

const LabelValue = ({ label, value }: { label: string; value: any }) => (
  <>
    <Text size={13} ml={10} italic>
      {label}
    </Text>
    <Text size={13} weight={"bold"}>
      {value}
    </Text>
  </>
);

const KafkaRecordCard = ({
  index,
  style,
  fetchRecord,
}: {
  index: number;
  style: React.CSSProperties;
  fetchRecord: (rowIndex: number) => Promise<KafkaRecord>;
}) => {
  const [record, setRecord] = useState<KafkaRecord>({
    key: "N/A",
    payload: "N/A",
    partition: -1,
    offset: -1,
    timestamp: undefined,
  });

  useEffect(() => {
    fetchRecord(index).then((r) => setRecord(r));
  }, [fetchRecord, index]);
  const timestamp = record?.timestamp ? formatISO(new Date(record.timestamp)) : "N/A";
  return (
    <Paper shadow="xs" p={5} withBorder style={{ ...style, maxHeight: 120, width: "calc(100% - 20px)" }}>
      <Group spacing={0} noWrap={true} style={{ height: 20 }}>
        <Text size={13} italic>
          {index}
        </Text>
        <LabelValue label="key: " value={record?.key} />
        <LabelValue label="partition: " value={record?.partition} />
        <LabelValue label="offset: " value={record?.offset} />
        <LabelValue label="timestamp: " value={timestamp} />
      </Group>
      <CustomPrism mt={2} copyLabel="Copy" language={"json"}>
        {record?.payload ?? ""}
      </CustomPrism>
    </Paper>
  );
};

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
