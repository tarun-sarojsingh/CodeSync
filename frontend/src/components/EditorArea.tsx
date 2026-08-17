import Editor, { useMonaco, OnMount } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { MonacoBinding } from 'y-monaco';

interface EditorAreaProps {
  language: string;
  yDoc: Y.Doc;
  awareness: Awareness;
}

export default function EditorArea({ language, yDoc, awareness }: EditorAreaProps) {
  const monaco = useMonaco();
  const bindingRef = useRef<MonacoBinding | null>(null);

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

  const handleEditorMount: OnMount = (editor, monaco) => {
    const type = yDoc.getText('monaco');
    bindingRef.current = new MonacoBinding(
      type,
      editor.getModel()!,
      new Set([editor]),
      awareness
    );
  };

  useEffect(() => {
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
    };
  }, []);

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
        onMount={handleEditorMount}
      />
    </div>
  );
}
