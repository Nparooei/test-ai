import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const chunks = [
  "Identifies the element's role within the page structure, such as a button or input field.",
  "Captures visible text content to enhance semantic understanding of the element.",
  "Includes element attributes like id, name, or class to support precise targeting.",
  "Records the element's position within the DOM hierarchy for contextual relevance.",
  "Extracts ARIA labels or tooltips for accessibility-aware scraping.",
  "Flags dynamic or JavaScript-rendered elements that may require browser emulation.",
  "Detects click handlers or input listeners attached to the element.",
  "Maps CSS styles and visibility state to determine interactability.",
  "Analyzes surrounding sibling elements to infer logical grouping.",
  "Logs network or API activity triggered upon interaction with the element."
];

      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
        await new Promise((r) => setTimeout(r, 400)); // Simulate delay
      }

      // Final message to tell frontend it's done
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));

      // Close the stream manually
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
