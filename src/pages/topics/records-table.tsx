import { Skeleton, Table } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { Async } from "react-async";
import { VariableSizeList } from "react-window";

export type KafkaRecord = {
  key: string;
  value: string;
};

type RecordsTableProps = {
  itemCount: number;
  heightOffset?: number;
  renderRow: (rowIndex: number) => Promise<KafkaRecord>;
};

type InfiniteTableState = {
  windowHeight: number;
};

export const RecordsTable = (props: RecordsTableProps) => {
  const { itemCount, heightOffset, renderRow } = props;
  const [state, setState] = useState<InfiniteTableState>({ windowHeight: window.innerHeight });

  useEffect(() => {
    const handleWindowResize = () => setState((s) => ({ ...s, windowHeight: window.innerHeight }));
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return (
    <VariableSizeList
      innerElementType={CustomTable}
      height={state.windowHeight - (heightOffset ?? 0)}
      itemCount={itemCount}
      itemSize={(_) => 50}
      width={"100%"}>
      {({ index, style }) => (
        <Async promise={renderRow(index)}>
          <Async.Loading>
            <Skeleton />
          </Async.Loading>
          <Async.Fulfilled>
            {(data: KafkaRecord) => {
              return (
                <tr style={{ ...style, width: "100%" }}>
                  <td style={{ height: style.height }}>{itemCount - index}</td>
                  <td style={{ height: style.height }}>{data.key}</td>
                  <td
                    style={{
                      height: style.height,
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}>
                    {data.value}
                  </td>
                </tr>
              );
            }}
          </Async.Fulfilled>
        </Async>
      )}
    </VariableSizeList>
  );
};

const CustomTable = (props: { children: React.ReactElement[]; style: React.CSSProperties }) => {
  console.log(props);
  return (
    <div style={props.style}>
      <Table>
        <tbody style={{ overflowY: "auto" }}>{props.children}</tbody>
      </Table>
    </div>
  );
};
