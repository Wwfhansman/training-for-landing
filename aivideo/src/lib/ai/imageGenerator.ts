import fs from 'fs/promises';
import path from 'path';

const API_BASE = 'https://api.qnaigc.com/v1';

export async function generateFirstFrame(
  visualPrompt: string,
  globalStylePrompt: string,
  shotId: string,
  referenceImage?: string
): Promise<{ url: string; remoteUrl: string }> {
  // 进一步清理提示词，移除可能引起困扰的括号和过于沉重的词汇进行测试
  const cleanedStyle = globalStylePrompt?.replace(/[\[\]\(\)]/g, '') || '';
  const cleanedPrompt = visualPrompt.replace(/[\[\]\(\)]/g, '');
  
  const fullPrompt = cleanedStyle
    ? `${cleanedPrompt}。风格提示：${cleanedStyle}。 High-end cinematic, photorealistic, real human skin texture, highly detailed, 8k resolution, masterpiece, professional lighting`
    : `${cleanedPrompt}。 Photorealistic, real human, high quality, 8k`;

  const negativePrompt = "anime, cartoon, 3d, 3d render, stylized, unreal engine, computer graphic, drawing, illustration, painting, sketch, low quality, blurry, deformed, watermark";

  if (!process.env.QINIU_API_KEY) {
    throw new Error('环境变量 QINIU_API_KEY 缺失，请检查 .env.local 文件');
  }

  // 1. 提交生成任务
  const requestBody: any = {
    model: 'kling-v2', // 使用最标准的 kling-v2
    prompt: fullPrompt, 
    negative_prompt: negativePrompt,
    aspect_ratio: '16:9'
  };

  if (referenceImage) {
    requestBody.image = referenceImage;
    // 注意：v2 模型不需要显式传 image_reference，它会自动识别主体
  }

  console.log('Submitting Kling task with body:', JSON.stringify(requestBody, null, 2));

  const submitResponse = await fetch(`${API_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.QINIU_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!submitResponse.ok) {
    const errorText = await submitResponse.text();
    console.error(`Kling API Error (${submitResponse.status}):`, errorText);
    throw new Error(`图片生成任务提交错误: ${submitResponse.status} ${errorText}`);
  }

  const { task_id } = await submitResponse.json();
  if (!task_id) {
    throw new Error('提交失败：未返回 task_id');
  }

  // 2. 轮询任务状态
  let imageUrl = '';
  let retryCount = 0;
  const maxRetries = 60; // 最多轮询 120 秒 (2s * 60)

  console.log(`Polling Kling task ${task_id}...`);
  while (retryCount < maxRetries) {
    const statusResponse = await fetch(`${API_BASE}/images/tasks/${task_id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.QINIU_API_KEY}`,
      },
    });

    if (!statusResponse.ok) {
      console.warn(`轮询状态失败: ${statusResponse.status}，重试中...`);
    } else {
      const result = await statusResponse.json();
      console.log(`Task ${task_id} status: ${result.status}`);
      
      if (result.status === 'succeed') {
        imageUrl = result.data?.[0]?.url;
        break;
      } else if (result.status === 'failed') {
        throw new Error(`Kling 任务生成失败: ${result.status_message || '未知错误'}`);
      }
    }

    retryCount++;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  if (!imageUrl) {
    throw new Error('图片生成超时：模型响应过慢或任务丢失，请稍后重试。');
  }

  // 3. 下载并保存到本地
  const fileName = `${shotId}_${Date.now()}.png`;
  const uploadDir = path.join(process.cwd(), 'public/uploads/images');
  const filePath = path.join(uploadDir, fileName);
  await fs.mkdir(uploadDir, { recursive: true });

  console.log(`Downloading result from ${imageUrl}...`);
  const imgResponse = await fetch(imageUrl);
  if (!imgResponse.ok) throw new Error(`无法从远程 URL 下载图片: ${imgResponse.statusText}`);
  const buffer = await imgResponse.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(buffer));

  return {
    url: `/uploads/images/${fileName}`,
    remoteUrl: imageUrl
  };
}
