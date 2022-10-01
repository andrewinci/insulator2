import React, { useEffect, useState } from "react";
import { FixedSizeList } from "react-window";

type InfiniteTableProps = {
  itemCount: number;
  itemSize: number;
  heightOffset?: number;
  renderRow: (rowIndex: number, style: React.CSSProperties) => React.ReactElement;
};

type InfiniteTableState = {
  windowHeight: number;
};

export const InfiniteTable = (props: InfiniteTableProps) => {
  const { itemCount, itemSize, heightOffset, renderRow } = props;
  const [state, setState] = useState<InfiniteTableState>({ windowHeight: window.innerHeight });

  useEffect(() => {
    const handleWindowResize = () => setState((s) => ({ ...s, windowHeight: window.innerHeight }));
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return (
    <FixedSizeList
      height={state.windowHeight - (heightOffset ?? 0)}
      itemCount={itemCount}
      itemSize={itemSize}
      width={"100%"}>
      {({ index, style }) => renderRow(index, style)}
    </FixedSizeList>
  );
};
