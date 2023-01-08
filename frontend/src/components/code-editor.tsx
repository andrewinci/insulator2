import Editor from "@monaco-editor/react";

type CodeEditorProps = {
  height?: number | string;
  path: string;
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
  return (
    <Editor
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
        automaticLayout: true,
        scrollBeyondLastLine: false,
        lineNumbersMinChars: hideLineNumbers ? 0 : 4,
        lineNumbers: hideLineNumbers ? "off" : "on",
        glyphMargin: false,
        folding: hideLineNumbers ? false : true,
        lineDecorationsWidth: hideLineNumbers ? 0 : 10,
      }}
      beforeMount={(monaco) => monaco.editor.setTheme("custom")}
      onMount={(_, monaco) => monaco.editor.setTheme("custom")}
    />
  );
};
