import { NextRequest, NextResponse } from 'next/server';
import type { AutomatedMessageRule } from '@/types/messages';

// In-memory storage for automated rules (one per metric)
const automatedRules: Record<string, AutomatedMessageRule> = {};

type Props = {
  params: {
    metricId: string
  }
}

export async function POST(request: NextRequest) {
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
  request: NextRequest,
  { params }: { params: Promise<{ metricId: string }> }
) {
  const resolvedParams = await params;
  const { metricId } = resolvedParams;
  try {
    if (metricId && automatedRules[metricId]) {
      delete automatedRules[metricId];
      return NextResponse.json({ message: `Deleted metric ${metricId}` });
    }
    return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete automated rule' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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