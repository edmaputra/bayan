import { NextResponse } from 'next/server';
import { getGraphData } from '@/lib/graph';

export async function GET() {
  try {
    const data = getGraphData();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
