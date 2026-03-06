import { NextRequest, NextResponse } from 'next/server';
import { listCreativeAssets, listCreativeBackgrounds } from '@/lib/storageAdapter';
import { ProjectType } from '@/lib/types';

export async function GET(request: NextRequest) {
  const mode = (request.nextUrl.searchParams.get('mode') || 'decoration') as ProjectType;
  const type = request.nextUrl.searchParams.get('type'); // 'backgrounds' or null for items

  try {
    if (type === 'backgrounds') {
      const backgrounds = await listCreativeBackgrounds(mode);
      return NextResponse.json({ backgrounds });
    }

    const categories = await listCreativeAssets(mode);
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ categories: [], backgrounds: [] });
  }
}
