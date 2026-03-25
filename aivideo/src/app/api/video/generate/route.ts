import { NextResponse } from 'next/server';
import { createVideoTask } from '@/lib/ai/videoGenerator';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { fragmentId, size, mode, seconds } = await request.json();

    if (!fragmentId) {
      return NextResponse.json({ error: '片段 ID 缺失' }, { status: 400 });
    }

    // 1. 获取片段和首帧图
    const fragment = await prisma.fragment.findUnique({
      where: { id: fragmentId },
      include: { shots: { orderBy: { order: 'asc' } } },
    });

    if (!fragment || fragment.shots.length === 0 || !fragment.shots[0].imageUrl) {
      return NextResponse.json({ error: '片段无首帧图，请先生成首帧图' }, { status: 400 });
    }

    // 2. 获取并整合关联资产提示词
    const assets = await prisma.asset.findMany({
      where: { projectId: fragment.projectId }
    });

    const combinedShotPrompts = fragment.shots.map((s: any) => s.visualPrompt).join('。');
    
    // 识别画面中提到的资产
    const mentionedAssets = assets.filter((a: any) => 
      combinedShotPrompts.toLowerCase().includes(a.name.toLowerCase()) ||
      fragment.content.toLowerCase().includes(a.name.toLowerCase())
    );

    const assetContext = mentionedAssets.map((a: any) => `${a.name}(${a.type}): ${a.prompt}`).join('; ');
    
    // 获取全局风格
    const project = await prisma.project.findUnique({ where: { id: fragment.projectId } });
    const styleSuffix = project?.globalStylePrompt ? `。风格：${project.globalStylePrompt}` : '';

    const prompt = `[资产参考：${assetContext}]。剧本：${fragment.content}。画面动作描述：${combinedShotPrompts}${styleSuffix}`;

    const firstShot = fragment.shots[0];
    const lastShot = fragment.shots.length > 1 ? fragment.shots[fragment.shots.length - 1] : null;

    const imageToUse = firstShot.remoteImageUrl || firstShot.imageUrl;
    const lastImageToUse = lastShot ? (lastShot.remoteImageUrl || lastShot.imageUrl) : undefined;
    
    if (!imageToUse) {
       return NextResponse.json({ error: '分镜无图片，请先生成分镜图' }, { status: 400 });
    }

    const taskId = await createVideoTask(imageToUse, prompt, { 
      size, 
      mode, 
      seconds,
      lastFrameImagePath: lastImageToUse 
    });

    // 4. 更新数据库
    await prisma.fragment.update({
      where: { id: fragmentId },
      data: {
        videoTaskId: taskId,
        videoStatus: 'queued',
      },
    });

    return NextResponse.json({ taskId });
  } catch (error: any) {
    console.error('Video task creation error:', error);
    return NextResponse.json({ error: '视频任务创建失败: ' + error.message }, { status: 500 });
  }
}
