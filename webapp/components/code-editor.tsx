import { useMantineTheme } from "@mantine/core";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";

type CodeEditorProps = {
  height?: string | number;
  language?: string;
  value?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
};

export const CodeEditor = ({ height, language: defaultLanguage, value, readOnly, onChange }: CodeEditorProps) => {
  const mantineTheme = useMantineTheme();
  const monaco = useMonaco();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setTheme(monaco), [monaco]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setTheme = (monaco: any) => {
    monaco?.editor.defineTheme("custom", {
      base: mantineTheme.colorScheme == "dark" ? "vs-dark" : "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": mantineTheme.colorScheme == "dark" ? "#141517" : "#F8F9FA",
      },
    });
    monaco?.editor.setTheme("custom");
  };

  return (
    <Editor
      saveViewState={false}
      height={height}
      defaultLanguage={defaultLanguage}
      value={value}
      onChange={(v) => {
        if (onChange && v) {
          onChange(v);
        }
      }}
      options={{
        minimap: {
          enabled: false,
        },
        contextmenu: false,
        readOnly,
        theme: "custom",
        scrollBeyondLastLine: false,
        lineNumbersMinChars: 2,
      }}
      beforeMount={(monaco) => setTheme(monaco)}
      onMount={(_, monaco) => setTheme(monaco)}
    />
  );
};
