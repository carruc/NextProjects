import { NextResponse } from 'next/server';
import type { BroadcastMessage } from '@/types/messages';

export async function POST(request: Request) {
  try {
    const message: BroadcastMessage = await request.json();
    
    // Mock function to demonstrate the message was received
    console.log('Broadcasting message:', {
      message: message.message,
      channels: message.channels,
      includeMetrics: message.includeMetrics
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending broadcast message:', error);
    return NextResponse.json(
      { error: 'Failed to send broadcast message' },
      { status: 500 }
    );
  }
} 