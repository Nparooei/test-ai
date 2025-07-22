'use client'

import { useEffect, useState } from "react";
import NavigationBar from "@/components/navigation-bar/navigation-bar";

export default function Home() {
  const [input, setInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [streamResponse, setStreamResponse] = useState("");
  // Example: replace with your actual SSE implementation

  useEffect(() => {
  if (!chatResponse) return;

  const eventSource = new EventSource('/api/observation/stream');
  let fullStream = `${chatResponse}\n`;

  const handleMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);

    if (data.done) {
      eventSource.close();
      return;
    }

    fullStream += `\n${data.chunk}`;
    setStreamResponse(fullStream);
  };

  const handleError = () => {
    eventSource.close();
    setStreamResponse((prev) => prev + '\n[Stream error]');
  };

  eventSource.onmessage = handleMessage;
  eventSource.onerror = handleError;

  // Cleanup on unmount or re-trigger
  return () => {
    eventSource.close();
  };
}, [chatResponse]);


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setChatResponse('');
  setStreamResponse('');


  try {
    // 1. Call /api/chat?prompt=...
    const chatRes = await fetch(`/api/chat?prompt=${encodeURIComponent(input)}`);
    const data = await chatRes.json();
    setChatResponse(data.message || 'No response from /chat');

    // 2. Start SSE from /api/observation/stream
    
  } catch (error) {
    console.error('Error:', error);
    setChatResponse('[Error calling API]');
  }
};

  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] min-h-screen p-8 pb-20 gap-8 sm:p-20">
      {/* Top Navigation Bar */}
      <NavigationBar/>

      {/* Main Chat Area */}
      <main className="row-start-2 w-full max-w-2xl mx-auto flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            className="w-full h-32 p-4 rounded-md border border-gray-300 dark:border-gray-700 resize-none text-sm"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="self-end bg-foreground text-background px-6 py-2 rounded-full font-medium text-sm hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Send
          </button>
        </form>

        <div className="p-4 border rounded-md text-sm bg-gray-50 dark:bg-gray-800 whitespace-pre-wrap">
          {streamResponse || "Your response will appear here..."}
        </div>
      </main>

    </div>
  );
}