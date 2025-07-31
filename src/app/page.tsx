import {redirect} from 'next/navigation';

export default function RootPage(){
  redirect('/dashboard');
}



//   useEffect(() => {
//   if (!chatResponse) return;

//   const eventSource = new EventSource('/api/observation/stream');
//   let fullStream = `${chatResponse}\n`;

//   const handleMessage = (event: MessageEvent) => {
//     setLoading(true);
//     const data = JSON.parse(event.data);

//     if (data.done) {
//       setLoading(false);
//       eventSource.close();
//       return;
//     }

//     fullStream += `\n${data.chunk}`;
//     setStreamResponse(fullStream);
//   };

//   const handleError = () => {
//     setLoading(false);
//     eventSource.close();
//     setStreamResponse((prev) => prev + '\n[Stream error]');
//   };

//   eventSource.onmessage = handleMessage;
//   eventSource.onerror = handleError;

//   return () => {
//     eventSource.close();
//   };
// }, [chatResponse]);


//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   setChatResponse('');
//   setStreamResponse('');


//   try {
//     setLoading(true);
//     const chatRes = await fetch(`/api/chat?prompt=${encodeURIComponent(input)}`);
//     const data = await chatRes.json();
//     setChatResponse(data.message || 'No response from /chat');
//     setLoading(false);
