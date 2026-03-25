import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';

export async function GET() {
  try {
    const videoDir = path.join(process.cwd(), 'public/uploads/videos');
    
    if (!fs.existsSync(videoDir)) {
      return NextResponse.json({ error: '没有已生成的视频可导出' }, { status: 404 });
    }

    const files = fs.readdirSync(videoDir);
    if (files.length === 0) {
      return NextResponse.json({ error: '导出目录为空' }, { status: 404 });
    }

    // Create a zip stream
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    const stream = new ReadableStream({
      start(controller) {
        archive.on('data', (chunk: any) => controller.enqueue(chunk));
        archive.on('end', () => controller.close());
        archive.on('error', (err: any) => controller.error(err));
        
        // Finalize the archive
        archive.directory(videoDir, false);
        archive.finalize();
      }
    });

    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="kuro_project_${Date.now()}.zip"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: '项目导出失败: ' + error.message }, { status: 500 });
  }
}
