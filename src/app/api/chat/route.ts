import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ text: 'Received the Prompt , Analayzing ......' });
}