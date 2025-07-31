import { th } from 'framer-motion/client';
import { NextResponse } from 'next/server';

export async function GET() {

  return NextResponse.json({ message: 'Some error happened'},{status:500 },);
}