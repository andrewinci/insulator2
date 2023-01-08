import { loader } from "@monaco-editor/react";
import { useMantineTheme } from "@mantine/core";
import { useMonaco } from "@monaco-editor/react";

import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

loader.config({ monaco });

loader.init();

export const useInitMonaco = () => {
  const mantineTheme = useMantineTheme();
  const monaco = useMonaco();

  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // useEffect(() => setTheme(monaco), [monaco, mantineTheme]);
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
  setTheme(monaco);
};
