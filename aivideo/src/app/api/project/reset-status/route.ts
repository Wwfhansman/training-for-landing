import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: '项目 ID 缺失' }, { status: 400 });
    }

    // 重置所有生成中的状态为 idle
    await prisma.$transaction([
      prisma.shot.updateMany({
        where: { fragment: { projectId }, imageStatus: 'generating' },
        data: { imageStatus: 'idle' }
      }),
      prisma.fragment.updateMany({
        where: { projectId, videoStatus: 'queued' },
        data: { videoStatus: 'idle' }
      }),
      prisma.fragment.updateMany({
        where: { projectId, videoStatus: 'in_progress' },
        data: { videoStatus: 'idle' }
      }),
      prisma.asset.updateMany({
        where: { projectId, imageStatus: 'generating' },
        data: { imageStatus: 'idle' }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
