'use client';

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatInput } from "./ChatInput";
import { CollapsedProps, ExpandedProps } from "./types";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import Collapse from '@mui/material/Collapse';


function Expanded({
  textAreaRef,
  input,
  chatLog,
  loading,
  handleSubmit,
  setInput,
  setExpanded,
  setDirection,
}: ExpandedProps) {
  return (
    <div className="relative w-full max-w-2xl h-[80vh] flex flex-col">
      <ChatInput
        textAreaRef={textAreaRef}
        input={input}
        chatLog={chatLog}
        loading={loading}
        onChange={(e) => {
          const value = e.target.value;
          const lastUserIndex = value.lastIndexOf('User: ');
          if (lastUserIndex !== -1) {
            const afterUser = value.substring(lastUserIndex + 6);
            setInput(afterUser);
          } else {
            setInput('');
          }
        }}
        onSubmit={handleSubmit}
      />
      <button
        onClick={() => {
          setDirection('left');
          setExpanded(false);
        }}
        className="absolute -top-[35px] right-0 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-black dark:text-white shadow"
      >
        {"<"}
      </button>
    </div>
  );
}

function Collapsed({
  textAreaRef,
  input,
  chatLog,
  loading,
  handleSubmit,
  setInput,
  setExpanded,
  setDirection,
  streamResponse,
}: CollapsedProps) {
  return (
    <>
  <div className="row-span-2 col-start-1 h-full flex flex-col pb-4 overflow-hidden">
    <form onSubmit={handleSubmit} className="flex flex-col flex-grow w-full">
      <textarea
        ref={textAreaRef}
        onKeyDown={(e) => {
          if (!loading && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        className="flex-grow w-full p-4 rounded-md border border-gray-300 dark:border-gray-700 resize-none text-sm font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 overflow-auto"
        placeholder="Ask me anything..."
        value={`${chatLog}${chatLog ? '\n' : ''}User: ${input}`}
        onChange={(e) => {
          const value = e.target.value;
          const lastUserIndex = value.lastIndexOf('User: ');
          if (lastUserIndex !== -1) {
            const afterUser = value.substring(lastUserIndex + 6);
            setInput(afterUser);
          } else {
            setInput('');
          }
        }}
      />
      <button
        type="submit"
        className="mt-4 w-full h-12 bg-blue-600 text-white dark:bg-blue-600 dark:text-white hover:bg-blue-700 dark:hover:bg-blue-700 rounded-md font-medium text-sm flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? (
          <svg className="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          'Send'
        )}
      </button>
    </form>
  </div>

  <div className="row-span-2 col-start-2 relative mr-4 pb-[15px]">
    <button
      className="absolute -top-[35px] -left-0 text-black dark:text-white rounded-full w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
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
</>

  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState("");
  const [streamResponse, setStreamResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [error, setError] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [chatLog, input]);

  useEffect(() => {
    if (!chatLog) return;

    //const eventSource = new EventSource('http://localhost:8081/v1/tools/observations/stream');
    let fullStream = '';

    const handleMessage = (event: MessageEvent) => {
      setLoading(true);
      const data = JSON.parse(event.data);

      if (data.done) {
        setLoading(false);
        //eventSource.close();
        return;
      }

      fullStream += `\n${data.description}`;
      setStreamResponse(fullStream);
    };

    const handleError = () => {
      setLoading(false);
      //eventSource.close();
      setStreamResponse((prev) => prev + '\n[Stream error]');
    };

    //eventSource.onmessage = handleMessage;
    //eventSource.onerror = handleError;

    return () => {
      //eventSource.close();
    };
  }, [chatLog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;

    const userEntry = `User: ${prompt}`;
    setInput('');
    setLoading(true);
    setStreamResponse('');

    try {
      const chatRes = await fetch(`http://localhost:8081/v1/same-to-same/chat?userPrompt=${encodeURIComponent(input)}`);
      const data = await chatRes.json();
      const reply = data.text || '[No response]';
      setChatLog(prev => `${prev}${prev ? '\n' : ''}${userEntry}\nBot: ${reply}`);
    } catch (err) {
      console.error(err);
      setError("Failed to contact the server. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen pt-[50px] pb-[50px] overflow-hidden">
      <Collapse in={!!error} mountOnEnter unmountOnExit>
        <Slide direction="down" in={!!error} mountOnEnter unmountOnExit>
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
            <Alert severity="error" variant="filled">
              {error}
            </Alert>
          </div>
        </Slide>
       </Collapse>

      <AnimatePresence mode="wait">
        <motion.div
          key={expanded ? 'expanded' : 'collapsed'}
          initial={{ x: direction === 'right' ? -1000 : 1000, opacity: 1 }}
          animate={{ x: 1, opacity: 1 }}
          exit={{ x: direction === 'right' ? 1 : 1, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={`w-full h-full ${expanded
              ? 'flex items-center justify-center p-6'
              : 'p-4 font-sans grid grid-cols-[30%_70%] grid-rows-[70%_30%] gap-4'
            }`}
        >
          {expanded ? (
            <Expanded
              textAreaRef={textAreaRef}
              input={input}
              chatLog={chatLog}
              loading={loading}
              handleSubmit={handleSubmit}
              setInput={setInput}
              setExpanded={setExpanded}
              setDirection={setDirection}
            />
          ) : (
            <Collapsed
              textAreaRef={textAreaRef}
              input={input}
              chatLog={chatLog}
              loading={loading}
              handleSubmit={handleSubmit}
              setInput={setInput}
              setExpanded={setExpanded}
              setDirection={setDirection}
              streamResponse={streamResponse}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
