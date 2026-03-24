# AI 漫剧工作台 — 开发规范文档

> 本文档供 Gemini 开发使用，包含分阶段开发指南、具体实现规范和注意事项。

## 开发阶段总览

| 阶段 | 内容 | 估计工作量 |
|------|------|-----------|
| Phase 0 | 项目初始化 & 基础搭建 | 1h |
| Phase 1 | 布局 & 设计系统 | 2h |
| Phase 2 | 剧本编辑模块 | 3h |
| Phase 3 | 分镜编辑模块 | 3h |
| Phase 4 | 视频渲染模块 | 3h |
| Phase 5 | 打磨 & 错误处理 | 2h |

---

## Phase 0: 项目初始化

### 0.1 创建 Next.js 项目

```bash
cd /Users/goucaicai/Desktop/training-for-landing/aivideo
npx -y create-next-app@latest ./ --typescript --app --src-dir --no-tailwind --eslint --import-alias "@/*" --no-turbopack
```

### 0.2 安装依赖

```bash
npm install openai prisma @prisma/client zustand
npx prisma init --datasource-provider sqlite
```

### 0.3 环境变量

创建 `.env.local`：
```env
QINIU_API_KEY=sk-74c8c906bc95eba19eeadc043411f9ad862eced5b590d9e0f79d113fc5e9a4d1
QINIU_TEXT_BASE_URL=https://openai.sufy.com/v1
QINIU_VIDEO_BASE_URL=https://api.qnaigc.com/v1
TEXT_MODEL=doubao-seed-2.0-lite
IMAGE_MODEL=gemini-3.1-flash-image-preview
VIDEO_MODEL=kling-v3-omni
```

### 0.4 Prisma Schema

将 [02_architecture.md](file:///Users/goucaicai/.gemini/antigravity/brain/95886a9c-0ebb-4dc9-8d48-c9dbf7e0c469/02_architecture.md) 中第四节的完整 Prisma Schema 复制到 `prisma/schema.prisma`，然后：

```bash
npx prisma db push
npx prisma generate
```

### 0.5 Prisma Client 单例

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 0.6 创建目录结构

```bash
mkdir -p public/uploads/images public/uploads/videos
mkdir -p src/components/{layout,script,storyboard,render}
mkdir -p src/lib/ai
mkdir -p src/store
mkdir -p src/types
```

---

## Phase 1: 布局与设计系统

### 1.1 全局样式 (`globals.css`)

使用 [02_architecture.md](file:///Users/goucaicai/.gemini/antigravity/brain/95886a9c-0ebb-4dc9-8d48-c9dbf7e0c469/02_architecture.md) 第九节的 CSS Variables 作为基础，实现：

- 深色主题 CSS Variables（所有颜色、字体、间距、圆角）
- Google Fonts 导入：`Noto Serif`（标题）、`Inter`（正文）
- 全局 `body` 样式：深色背景 + 微点阵背景
- 滚动条自定义样式
- Glass Panel 效果类

> [!IMPORTANT]
> **设计规范要求（参考 Kuro Creative Studio 设计系统）：**
> - **禁止使用 1px 实线 border 做分区**，改用背景色层级变化
> - **禁止使用纯白 #FFFFFF**，最亮文字色为 `#e5e2e1`
> - **禁止使用普通投影**，需用大模糊 + primary 色调透明阴影
> - 主按钮使用 **渐变色**（primary → primary-container, 135deg）
> - AI 相关按钮使用 **tertiary 色 (#FFB95F)**

### 1.2 布局组件

#### TopNav (`src/components/layout/TopNav.tsx`)
- 固定顶部，毛玻璃背景
- 左侧：Logo "Kuro Creative Studio"（Noto Serif 斜体）+ 导航链接（剧本/分镜/渲染）
- 右侧：设置图标

#### SideNav (`src/components/layout/SideNav.tsx`)
- 固定左侧，宽度 240px
- 项目控制台标题
- 导航项：剧本/分镜/渲染（使用 Material Symbols 图标）
- 底部：导出项目按钮 + 帮助中心

#### Root Layout (`src/app/layout.tsx`)
- 引入 Google Fonts
- TopNav + SideNav 包裹子页面
- 主内容区域 `ml-60 mt-16`

### 1.3 页面路由

| 路由 | 页面 |
|------|------|
| `/` | 重定向到 `/script` |
| `/script` | 剧本编辑 |
| `/storyboard` | 分镜编辑 |
| `/render` | 视频渲染 |

---

## Phase 2: 剧本编辑模块

### 2.1 数据流

```
用户输入剧本 → 保存到数据库(Project.script)
                ↓ 点击"AI 片段识别"
          POST /api/script/analyze
                ↓
          LLM 分析返回 JSON
                ↓
          保存 Fragment + Shot 到数据库
                ↓
          前端更新片段列表
```

### 2.2 剧本编辑器 (`ScriptEditor.tsx`)

- 使用 `<textarea>` 或 `contentEditable <div>`（推荐后者以支持高亮）
- 左侧行号列
- 场景标题高亮（tertiary-fixed 色，Noto Serif 斜体）
- 角色名高亮（primary 色，大写，Inter 标签样式）
- 台词缩进 + 斜体
- 底部或顶部显示字数统计 + 自动保存状态

### 2.3 AI 分析 API (`/api/script/analyze/route.ts`)

```typescript
// POST 请求体
{ scriptText: string }

// 处理流程：
// 1. 调用 analyzeScript(scriptText) => Fragment[]
// 2. 删除当前项目的旧 Fragment 和 Shot
// 3. 批量创建新的 Fragment 和 Shot
// 4. 返回完整的 Fragment[] with Shot[]
```

**LLM System Prompt 完整版**（写在 `scriptAnalyzer.ts` 中）：

```
你是一位资深的漫画分镜师和影视导演。请仔细阅读以下剧本，按照场景变化、情绪转折和叙事节奏将其精准划分为多个「画面片段」。

## 划分原则
1. 每个片段应该是一个相对完整的叙事单元（5-30秒的画面）
2. 场景切换必须作为新片段
3. 情绪显著变化时应划分新片段
4. 每个片段应包含 1-4 个分镜(Shot)

## 片段类型
- environmental: 环境渲染/氛围营造
- interaction: 角色互动/对话
- tension: 紧张/冲突/高潮
- dialogue: 纯对话场景
- action: 动作/追逐/战斗

## 分镜描述要求
每个分镜的 visualPrompt 必须是一段详细的画面描述，包含：
- 镜头类型（广角/中景/特写/俯拍/仰拍）
- 画面主体和位置
- 光线和色调
- 环境细节
- 动态元素
- 漫画/动画风格特征

## 返回格式（严格 JSON）
{
  "fragments": [
    {
      "order": 1,
      "type": "environmental",
      "content": "原文内容...",
      "shots": [
        {
          "order": 1,
          "visualPrompt": "广角俯拍。暴雨中的废弃城市，霓虹灯光在积水中形成破碎的倒影...",
          "cameraAngle": "bird_eye",
          "mood": "ominous, desolate"
        }
      ]
    }
  ]
}
```

### 2.4 片段面板 (`FragmentPanel.tsx` + `FragmentCard.tsx`)

- 标题："AI 智能片段划分" + "SMART ANALYSIS" 标签
- 片段列表：垂直排列，可滚动
- 每个 FragmentCard：
  - 左侧彩色竖条（按 type 着色）
  - 标签：`FRAGMENT 01 / ENVIRONMENTAL`
  - 内容摘要（2行截断）
  - 标签图标（天气/角色/动作等）
  - "生成分镜" 按钮
- 底部 Action 区域：
  - "全文本深度分析" + "重新运行 AI 片段识别" 按钮（tertiary 色）

### 2.5 Zustand Store (`useScriptStore.ts`)

```typescript
interface ScriptStore {
  scriptText: string;
  fragments: FragmentWithShots[];
  isAnalyzing: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;

  setScriptText: (text: string) => void;
  analyzeScript: () => Promise<void>;
  fetchFragments: () => Promise<void>;
  updateFragment: (id: string, data: Partial<Fragment>) => void;
  autoSave: () => void; // 防抖 2 秒
}
```

---

## Phase 3: 分镜编辑模块

### 3.1 数据流

```
选择片段 → 加载该片段的 Shot 列表
               ↓ 编辑 visualPrompt
          保存到数据库
               ↓ 点击"生成首帧"
          POST /api/image/generate
               ↓
          Gemini 生成图片(base64)
               ↓
          保存图片到本地
               ↓
          更新 Shot.imageUrl + 前端展示
```

### 3.2 分镜页面 (`/storyboard/page.tsx`)

- 顶部：当前片段信息（`片段 01` / `SCENE WORKSPACE / CINEMATIC NARRATIVE`）
- 右上角：估计 Shot 数量 + "AI ENHANCED" 标签
- 主体：Shot 卡片网格
- 底部：全局风格栏

### 3.3 分镜卡片 (`ShotCard.tsx`)

- 上部图片区域：
  - 未生成：显示占位图标 + "EMPTY CANVAS"
  - 生成中：显示加载动画
  - 已生成：显示首帧图缩略图
- 左上角：`SHOT 01` 编号标签
- 下部：
  - "VISUAL PROMPT" 标签
  - Prompt 文本（可编辑 textarea，2行截断展示/展开编辑）
  - 操作按钮：「⚡ 生成首帧」/「🔄 重新生成」

### 3.4 图片生成 API (`/api/image/generate/route.ts`)

```typescript
// POST 请求体
{
  shotId: string,
  visualPrompt: string,
  globalStylePrompt?: string
}

// 处理流程：
// 1. 更新 Shot.imageStatus = 'generating'
// 2. 调用 generateFirstFrame(visualPrompt, globalStylePrompt, shotId)
// 3. 保存图片到 public/uploads/images/
// 4. 更新 Shot.imageUrl + Shot.imageStatus = 'completed'
// 5. 返回 { imageUrl }
```

> [!IMPORTANT]
> **注意**：`gemini-3.1-flash-image-preview` 的图片生成是通过 `/v1/chat/completions` 接口实现的（不是 `/v1/images/generations`）。需要设置 `modalities: ["image", "text"]` 参数。返回的图片在 `choices[0].message.images[0].image_url.url` 中，格式为 `data:image/png;base64,...`。

### 3.5 全局风格栏 (`StyleBar.tsx`)

- 底部固定栏，毛玻璃效果
- 左侧图标
- 输入框：placeholder "调整全局风格；例如 '增加电影胶片质感' 或 '冷调蓝色'..."
- 参数图标 + Apply 按钮

---

## Phase 4: 视频渲染模块

### 4.1 数据流

```
进入渲染页面 → 加载所有片段(含首帧图)
                    ↓ 设置渲染参数
                    ↓ 点击"开始合成"
               POST /api/video/generate (per fragment)
                    ↓
               返回 taskId → 保存到 Fragment.videoTaskId
                    ↓
               前端轮询 GET /api/video/status?taskId=xxx
                    ↓ status === 'completed'
               下载视频到本地 → 更新 Fragment.videoUrl
                    ↓
               前端展示视频预览
```

### 4.2 渲染页面 (`/render/page.tsx`)

三栏布局：
- **中间（主区域）**：视频合成控制台
  - 标题：`视频合成控制台`
  - 状态指示：`READY FOR INFERENCE` / `SYNTHESIZING 64%`
  - 三联预览区：首帧 | 合成进度 | 尾帧
- **右侧**：推理参数面板
- **底部**：序列时间轴

### 4.3 渲染参数面板 (`RenderParams.tsx`)

| 参数 | 控件 | 默认值 |
|------|------|--------|
| Mode | 按钮组 std / pro | std |
| 视频尺寸 | 下拉选择 | 1920x1080 |
| 视频时长 | 按钮组 5s / 10s | 5 |

### 4.4 视频生成 API

#### `POST /api/video/generate/route.ts`
```typescript
// 请求体
{
  fragmentId: string,
  size?: string,   // "1920x1080"
  mode?: "std" | "pro",
  seconds?: "5" | "10"
}

// 处理流程：
// 1. 查询 Fragment 及其所有 Shot（取第一个 Shot 的首帧图）
// 2. 组装视频 Prompt（片段内容 + 所有 Shot 的 visualPrompt）
// 3. 调用 createVideoTask(firstFrameImagePath, prompt, options)
// 4. 更新 Fragment.videoTaskId + videoStatus = 'queued'
// 5. 返回 { taskId }
```

> [!IMPORTANT]
> **视频 Prompt 拼接策略**：将片段的 content 作为主体描述，附加所有 Shot 的 visualPrompt 作为画面补充，合成一段完整的视频描述 prompt。

#### `GET /api/video/status/route.ts`
```typescript
// 查询参数：?taskId=xxx&fragmentId=yyy

// 处理流程：
// 1. 调用 getVideoStatus(taskId)
// 2. 如果 completed：
//    a. 下载视频到本地
//    b. 更新 Fragment.videoUrl + videoStatus = 'completed'
// 3. 如果 failed：
//    a. 更新 Fragment.videoStatus = 'failed'
// 4. 返回状态信息
```

### 4.5 序列时间轴 (`Timeline.tsx`)

- 横向排列所有片段的视频缩略图
- 每个节点显示：
  - 首帧图缩略图（灰色=未渲染，彩色=已完成）
  - 渲染中动画（旋转图标）
  - 时间信息：`00:00:12:04 / 00:00:24:00`
- 点击可预览对应片段视频

### 4.6 前端轮询逻辑

```typescript
// useRenderStore.ts
startPolling(fragmentId: string, taskId: string) {
  const interval = setInterval(async () => {
    const res = await fetch(`/api/video/status?taskId=${taskId}&fragmentId=${fragmentId}`);
    const data = await res.json();

    if (data.status === 'completed') {
      clearInterval(interval);
      this.updateFragmentVideo(fragmentId, data.videoUrl);
    } else if (data.status === 'failed') {
      clearInterval(interval);
      this.setFragmentError(fragmentId, data.error);
    }
  }, 5000); // 每 5 秒轮询
}
```

---

## Phase 5: 打磨与错误处理

### 5.1 错误处理规范

| 场景 | 处理方式 |
|------|---------|
| AI 分析失败 | Toast 提示 + 重试按钮 |
| 图片生成失败 | 卡片显示错误状态 + 重试按钮 |
| 视频生成失败 | 时间轴标红 + 错误信息 + 重试 |
| 网络超时 | 统一 30s 超时 + 自动重试 1 次 |
| API 限流 | 排队机制 + 提示等待 |

### 5.2 加载状态动画

- 剧本分析中：右侧面板显示脉冲动画
- 首帧图生成中：卡片图片区域显示渐变进度动画
- 视频合成中：三联预览区中间显示合成百分比

### 5.3 自动保存

- 剧本文本变化后 2 秒触发自动保存（防抖）
- 顶部显示保存状态指示器（橙色圆点 + "Auto-Saved"）

### 5.4 导出功能

- "导出项目"按钮 → 将所有已生成的视频文件打包为 zip 下载
- 使用 `archiver` 或类似库

---

## 关键实现注意事项

> [!CAUTION]
> ### API 格式差异
> 用户指定的三个 API 使用了**不同的接口格式**，必须区分处理：
>
> | 功能 | 接口 | Base URL | 格式 |
> |------|------|----------|------|
> | 文本分析 | `POST /v1/chat/completions` | `openai.sufy.com/v1` | OpenAI SDK 兼容 |
> | 图片生成 | `POST /v1/chat/completions` (带 modalities) | `openai.sufy.com/v1` | 自定义扩展 |
> | 视频生成 | `POST /v1/videos` + `GET /v1/videos/:id` | `api.qnaigc.com/v1` | 七牛云自有 API |
>
> - 文本分析可以直接用 OpenAI SDK
> - 图片生成需要用 `fetch` 手动调用（因为 `modalities` 和 `image_config` 是非标准参数）
> - 视频生成完全用 `fetch` 手动调用

> [!WARNING]
> ### 视频模型注意
> 用户指定的模型是 `kling-v3-omni`。根据七牛云文档，当前文档只列出了 `kling-video-o1`、`kling-v2-1`、`kling-v2-5-turbo`。如果 `kling-v3-omni` 在实际调用时报错，应该提供友好的错误提示，并建议用户在 `.env.local` 中切换为 `kling-video-o1`。

> [!NOTE]
> ### 文件存储
> - 所有生成的图片和视频保存在 `public/uploads/` 下
> - Next.js 开发模式下 `public/` 目录会自动被静态服务
> - 文件通过 `/uploads/images/xxx.png` 和 `/uploads/videos/xxx.mp4` 直接访问
