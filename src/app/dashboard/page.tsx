'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createEditor,
  Descendant,
  Text,
} from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { AnimatePresence, motion } from 'framer-motion';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import Collapse from '@mui/material/Collapse';

function renderLeaf({ attributes, children, leaf }: any) {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  return <span {...attributes}>{children}</span>;
}

function decorate([node, path]: any) {
  const ranges: any[] = [];
  if (!Text.isText(node)) return ranges;

  const tokens = ['User:', 'Bot:'];
  for (const token of tokens) {
    const parts = node.text.split(token);
    let offset = 0;
    for (let i = 0; i < parts.length - 1; i++) {
      const start = offset + parts[i].length;
      const end = start + token.length;
      ranges.push({
        anchor: { path, offset: start },
        focus: { path, offset: end },
        bold: true,
      });
      offset = end;
    }
  }

  return ranges;
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

export default function Home() {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState<Descendant[]>(initialValue);
  const [renderKey, setRenderKey] = useState(0); 
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [error, setError] = useState<string | null>(null);

  const insertParagraph = (text: string) => {
    const newNode: Descendant = {
      type: 'paragraph',
      children: [{ text }],
    };
    setValue((prev) => {
      const next = [...prev, newNode];
      setRenderKey((k) => k + 1);
      return next;
    });
  };

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setInput('');
    setStreamBuffer('');
    insertParagraph(`User: ${trimmed}`);

    try {
      const res = await fetch(`/api/chat?prompt=${encodeURIComponent(input)}`);
      const data = await res.json();
      const botReply = data.text || '[No response]';
      insertParagraph(`Bot: ${botReply}`);
      setStreaming(true);
    } catch {
      insertParagraph('Bot: [error contacting server]');
      setError('Failed to contact the server.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!loading && !streaming && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (!streaming) return;

    const eventSource = new EventSource('/api/observation/stream');
    let accumulated = '';

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.done) {
        eventSource.close();
        setStreaming(false);
        setStreamBuffer((prev) => prev + '\n[Done]');
        return;
      }

      accumulated += `\n${data.description}`;
      setStreamBuffer(accumulated);
    };

    const handleError = () => {
      setStreaming(false);
      eventSource.close();
      setStreamBuffer((prev) => prev + '\n[stream error]');
    };

    eventSource.onmessage = handleMessage;
    eventSource.onerror = handleError;

    return () => {
      eventSource.close();
    };
  }, [streaming]);

  return (
    <div className="relative w-screen h-screen pt-[50px] pb-[50px] overflow-hidden">
      <Collapse in={!!error} mountOnEnter unmountOnExit>
        <Slide direction="down" in={!!error} mountOnEnter unmountOnExit>
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
            <Alert severity="error" variant="filled">{error}</Alert>
          </div>
        </Slide>
      </Collapse>

      <AnimatePresence mode="wait">
        <motion.div
          key={expanded ? 'expanded' : 'collapsed'}
          initial={{ x: direction === 'right' ? -1000 : 1000, opacity: 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction === 'right' ? 1 : 1, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full flex"
        >
          <div className={`flex flex-col pb-4 overflow-hidden transition-all duration-300 ${expanded ? 'w-[60%] mx-auto' : 'w-[30%] ml-4'}`}>
            <Slate key={renderKey} editor={editor} initialValue={value}>
              <Editable
                decorate={decorate}
                renderLeaf={renderLeaf}
                readOnly={true}
                className="flex-grow w-full p-4 rounded-md border border-gray-300 dark:border-gray-700 resize-none text-sm font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-auto"
              />
            </Slate>

            <textarea
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || streaming}
              className="mt-4 w-full h-20 p-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none disabled:opacity-50"
            />

            <button
              onClick={handleSubmit}
              disabled={loading || streaming}
              className="mt-2 h-12 w-full bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium text-sm flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {(loading || streaming) ? (
                <svg className="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : 'Send'}
            </button>
          </div>

          {!expanded && (
            <div className="ml-[20px] w-[70%] pr-4 grid grid-rows-[70%_30%] gap-4 mb-[33px]">
              <div className="relative">
                <button
                  className="absolute -top-[35px] -left-0 text-black dark:text-white rounded-full w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                  onClick={() => {
                    setDirection('right');
                    setExpanded(true);
                  }}
                  aria-label="Expand"
                >
                  {">"}
                </button>
                <div className="bg-gray-200 dark:bg-gray-900 rounded-md overflow-hidden w-full h-full">
                  <iframe src="http://localhost:8080" className="w-full h-full" />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 border rounded-md text-sm whitespace-pre-wrap overflow-auto">
                {streamBuffer || 'Your response will appear here...'}
              </div>
            </div>
          )}

          
        </motion.div>
        {expanded && (
            <div className="absolute top-[10px]  right-[20%]">
              <button
                className="text-black dark:text-white rounded-full w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                onClick={() => {
                  setDirection('left');
                  setExpanded(false);
                }}
                aria-label="Collapse"
              >
                {"<"}
              </button>
            </div>
          )}
      </AnimatePresence>
    </div>
  );
}
