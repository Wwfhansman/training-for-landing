import { VIDEO_API_BASE, VIDEO_API_KEY, VIDEO_MODEL } from './client';
import fs from 'fs/promises';
import path from 'path';

interface VideoCreateResponse {
  id: string;
  status: string;
}

interface VideoStatusResponse {
  id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'processing' | 'succeed' | 'success' | 'submitted';
  task_result?: {
    videos: { id: string; url: string; duration: string }[];
  };
  error?: { code: string; message: string };
}

export async function createVideoTask(
  firstFrameImagePath: string,
  prompt: string,
  options: {
    size?: string;
    mode?: 'std' | 'pro';
    seconds?: '5' | '10';
    lastFrameImagePath?: string;
  } = {}
): Promise<string> {
  const getArg = async (path: string) => {
    if (path.startsWith('http')) return path;
    const absolutePath = require('path').join(process.cwd(), 'public', path);
    const imageBuffer = await require('fs').promises.readFile(absolutePath);
    return imageBuffer.toString('base64');
  };

  const image_list: any[] = [
    { image: await getArg(firstFrameImagePath), type: 'first_frame' }
  ];

  if (options.lastFrameImagePath) {
    image_list.push({ image: await getArg(options.lastFrameImagePath), type: 'end_frame' });
  }

  async function submitWithRetry(attempt: number = 0): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(`${VIDEO_API_BASE}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VIDEO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: VIDEO_MODEL,
          prompt: prompt,
          image_list: image_list,
          sound: 'on',
          size: options.size || '1920x1080',
          mode: options.mode || 'std',
          seconds: options.seconds || '5',
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isNetworkError = err.name === 'AbortError' || err.code === 'UND_ERR_CONNECT_TIMEOUT' || err.message?.includes('timeout');
      if (isNetworkError && attempt < 2) {
        console.warn(`[VIDEO RETRY] Attempt ${attempt + 1} failed (timeout/network), retrying...`);
        return submitWithRetry(attempt + 1);
      }
      throw err;
    }
  }

  const response = await submitWithRetry();

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`视频生成任务开启失败: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const result: VideoCreateResponse = await response.json();
  return result.id;
}

async function fetchWithRetry(url: string, options: RequestInit, timeoutMs: number, maxRetries: number = 2): Promise<Response> {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      const isNetworkError = err.name === 'AbortError' || err.code === 'UND_ERR_CONNECT_TIMEOUT' || err.message?.includes('timeout') || err.message?.includes('ECONNRESET');
      if (!isNetworkError || i === maxRetries) break;
      console.warn(`[RETRY] ${url} failed (attempt ${i + 1}/${maxRetries + 1}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Simple backoff
    }
  }
  throw lastError;
}

export async function getVideoStatus(taskId: string): Promise<VideoStatusResponse> {
  const response = await fetchWithRetry(`${VIDEO_API_BASE}/videos/${taskId}`, {
    headers: { 'Authorization': `Bearer ${VIDEO_API_KEY}` },
  }, 15000); // 15s timeout for status
  
  if (!response.ok) {
    throw new Error(`获取视频状态失败: ${response.status}`);
  }
  
  return response.json();
}

export async function downloadVideo(videoUrl: string, fragmentId: string): Promise<string> {
  const response = await fetchWithRetry(videoUrl, {}, 60000); // 60s timeout for download
  if (!response.ok) throw new Error(`视频文件下载失败: ${response.statusText}`);
  
  const buffer = await response.arrayBuffer();
  const fileName = `${fragmentId}_${Date.now()}.mp4`;
  const uploadDir = path.join(process.cwd(), 'public/uploads/videos');
  const filePath = path.join(uploadDir, fileName);
  
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(filePath, Buffer.from(buffer));

  return `/uploads/videos/${fileName}`;
}
