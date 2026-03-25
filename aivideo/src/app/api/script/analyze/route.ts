import { NextResponse } from 'next/server';
import { analyzeScript } from '@/lib/ai/scriptAnalyzer';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { scriptText, projectId } = await request.json();

    if (!scriptText || !projectId) {
      return NextResponse.json({ error: '剧本文本或项目 ID 缺失' }, { status: 400 });
    }

    // 1. 调用 AI 分析 (提取片段、分镜及资产)
    const { fragments: fragmentsData = [], assets: assetsData = [] } = await analyzeScript(scriptText);
    
    console.log('AI Analysis Result:', JSON.stringify({ fragmentsCount: fragmentsData.length, assetsCount: assetsData.length }, null, 2));
    if (assetsData.length > 0) {
      console.log('Sample Assets:', JSON.stringify(assetsData.slice(0, 2), null, 2));
    }

    // 2. 清理旧数据并保存新数据 (Transaction)
    const result = await prisma.$transaction(async (tx: any) => {
      // 删除旧片段（级联删除分镜）和旧资产
      await tx.fragment.deleteMany({ where: { projectId } });
      await tx.asset.deleteMany({ where: { projectId } });

      // 保存资产
      for (const asset of assetsData) {
        await tx.asset.create({
          data: {
            ...asset,
            projectId,
          }
        });
      }

      // 保存片段和分镜
      const createdFragments = [];
      for (let i = 0; i < fragmentsData.length; i++) {
        const f = fragmentsData[i];
        const fragment = await tx.fragment.create({
          data: {
            projectId,
            order: i + 1,
            type: f.type,
            content: f.content,
            shots: {
              create: f.shots.map((s: any, idx: number) => ({
                visualPrompt: s.visualPrompt,
                cameraAngle: s.cameraAngle,
                mood: s.mood,
                order: idx + 1,
                imageStatus: 'idle',
              })),
            },
          },
          include: { shots: true },
        });
        createdFragments.push(fragment);
      }
      
      // 更新剧本内容
      await tx.project.update({
        where: { id: projectId },
        data: { script: scriptText }
      });

      return createdFragments;
    });

    return NextResponse.json({ fragments: result });
  } catch (error) {
    console.error('Script analysis error:', error);
    return NextResponse.json({ error: '剧本分析失败' }, { status: 500 });
  }
}
