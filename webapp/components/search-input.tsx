import { Kbd, TextInput } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons";
import { useRef } from "react";
import { usePlatform } from "@tauri/helpers";

type SearchInputProps = {
  value?: string;
  placeholder?: string;
  showShortcut?: boolean;
  onChange?: (_: string) => void;
  onEnter?: () => void;
};

export const SearchInput = (props: SearchInputProps) => {
  const { placeholder, value, showShortcut, onChange, onEnter } = props;
  const platform = usePlatform();
  const rightSection = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Kbd sx={{ maxHeight: "23px" }}> {platform === "darwin" ? "⌘" : "Ctrl"}</Kbd>
      <span style={{ margin: "0 5px" }}>+</span>
      <Kbd sx={{ maxHeight: "23px" }}>f</Kbd>
    </div>
  );

  const ref = useRef<HTMLInputElement>(null);
  useHotkeys([["mod+f", () => ref.current?.focus()]]);

  return (
    <TextInput
      ref={ref}
      size="xs"
      style={{ width: "40%" }}
      icon={<IconSearch style={{ margin: 0 }} size={15} />}
      placeholder={placeholder ?? "Search"}
      value={value}
      rightSectionWidth={showShortcut ? 90 : undefined}
      rightSection={showShortcut ? rightSection : undefined}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={(v: any) => {
        if (v && onChange) onChange(v.target.value);
      }}
      onKeyUp={(e) => {
        if (e.code == "Enter" && onEnter) {
          onEnter();
        }
      }}
    />
  );
};
