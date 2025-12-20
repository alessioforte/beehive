import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useMantineColorScheme } from "@mantine/core";

interface CodeBoxProps {
  value: string;
  language?: "json" | "javascript" | "typescript" | "python" | "html" | "css";
  readOnly?: boolean;
  height?: number | string;
}

export default function CodeBox({
  value,
  language = "json",
  readOnly = true,
}: CodeBoxProps) {
  const theme = useMantineColorScheme();

  const getLanguageExtension = () => {
    switch (language) {
      case "json":
        return json();
      // Add more cases for other languages if needed
      default:
        return json();
    }
  };

  return (
    <CodeMirror
      style={{ fontSize: 12 }}
      value={value}
      extensions={[getLanguageExtension()]}
      theme={theme.colorScheme === "dark" ? vscodeDark : vscodeLight}
      readOnly={readOnly}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
      }}
    />
  );
}
