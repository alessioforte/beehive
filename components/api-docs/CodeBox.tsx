import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useMantineColorScheme } from "@mantine/core";

interface CodeBoxProps {
  value: string;
  language?: "json" | "javascript" | "typescript" | "python" | "html" | "css";
  readOnly?: boolean;
  height?: number | string;
  onChange?: (value: string) => void;
}

export default function CodeBox({
  value,
  language = "json",
  readOnly = true,
  height,
  onChange,
}: CodeBoxProps) {
  const theme = useMantineColorScheme();

  const getLanguageExtension = () => {
    switch (language) {
      case "json":
        return json();
      default:
        return json();
    }
  };

  return (
    <CodeMirror
      style={{ fontSize: 12 }}
      value={value}
      height={height ? String(height) : undefined}
      extensions={[getLanguageExtension()]}
      theme={theme.colorScheme === "dark" ? vscodeDark : vscodeLight}
      readOnly={readOnly}
      onChange={onChange}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: !readOnly,
        highlightActiveLineGutter: !readOnly,
      }}
    />
  );
}
