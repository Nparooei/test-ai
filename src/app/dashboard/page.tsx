'use client'

import { useEffect, useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [streamResponse, setStreamResponse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (!chatResponse) return;

  const eventSource = new EventSource('/api/observation/stream');
  let fullStream = `${chatResponse}\n`;

  const handleMessage = (event: MessageEvent) => {
    setLoading(true);
    const data = JSON.parse(event.data);

    if (data.done) {
      setLoading(false);
      eventSource.close();
      return;
    }

    fullStream += `\n${data.chunk}`;
    setStreamResponse(fullStream);
  };

  const handleError = () => {
    setLoading(false);
    eventSource.close();
    setStreamResponse((prev) => prev + '\n[Stream error]');
  };

  eventSource.onmessage = handleMessage;
  eventSource.onerror = handleError;

  return () => {
    eventSource.close();
  };
}, [chatResponse]);


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setChatResponse('');
  setStreamResponse('');


  try {
    setLoading(true);
    const chatRes = await fetch(`/api/chat?prompt=${encodeURIComponent(input)}`);
    const data = await chatRes.json();
    setChatResponse(data.message || 'No response from /chat');
    setLoading(false);

    
  } catch (error) {
    setLoading(false);
    console.error('Error:', error);
    setChatResponse('[Error calling API]');
  }
};

return (
  <div className="mt-[50px] font-sans w-screen h-[calc(100vh-100px)] grid grid-cols-[30%_70%] grid-rows-[70%_30%] p-4 gap-4">
    
    <div className="row-span-2 col-start-1 h-full flex flex-col pb-4">
      <textarea
        className="flex-grow w-full p-4 rounded-md border border-gray-300 dark:border-gray-700 resize-none text-sm"
        placeholder="Ask me anything..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        type="submit"
        onClick={handleSubmit}
        className="mt-4 w-full h-12 bg-foreground text-background rounded-md font-medium text-sm hover:bg-[#383838] dark:hover:bg-[#ccc] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && (
    <svg
      className="w-10 h-10 animate-spin text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
    </svg>
  )}
  {loading ? null : 'Send'}
      </button>
    </div>

    <div className="row-start-1 col-start-2 bg-gray-200 rounded-md overflow-hidden mr-4">
      <iframe
        srcDoc="<html><body style='margin:0;background-color:#e5e5e5;'></body></html>"
        className="w-full h-full"
      />
    </div>

    <div className="mr-4 mb-4 row-start-2 col-start-2 bg-gray-50 dark:bg-gray-800 p-4 border rounded-md text-sm whitespace-pre-wrap overflow-auto">
      {streamResponse || "Your response will appear here..."}
    </div>
  </div>
);


}