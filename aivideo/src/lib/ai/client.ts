import OpenAI from 'openai';

// AI client for text analysis and image generation (OpenAI compatible)
export const aiClient = new OpenAI({
  apiKey: process.env.QINIU_API_KEY,
  baseURL: process.env.QINIU_TEXT_BASE_URL || 'https://openai.sufy.com/v1',
});

// Native Qiniu AI settings for video generation
export const VIDEO_API_BASE = process.env.QINIU_VIDEO_BASE_URL || 'https://api.qnaigc.com/v1';
export const VIDEO_API_KEY = process.env.QINIU_API_KEY || '';
export const VIDEO_MODEL = process.env.VIDEO_MODEL || 'kling-v3-omni';
export const TEXT_MODEL = process.env.TEXT_MODEL || 'doubao-seed-2.0-lite';
export const IMAGE_MODEL = process.env.IMAGE_MODEL || 'gemini-3.1-flash-image-preview';
