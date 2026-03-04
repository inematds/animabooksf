import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseStory } from '@/lib/parseStory';

const STORIES_DIR = path.join(process.cwd(), 'data', 'stories');

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Props) {
  const { id } = await params;

  // Try JSON first
  const jsonPath = path.join(STORIES_DIR, `${id}.json`);
  if (fs.existsSync(jsonPath)) {
    const story = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    return NextResponse.json({ story });
  }

  // Try Markdown
  const mdPath = path.join(STORIES_DIR, `${id}.md`);
  if (fs.existsSync(mdPath)) {
    const md = fs.readFileSync(mdPath, 'utf-8');
    const story = parseStory(md);
    return NextResponse.json({ story });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const { id } = await params;
  const filePath = path.join(STORIES_DIR, `${id}.json`);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return NextResponse.json({ deleted: true });
}
