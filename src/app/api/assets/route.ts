import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { spriteIdFromFilename } from '@/lib/parseStory';

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') || 'sprite';
  const dir = type === 'background' ? 'backgrounds' : 'sprites';
  const fullPath = path.join(process.cwd(), 'public', dir);

  try {
    const files = fs.readdirSync(fullPath).filter((f) => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));

    const result = files.map((filename) => ({
      filename,
      characterId: type === 'sprite' ? spriteIdFromFilename(filename) : filename.replace(/\.\w+$/, ''),
    }));

    return NextResponse.json({ files: result });
  } catch {
    return NextResponse.json({ files: [] });
  }
}
