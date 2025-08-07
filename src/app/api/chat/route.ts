import { NextResponse } from 'next/server';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET() {
  await sleep(2000); 
  return NextResponse.json({ text: 'Received the Prompt, Analyzing ......' });
}
