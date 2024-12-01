import { NextResponse } from 'next/server';
import type { AutomatedMessageRule } from '@/types/messages';

// In-memory storage for automated rules (one per metric)
const automatedRules: Record<string, AutomatedMessageRule> = {};

export async function POST(request: Request) {
  try {
    const rule: AutomatedMessageRule = await request.json();
    
    // Store/overwrite the rule for this metric
    automatedRules[rule.metricId] = rule;
    
    // Mock function to demonstrate the rule was received
    console.log('New automated rule set:', {
      metricId: rule.metricId,
      threshold: rule.threshold,
      comparison: rule.comparison,
      message: rule.message,
      channels: rule.channels
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting automated rule:', error);
    return NextResponse.json(
      { error: 'Failed to set automated rule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { metricId: string } }
) {
  try {
    const url = new URL(request.url);
    const metricId = url.pathname.split('/').pop();
    
    if (metricId && automatedRules[metricId]) {
      delete automatedRules[metricId];
      console.log(`Deleted automated rule for metric: ${metricId}`);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { error: 'Rule not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error deleting automated rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete automated rule' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return all stored automated rules
    return NextResponse.json(automatedRules);
  } catch (error) {
    console.error('Error fetching automated rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automated rules' },
      { status: 500 }
    );
  }
} 