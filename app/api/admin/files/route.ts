import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const WORKSPACE_ROOT = '/workspace';

export async function GET(req: NextRequest) {
  const rawPath = req.nextUrl.searchParams.get('path') ?? WORKSPACE_ROOT;

  // Prevent path traversal outside workspace
  const resolved = path.resolve(rawPath);
  if (!resolved.startsWith(WORKSPACE_ROOT)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const names = await readdir(resolved);
    const entries = await Promise.all(
      names.map(async (name) => {
        const fullPath = path.join(resolved, name);
        const s = await stat(fullPath);
        return {
          name,
          type: s.isDirectory() ? 'dir' : 'file',
          size: s.isFile() ? s.size : undefined,
        };
      })
    );
    // Dirs first, then files
    entries.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: 'Cannot read directory' }, { status: 404 });
  }
}
