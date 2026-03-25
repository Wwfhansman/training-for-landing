import { NextResponse } from 'next/server';
import { getVideoStatus, downloadVideo } from '@/lib/ai/videoGenerator';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');
  const fragmentId = searchParams.get('fragmentId');

  if (!taskId || !fragmentId) {
    return NextResponse.json({ error: '任务 ID 或片段 ID 缺失' }, { status: 400 });
  }

  try {
    const statusResult = await getVideoStatus(taskId);
    console.log(`[VIDEO STATUS] Task ${taskId}:`, JSON.stringify(statusResult));

    const isSucceed = statusResult.status === 'completed' || statusResult.status === 'succeed' || statusResult.status === 'success';
    const isProcessing = statusResult.status === 'in_progress' || statusResult.status === 'processing' || statusResult.status === 'queued';
    const isFailed = statusResult.status === 'failed';

    if (isSucceed) {
      // 兼容不同的结果返回格式 (task_result.videos 或 data[0].url)
      const rawUrl = statusResult.task_result?.videos?.[0]?.url || (statusResult as any).data?.[0]?.url;
      
      if (rawUrl) {
        // 下载视频
        const videoUrl = await downloadVideo(rawUrl, fragmentId);
        
        // 更新数据库
        await prisma.fragment.update({
          where: { id: fragmentId },
          data: {
            videoUrl,
            videoStatus: 'completed',
          },
        });

        return NextResponse.json({ status: 'completed', videoUrl });
      }
    } else if (isFailed) {
      console.error(`[VIDEO FAILED] Task ${taskId}:`, JSON.stringify(statusResult.error || 'Unknown Error'));
      await prisma.fragment.update({
        where: { id: fragmentId },
        data: { videoStatus: 'failed' },
      });
      return NextResponse.json({ status: 'failed', error: statusResult.error });
    }

    // 更新中间状态
    if (isProcessing) {
       await prisma.fragment.update({
        where: { id: fragmentId },
        data: { videoStatus: 'in_progress' },
      });
    }

    return NextResponse.json({ status: isProcessing ? 'in_progress' : statusResult.status });
  } catch (error: any) {
    const isTransientError = error.name === 'AbortError' || 
                             error.code === 'UND_ERR_CONNECT_TIMEOUT' || 
                             error.message?.includes('timeout') || 
                             error.message?.includes('ECONNRESET') ||
                             error.message?.includes('fetch failed');

    if (isTransientError) {
      console.warn(`[VIDEO STATUS TRANSIENT ERROR] Task ${taskId}: ${error.message}. Returning 'in_progress' to keep poll alive.`);
      return NextResponse.json({ status: 'in_progress' });
    }

    console.error(`[VIDEO STATUS CRITICAL ERROR] Task ${taskId}:`, error);
    return NextResponse.json({ error: '状态查询失败: ' + error.message }, { status: 500 });
  }
}
