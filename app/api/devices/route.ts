import { NextResponse } from 'next/server';

export async function GET() {
  // Your GET handler code here
  return NextResponse.json({ message: 'Hello' });
}

export async function POST() {
  // Your POST handler code here
  return NextResponse.json({ message: 'Posted' });
} 