import { NextResponse } from 'next/server';

export async function GET() {
  // Return empty array for now, you can modify this based on your needs
  return NextResponse.json({ rules: [] });
} 