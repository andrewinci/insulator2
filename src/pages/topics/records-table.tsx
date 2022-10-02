import styled from "@emotion/styled";
import { Paper, Text, Group } from "@mantine/core";
import { Prism } from "@mantine/prism";
import React, { useEffect, useState } from "react";
import { VariableSizeList } from "react-window";

export type KafkaRecord = {
  key: string;
  value: string;
};

type RecordsTableProps = {
  itemCount: number;
  heightOffset?: number;
  fetchRecord: (rowIndex: number) => Promise<KafkaRecord>;
};

type InfiniteTableState = {
  windowHeight: number;
};

export const RecordsTable = (props: RecordsTableProps) => {
  const { itemCount, heightOffset, fetchRecord } = props;
  const [state, setState] = useState<InfiniteTableState>({ windowHeight: window.innerHeight });

  useEffect(() => {
    const handleWindowResize = () => setState((s) => ({ ...s, windowHeight: window.innerHeight }));
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return (
    <VariableSizeList
      height={state.windowHeight - (heightOffset ?? 0)}
      itemCount={itemCount}
      itemSize={(_) => 125}
      width={"100%"}>
      {({ index, style }) => <KafkaRecordCard index={index} style={style} fetchRecord={fetchRecord} />}
    </VariableSizeList>
  );
};

const KafkaRecordCard = ({
  index,
  style,
  fetchRecord,
}: {
  index: number;
  style: React.CSSProperties;
  fetchRecord: (rowIndex: number) => Promise<KafkaRecord>;
}) => {
  const [record, setRecord] = useState<KafkaRecord>({ key: "", value: "" });

  useEffect(() => {
    fetchRecord(index).then((r) => setRecord(r));
  }, [fetchRecord, index]);

  return (
    <Paper shadow="xs" p={5} withBorder style={{ ...style, maxHeight: 120, width: "calc(100% - 20px)" }}>
      <Group spacing={0}>
        <Text size={13} italic>
          {index}
        </Text>
        <Text size={13} ml={10} italic>
          key:
        </Text>
        <Text size={13} weight={"bold"}>
          {record.key}
        </Text>
        <Text size={13} ml={10} italic>
          partition:
        </Text>
        <Text size={13} weight={"bold"}>
          1
        </Text>
        <Text size={13} ml={10} italic>
          offset:
        </Text>
        <Text size={13} weight={"bold"}>
          1
        </Text>
        <Text size={13} ml={10} italic>
          timestamp:
        </Text>
        <Text size={13} weight={"bold"}>
          {Date()}
        </Text>
      </Group>
      <CustomPrism mt={2} copyLabel="Copy" language={"json"}>
        {record.value}
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
`;
