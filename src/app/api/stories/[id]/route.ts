import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STORIES_DIR = path.join(process.cwd(), 'data', 'stories');

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Props) {
  const { id } = await params;
  const filePath = path.join(STORIES_DIR, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const story = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return NextResponse.json({ story });
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const { id } = await params;
  const filePath = path.join(STORIES_DIR, `${id}.json`);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return NextResponse.json({ deleted: true });
}
