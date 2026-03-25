import { NextResponse } from 'next/server';
import { generateFirstFrame } from '@/lib/ai/imageGenerator';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { shotId, visualPrompt, globalStylePrompt } = await request.json();

    if (!shotId || !visualPrompt) {
      return NextResponse.json({ error: '分镜 ID 或 Prompt 缺失' }, { status: 400 });
    }

    // 1. 获取片段和资产信息
    const shot = await prisma.shot.findUnique({
      where: { id: shotId },
      include: { fragment: true }
    });

    if (!shot) return NextResponse.json({ error: '分镜不存在' }, { status: 404 });

    const assets = await prisma.asset.findMany({
      where: { projectId: shot.fragment.projectId }
    });

    // 2. 整合关联资产提示词 (支持更模糊的角色匹配)
    const mentionedAssets = assets.filter((a: any) => {
      const name = a.name.toLowerCase().trim();
      const prompt = visualPrompt.toLowerCase();
      // 支持全词匹配或主名称匹配 (处理 "角色A (描述)" 这种情况)
      const baseName = name.split(/[\s\(（]+/)[0];
      return prompt.includes(name) || (baseName.length > 1 && prompt.includes(baseName));
    });

    // 打印调试信息，确认为什么没有命中参考图
    console.log(`--- [DEBUG] Shot ${shotId} Asset Matching ---`);
    console.log(`Visual Prompt: ${visualPrompt}`);
    mentionedAssets.forEach((a: any) => {
      console.log(`Found Matching Asset: "${a.name}" (Type: ${a.type}), Remote URL: ${a.remoteImageUrl ? 'EXISTS' : 'MISSING'}`);
    });
    // [关键逻辑]：提取参考图，优先人物，其次场景
    const charAsset = mentionedAssets.find((a: any) => a.type === 'character' && a.remoteImageUrl);
    const sceneAsset = mentionedAssets.find((a: any) => a.type === 'scene' && a.remoteImageUrl);
    
    // 优先使用角色图作为参考（保证人物一致性），如果没有角色则使用场景图（保证环境一致性）
    const referenceImage = (charAsset || sceneAsset)?.remoteImageUrl;

    const assetPrompts = mentionedAssets.map((a: any) => `${a.name}(${a.type}): ${a.prompt}`).join('; ');
    const combinedPrompt = assetPrompts 
      ? `关联资产参考：[ ${assetPrompts} ]。详细画面执行：${visualPrompt}`
      : visualPrompt;

    console.log(`Final Decision: Mentioned=${mentionedAssets.length}, Use Reference Image=${referenceImage ? 'YES' : 'NO'}`);

    // 3. 更新状态为生成中
    await prisma.shot.update({
      where: { id: shotId },
      data: { imageStatus: 'generating' },
    });

    // 4. 调用 AI 生成图片 (传递参考图给集成后的调用)
    const result = await generateFirstFrame(combinedPrompt, globalStylePrompt || '', shotId, referenceImage || undefined);

    // 5. 更新状态为完成并保存路径
    const updatedShot = await prisma.shot.update({
      where: { id: shotId },
      data: {
        imageUrl: result.url,
        remoteImageUrl: result.remoteUrl,
        imageStatus: 'completed',
      },
    });

    return NextResponse.json(updatedShot);
  } catch (error: any) {
    console.error('Image generation error:', error);
    
    // 如果失败，尝试更新状态为 failed
    try {
      const body = await request.clone().json();
      if (body.shotId) {
        await prisma.shot.update({
          where: { id: body.shotId },
          data: { imageStatus: 'failed' },
        });
      }
    } catch (e) {}

    return NextResponse.json({ error: '图片生成失败: ' + error.message }, { status: 500 });
  }
}
