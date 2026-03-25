import { aiClient, TEXT_MODEL } from './client';

export interface AnalyzedShot {
  order: number;
  visualPrompt: string;
  cameraAngle: string;
  mood: string;
}

export interface AnalyzedFragment {
  order: number;
  type: 'environmental' | 'interaction' | 'tension' | 'dialogue' | 'action';
  content: string;
  shots: AnalyzedShot[];
}

export interface AnalyzedAsset {
  name: string;
  type: 'character' | 'scene';
  description: string;
  prompt: string;
}

export interface ScriptAnalysisResult {
  fragments: AnalyzedFragment[];
  assets: AnalyzedAsset[];
}

export async function analyzeScript(scriptText: string): Promise<ScriptAnalysisResult> {
  const response = await aiClient.chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content: `你是一个专业的漫剧编剧和分镜师。请分析随后提供的剧本，并深度完成以下任务：

1. **片段划分 (Fragmenting)**：将剧本划分为逻辑连贯、具有叙事节奏感的片段。
2. **多重分镜设计 (Multi-Shot Design)**：**每个片段必须设计 3 到 5 个关键分镜**。分镜应涵盖全景、中景、特写等多种视距，以体现电影感的叙事。
3. **全面资产提取 (Full Asset Extraction)**：
    - **角色 (Character)**：识别出剧本中出现的所有重要角色。
    - **场景 (Scene)**：识别出剧本涉及的所有核心场景。
    - **视觉提示词 (Visual Prompt)**：为每一个角色和场景编写极其详细、艺术感强的视觉提示词（用于 AI 绘图）。提示词应包含：长相、穿着、质感、光影、环境细节等。

请严格返回以下格式的 JSON，不要包含任何多余文字：
{
  "fragments": [
    {
      "type": "action/dialogue/environmental/tension/interaction",
      "content": "该片段涉及的剧本原文",
      "shots": [
        {
          "visualPrompt": "画面详细描述：包含构图、光影风格、角色动作、画面氛围",
          "cameraAngle": "特写/中景/全景/俯拍/低角度等",
          "mood": "紧张/唯美/阴森/明快等"
        }
      ]
    }
  ],
  "assets": [
    {
      "name": "资产名称",
      "type": "character/scene",
      "description": "简要背景描述",
      "prompt": "资产的详细视觉描述。如果是角色，请重点描述：面部特征、发型、眼神、具体穿着细节、标志性物品等，以便生成极其真实的真人感全身照片（Photorealistic full body photo）。如果是场景，请描述：空间布局、核心物件、光影基调等。"
    }
  ]
}
注意：
1. **中性描述 (Neutral Description)**：在编写提示词和描述时，请保持视觉中性。**绝对禁止**加入任何特定风格词汇（如：'国风'、'手绘'、'漫画风'、'3D'等），除非剧本原文明确要求。风格将由后续的全局设置决定。
2. **物理特征为主**：重点描述角色的五官、发型、具体服装材质、场景的建筑结构、物品摆放等客观物理属性。
3. **资产列表不为空**：请务必确保 "assets" 列表不为空，除非剧本中确实没有任何角色或场景。`
      },
      {
        role: 'user',
        content: scriptText
      }
    ],
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('AI 返回内容为空');
  }

  try {
    // Attempt to extract JSON if it's wrapped in markdown code blocks
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    
    const result = JSON.parse(jsonString.trim());
    return {
      fragments: Array.isArray(result.fragments) ? result.fragments : [],
      assets: Array.isArray(result.assets) ? result.assets : []
    };
  } catch (error) {
    console.error('Failed to parse AI response:', content);
    throw new Error('AI 返回内容格式解析失败。请重试或检查剧本内容。');
  }
}
