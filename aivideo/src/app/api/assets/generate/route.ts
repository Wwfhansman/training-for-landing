import { NextResponse } from 'next/server';
import { generateFirstFrame } from '@/lib/ai/imageGenerator';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  let assetId: string | undefined;
  try {
    const body = await request.json();
    assetId = body.assetId;

    if (!assetId) {
      return NextResponse.json({ error: '资产 ID 缺失' }, { status: 400 });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { project: true }
    });

    if (!asset) {
      return NextResponse.json({ error: '资产不存在' }, { status: 404 });
    }

    // 1. 更新状态为生成中
    await prisma.asset.update({
      where: { id: assetId },
      data: { imageStatus: 'generating' },
    });

    // 2. 调用 AI 生成图片 (资产专用提示词 + 全局风格)
    let finalPrompt = asset.prompt;
    if (asset.type === 'character') {
      finalPrompt = `${asset.prompt}。真人写实全身照 (Photorealistic full body shot)，真实的人物长相，细腻的皮肤纹理，极其真实的面部细节，专业摄影灯光，高清画质，真实的照片感`;
    }
    
    const result = await generateFirstFrame(finalPrompt, asset.project.globalStylePrompt || '', `asset_${assetId}`);

    // 3. 更新状态为完成并保存路径 (同时保存远程 URL 用于后续参考)
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        imageUrl: result.url,
        remoteImageUrl: result.remoteUrl,
        imageStatus: 'completed',
      },
    });

    return NextResponse.json(updatedAsset);
  } catch (error: any) {
    console.error('Asset image generation error:', error);
    // 尽量尝试更新状态为失败
    try {
      if (assetId) {
        await prisma.asset.update({
          where: { id: assetId },
          data: { imageStatus: 'failed' },
        });
      }
    } catch (dbError) {
      console.error('Failed to update asset status to failed:', dbError);
    }
    return NextResponse.json({ error: '资产图片生成失败: ' + error.message }, { status: 500 });
  }
}
