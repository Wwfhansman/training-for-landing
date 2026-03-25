import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    let project = await prisma.project.findFirst({
      include: {
        fragments: {
          include: {
            shots: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        assets: true,
      },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          title: '我的第一个漫剧项目',
          script: '',
        },
        include: {
          fragments: {
            include: {
              shots: true,
            },
          },
          assets: true,
        },
      });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Fetch project error:', error);
    return NextResponse.json({ error: '无法获取项目数据' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, script, globalStylePrompt } = body;

    if (!id) {
      return NextResponse.json({ error: '项目 ID 缺失' }, { status: 400 });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title,
        script,
        globalStylePrompt,
      },
      include: {
        fragments: {
          include: {
            shots: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        assets: true,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: '更新项目失败' }, { status: 500 });
  }
}
