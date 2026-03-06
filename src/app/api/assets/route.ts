import { NextRequest, NextResponse } from 'next/server';
import { listAssets } from '@/lib/storageAdapter';

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') === 'background' ? 'background' : 'sprite';

  try {
    const files = await listAssets(type);
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ files: [] });
  }
}
