import { useMantineTheme } from "@mantine/core";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";

type CodeEditorProps = {
  height: number | string;
  language?: string;
  value?: string;
  readOnly?: boolean;
  hideLineNumbers?: boolean;
  onChange?: (value: string) => void;
};

export const CodeEditor = ({
  height,
  language: defaultLanguage,
  value,
  readOnly,
  hideLineNumbers,
  onChange,
}: CodeEditorProps) => {
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
      height={height || 0}
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
        lineNumbersMinChars: hideLineNumbers ? 0 : 4,
        lineNumbers: hideLineNumbers ? false : true,
        glyphMargin: false,
        folding: hideLineNumbers ? false : true,
        lineDecorationsWidth: hideLineNumbers ? 0 : 10,
      }}
      beforeMount={(monaco) => setTheme(monaco)}
      onMount={(_, monaco) => setTheme(monaco)}
    />
  );
};
