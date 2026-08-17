import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

interface EditorAreaProps {
  language: string;
}

export default function EditorArea({ language }: EditorAreaProps) {
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('codesync-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { background: '0F1115' }
        ],
        colors: {
          'editor.background': '#0F1115',
          'editor.lineHighlightBackground': '#161B22',
          'editorLineNumber.foreground': '#7D8590',
          'editor.selectionBackground': '#21262D',
        }
      });
      monaco.editor.setTheme('codesync-dark');
    }
  }, [monaco]);

  return (
    <div className="flex-1 h-full w-full">
      <Editor
        height="100%"
        language={language}
        theme="codesync-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          formatOnPaste: true,
        }}
        loading={<div className="flex items-center justify-center h-full text-secondary">Loading Editor...</div>}
        defaultValue="// Start coding here..."
      />
    </div>
  );
}
